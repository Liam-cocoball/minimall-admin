import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Order } from '../entity/Order'
import { Goods, GoodsInfo } from '../entity/Goods'
import { User } from '../entity/User'
import { MessageInfo } from "../tip/tip"
import { wxPaySign, timestampInSeconds } from "../tools/tools"
import { OrderConfig } from "../config"
import { validationResult } from 'express-validator';
import { nanoid } from "../index"
import axios from "axios"
import FormData = require("form-data")




export class OrderController {
    private orderRepository = AppDataSource.getRepository(Order)
    private goodsInfoRepository = AppDataSource.getRepository(GoodsInfo)
    private userRepository = AppDataSource.getRepository(User)

    // 支付通知地址（蓝兔回调此地址，修改订单状态）
    async notifyUrl(request: Request, response: Response, next: NextFunction) {
        // 参数意思地址：https://www.ltzf.cn/doc
        const {
            code,
            timestamp,
            mch_id,
            order_no,
            out_trade_no,
            pay_no,
            total_fee,
            sign,
            pay_channel,
            trade_type,
            success_time,
            attach,
            openid
        } = request.body
        // 验证sign是否正确，避免假回调
        console.log(code,
            timestamp,
            mch_id,
            order_no,
            out_trade_no,
            pay_no,
            total_fee,
            sign,
            pay_channel,
            trade_type,
            success_time,
            attach,
            openid)
        try {
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                // 根据out_trade_no和mch_id查询对应订单。判断订单状态。成功直接返回 失败查询code是否成功，成功就需要修改订单状态
                let order: Order
                const ordertem = await transactionalEntityManager.find(Order, {
                    where: { mchId: mch_id, orderNumber: out_trade_no },
                })
                if (!ordertem) {
                    throw new Error('order: ' + out_trade_no + ' not font')
                }
                if (order.state === 1) {
                    return { code: 'SUCCESS' }
                }
                //处理订单
                code === 0 ? order.state = 1 : order.state = 0
                order = await transactionalEntityManager.save(order)
                if (!order) {
                    throw new Error('update order fail')
                }
            })
        } catch {
            return { code: 'FAIL' }
        }
        return { code: 'SUCCESS' }
    }

    //创建订单
    async createOrder(request: Request, response: Response, next: NextFunction) {
        // 验证参数是否合法
        const result = validationResult(request)
        if (result.array().length > 0) {
            return { code: 501, message: MessageInfo.Fail, data: result.array() }
        }
        const { email, goodsId, playFunc, userId, count } = request.body
        // 生成订单
        const order = new Order()
        order.email = email
        order.orderNumber = 'MM' + nanoid() + timestampInSeconds()
        // 判断商品是否存在
        const gooddsInfo = await this.goodsInfoRepository.findOneBy({ id: goodsId })
        if (!gooddsInfo) {
            return { code: 500, msg: MessageInfo.GetGoodsFail, data: {} }
        }
        order.goodsId = goodsId
        order.playMoney = gooddsInfo.couponPrice
        // 判断数量不能大于库存
        if (count > gooddsInfo.inventory) {
            return { code: 500, msg: MessageInfo.Inventory, data: {} }
        }
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
        // 有user就判断userid是否正常
        if (userId) {
            const user = await this.userRepository.findOneBy({ id: userId })
            if (!user) {
                return { code: 500, msg: MessageInfo.UserNotFoundFail, data: {} }
            }
            order.userId = user.id
        }
        let lantudata: any
        try {
            await this.orderRepository.save(order)
            //事务 保存订单 并且减去库存
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                // 减去库存
                if (order.count > gooddsInfo.inventory) {
                    throw new Error("商品库存不足，创建订单失败")
                }
                gooddsInfo.inventory = gooddsInfo.inventory - order.count
                await transactionalEntityManager.save(gooddsInfo).catch(er => {
                    console.log("减去库存错误: ", er)
                })
                // 查询商品
                const goods = await transactionalEntityManager.findOneBy(Goods, { id: gooddsInfo.goodsId })
                if (!goods) {
                    throw new Error("查询商品错误")
                }
                // 发送支付请求
                const params = {
                    mch_id: OrderConfig.mchId,
                    out_trade_no: order.orderNumber,
                    total_fee: order.playMoney.toString(),
                    body: goods.name + goods.title,
                    timestamp: timestampInSeconds().toString(),
                    notify_url: OrderConfig.notify_url,
                    time_expire: OrderConfig.timeExpire
                }
                // 签名
                const sign = wxPaySign(params, OrderConfig.mchSign)
                order.sign = sign
                console.log('订单数据：', order)
                await transactionalEntityManager.save(order).catch(er => {
                    console.log("保存订单错误: ", er)
                })
                Object.defineProperties(params, {
                    return_url: {
                        value: OrderConfig.return_url + '?orderNumber=' + order.orderNumber,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    sign: {
                        value: sign,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    }
                })
                console.log('请求参数：', params)
                const formData = new FormData()
                Object.keys(params).forEach(key => {
                    formData.append(key, params[key])
                })
                console.log('表单：',formData)
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
                    },
                    (err) => {
                        console.log(err)
                        throw new Error('蓝兔支付地址出错')
                    }
                )
            })
        } catch (err) {
            console.log(err)
            return { code: 500, msg: MessageInfo.OrderCreateFail, data: {} }
        }
        // if (lantudata.code === 0) {
        //     return { code: 500, msg: MessageInfo.OrderCreateFail, data: lantudata }
        // }
        return { code: 200, msg: MessageInfo.OrderCreateSuccess, data: lantudata }
    }

    // 支付回调订单详情页面
    async callbackOrderDetails(request: Request, response: Response, next: NextFunction) {
        let { orderNumber } = request.body
        if (orderNumber === undefined) {
            orderNumber = ''
        }
        let order = await this.orderRepository.findOneBy({ id: orderNumber })
        if (!order) {
            return { code: 500, msg: MessageInfo.OrderNotFont, data: {} }
        }
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
                updateTime: order.updateTime
            }
        }
    }

}

