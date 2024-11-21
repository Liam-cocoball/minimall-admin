import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Order, OrderE } from '../entity/Order'
import { Goods, GoodsInfo, GoodsSpecsInfo } from '../entity/Goods'
import { MessageInfo } from "../tip/tip"
import { wxPaySign, timestampInSeconds, sendMail, currentFormattedTime, arraysAreEqual } from "../tools/tools"
import { OrderConfig } from "../config"
import { validationResult } from 'express-validator';
import { nanoid } from "../index"
import axios from "axios"
import FormData = require("form-data")
import { Mutex } from 'async-mutex';
import { In } from "typeorm"



export class OrderController {
    private orderRepository = AppDataSource.getRepository(Order)
    private goodsRepository = AppDataSource.getRepository(Goods)
    private goodsInfoRepository = AppDataSource.getRepository(GoodsInfo)
    private goodsSpecsInfoRepository = AppDataSource.getRepository(GoodsSpecsInfo)

    // 互斥锁
    private mutex = new Mutex()

    // 支付通知地址（蓝兔回调此地址，修改订单状态） https://www.ltzf.cn/doc
    async notifyUrl(request: Request, response: Response, next: NextFunction) {
        const { code, timestamp, mch_id, order_no, out_trade_no, pay_no, total_fee, sign, pay_channel, trade_type, success_time, attach, openid } = request.body
        if (code !== '0') {
            return 'FAIL'
        }
        // 验证sign是否正确，避免假回调
        const mySign = wxPaySign({ code, timestamp, mch_id, order_no, out_trade_no, pay_no, total_fee }, OrderConfig.mchSign)
        if (sign !== mySign) {
            console.log('sing 校验失败')
            return 'FAIL'
        }
        // 根据out_trade_no和mch_id查询对应订单。判断订单状态。成功直接返回 失败查询code是否成功，成功就需要修改订单状态
        let ordertem = await this.orderRepository.findOneBy({ mchId: mch_id, orderNumber: out_trade_no })
        if (!ordertem) {
            console.log('未查询到此订单：' + out_trade_no)
            return 'FAIL'
        }
        if (ordertem.state === 1) {
            return 'SUCCESS'
        }
        ordertem.state = 1
        ordertem.isNotify = 1
        ordertem.playTime = currentFormattedTime()
        await this.orderRepository.save(ordertem).then(res => { }, err => {
            console.log('修改订单状态失败：', err)
        })
        // 发送消息通知
        const goods = await this.goodsRepository.findOne({ select: ['name'], where: { id: ordertem.goodsId } })
        await sendMail('2313988763@qq.com', goods.name, '[minimall]: 您有新的订单，请及时处理，订单编号为：' + ordertem.orderNumber)
        return 'SUCCESS'
    }

    //创建订单
    async createOrder(request: Request, response: Response, next: NextFunction) {
        // 验证参数是否合法
        const result = validationResult(request)
        if (result.array().length > 0) {
            return { code: 501, message: MessageInfo.Fail, data: result.array() }
        }
        // 参数
        const { email, goodsId, playFunc, count, skuid } = request.body
        // 生成订单
        let order = new Order()
        order.email = email
        order.count = count
        // 判断支付方式是否是指定的三种方式
        let flag = false
        Object.keys(OrderConfig.playFun).forEach(e => {
            const v = OrderConfig.playFun[e]
            if (playFunc === v) {
                flag = true
            }
        });
        if (!flag) {
            return { code: 500, msg: MessageInfo.PlayFun, data: {} }
        }
        order.playFunc = playFunc
        // 有用户id就保存
        const userInfo = request.userInfo
        if (userInfo) {
            order.userId = userInfo.id
        }
        order.orderNumber = 'MM' + nanoid() + timestampInSeconds()
        let lantudata: any
        //-----------------锁住
        const release = await this.mutex.acquire();
        try {
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                // 查询sku
                const gooddsInfo = await transactionalEntityManager.findOneBy(GoodsInfo, { id: goodsId })
                if (!gooddsInfo) {
                    throw new Error(MessageInfo.Fail)
                }
                // 判断当前下单数量不能大于库存
                if (order.count > gooddsInfo.inventory) {
                    throw new Error("商品库存不足")
                }
                //TODO 用户传入的skuid要和数据库中的skuid比较，防止直接调用接口乱传入参数
                order.skuid = skuid
                // 查询spu
                const goods = await transactionalEntityManager.findOneBy(Goods, { id: gooddsInfo.goodsId })
                if (!goods) {
                    throw new Error("查询商品错误")
                }
                order.goodsInfoId = goodsId
                order.playMoney = parseInt((gooddsInfo.couponPrice * order.count).toFixed(2))
                order.goodsId = goods.id
                order.mchId = OrderConfig.mchId
                // 组合支付请求参数
                const params = {
                    mch_id: OrderConfig.mchId,
                    out_trade_no: order.orderNumber,
                    total_fee: order.playMoney.toString(),
                    body: goods.name,
                    timestamp: timestampInSeconds().toString(),
                    notify_url: OrderConfig.notify_url
                }
                order.sign = wxPaySign(params, OrderConfig.mchSign)// 签名
                Object.defineProperties(params, {
                    return_url: {
                        value: OrderConfig.return_url + '?orderNumber=' + order.orderNumber,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    sign: {
                        value: order.sign,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    time_expire: {
                        value: OrderConfig.timeExpire,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    }
                })
                // 保存订单
                await transactionalEntityManager.save(order).then(res => {
                    order = res
                }).catch(er => {
                    console.log("保存订单错误: ", er, order)
                })
                // 减去库存
                gooddsInfo.inventory = gooddsInfo.inventory - order.count
                await transactionalEntityManager.save(gooddsInfo).catch(er => {
                    console.log("减去库存错误: ", er)
                })
                console.log('支付参数：', params)
                const formData = new FormData()
                Object.keys(params).forEach(key => {
                    formData.append(key, params[key])
                })
                // 发送请求 https://www.ltzf.cn/doc
                await axios({
                    method: OrderConfig.apiMethod,
                    url: OrderConfig.apiUrl,
                    headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    data: formData
                }).then(
                    (res) => {
                        console.log(res.data)
                        lantudata = res.data
                        if (lantudata.code === 1) {
                            throw new Error('蓝兔支付api 响应错误code')
                        }
                        order.lantuPlayData = JSON.stringify(lantudata)
                    },
                    (err) => {
                        console.log(err)
                        throw new Error('蓝兔支付地址出错')
                    }
                )
                await transactionalEntityManager.save(order).catch(err => {
                    console.log(err)
                    throw new Error('订单处理失败')
                })
            })
        } catch (err) {
            console.log(err)
            return { code: 500, msg: MessageInfo.OrderCreateFail, data: {} }
        } finally {
            //-------------释放锁
            release();
        }
        // 蓝兔支付失败
        if (lantudata.code === 1) {
            return { code: 500, msg: MessageInfo.OrderCreateFail, data: lantudata }
        }
        return { code: 200, msg: MessageInfo.OrderCreateSuccess, data: { orderNumber: order.orderNumber } }
    }


    // 支付回调订单详情页面
    async callbackOrderDetails(request: Request, response: Response, next: NextFunction) {
        const result = validationResult(request);
        if (result.array().length > 0) {
            return { code: 501, message: MessageInfo.Fail, data: result.array() }
        }
        const { orderNumber } = request.query
        let order = await this.orderRepository.findOneBy({ orderNumber })
        if (!order) {
            return { code: 500, msg: MessageInfo.OrderNotFont, data: {} }
        }
        // 查找商品
        const goods = await this.goodsRepository.findOneBy({ id: order.goodsId })
        return {
            code: 200, msg: MessageInfo.Success, data: {
                orderNumber: order.orderNumber,
                goodsId: order.goodsId,
                playMoney: order.playMoney,
                count: order.count,
                playFunc: order.playFunc,
                state: order.state,
                userId: order.userId,
                email: order.email,
                createTime: order.createTime,
                updateTime: order.updateTime,
                lantuData: order.lantuPlayData,
                goods: {
                    name: goods.name,
                    title: goods.title
                }
            }
        }
    }

    //TODO 查询订单列表 后期需要优化... 暂时这样写了...
    async orderList(request: Request, response: Response, next: NextFunction) {
        const result = validationResult(request);
        if (result.array().length > 0) {
            return { code: 501, message: MessageInfo.Fail, data: result.array() }
        }
        const { email } = request.query
        // 查询订单
        let orderlist: Order[]
        await this.orderRepository.find({
            select: ['createTime', 'orderNumber', 'goodsId', 'goodsInfoId', 'playMoney', 'playFunc', 'state', 'email', 'count', 'playTime'],
            where: { email }
        }).then(res => {
            orderlist = res
        }, err => {
            console.log(err)
            return { code: 200, msg: MessageInfo.Success, data: {} }
        })
        // 查询商品
        let Ordertemp: OrderE[] = []
        if (orderlist !== undefined) {
            for (let i = 0; i < orderlist.length; i++) {
                const order = new OrderE()
                Object.assign(order, orderlist[i]);
                let goods: Goods
                await this.goodsRepository.findOneBy({ id: order.goodsId }).then(res => {
                    goods = res
                }, err => {
                    console.log(err)
                    return { code: 200, msg: MessageInfo.Fail, data: {} }
                })
                let goodsinfo: GoodsInfo
                await this.goodsInfoRepository.findOneBy({ id: order.goodsInfoId }).then(res => {
                    goodsinfo = res
                }, err => {
                    console.log(err)
                    return { code: 200, msg: MessageInfo.Fail, data: {} }
                })
                let skus: GoodsSpecsInfo[]
                await this.goodsSpecsInfoRepository.find({ select: ['value'], where: { id: In(goodsinfo.specsInfoIds.split(',')) } }).then(res => {
                    skus = res
                }, err => {
                    console.log(err)
                    return { code: 200, msg: MessageInfo.Fail, data: {} }
                })
                order.goods = {
                    name: goods.name,
                    title: goods.title,
                    images: goods.images
                }
                order.goodsinfo = {
                    price: goodsinfo.price,
                    couponPrice: goodsinfo.couponPrice
                }
                const skuvalues: string[] = []
                for (let i = 0; i < skus.length; i++) {
                    skuvalues.push(skus[i].value)
                }
                order.sku = skuvalues
                Ordertemp.push(order)
            }
        }
        return { code: 200, msg: MessageInfo.Success, data: [...Ordertemp] }
    }

}

