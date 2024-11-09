import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"

import { GoodsType, GoodsSpecs, GoodsSpecsInfo, Goods, GoodsInfo, GoodsTarg } from '../entity/Goods'
import { GoodsTypeRes } from '../domain/Goods'
import { generationToken, storeUserPassword, currentFormattedTime } from "../tools/tools"
import { In } from "typeorm";

import { MessageInfo } from "../tip/tip"
import { body, validationResult } from 'express-validator';
import { Console } from "console"


export class GoodsController {

    private goodsRepository = AppDataSource.getRepository(Goods)
    private goodsTypeRepository = AppDataSource.getRepository(GoodsType)
    private goodsTargRepository = AppDataSource.getRepository(GoodsTarg)
    private goodsInfoRepository = AppDataSource.getRepository(GoodsInfo)
    private goodsSpecsRepository = AppDataSource.getRepository(GoodsSpecs)
    private goodsSpecsInfoRepository = AppDataSource.getRepository(GoodsSpecsInfo)


    // 获取首页商品分类
    async getGoodsTypeList(request: Request, response: Response, next: NextFunction) {
        let err = undefined
        let goodsType: GoodsType[] = []
        // 获取商品分类
        await this.goodsTypeRepository.find().then(
            res => {
                goodsType = res
            },
            er => {
                err = er
            })
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetGoodsTypeFail }
        }
        return { code: 200, message: MessageInfo.Success, data: goodsType }
    }

    // 获取首页数据
    async getGoodsList(request: Request, response: Response, next: NextFunction) {
        let err = undefined
        let goodsType: GoodsType[] = []
        // 获取商品分类
        await this.goodsTypeRepository.find({ cache: true }).then(
            res => {
                goodsType = res
            },
            er => {
                err = er
            })
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetGoodsTypeFail }
        }
        // 查询商品
        for (let index = 0; index < goodsType.length; index++) {
            const element = goodsType[index];
            await this.goodsRepository.findBy({ goodsTypeId: element.id }).then(res => {
                goodsType[index].goodsAll = res
            }, (er => {
                err = er
            }))
            if (err !== undefined) {
                break
            }
        }
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetGoodsFail }
        }
        ii: for (let i = 0; i < goodsType.length; i++) {
            const e1 = goodsType[i];
            jj: for (let j = 0; j < e1.goodsAll.length; j++) {
                // 查询标签
                const e2 = e1.goodsAll[j];
                await this.goodsTargRepository.findBy({ id: In(e2.targ) }).then(res => {
                    e1.goodsAll[j].goodsTarg = res
                }, er => {
                    err = er
                })
                if (err !== undefined) {
                    break ii
                }
                // 查询推荐商品
                await this.goodsInfoRepository.findBy({ goodsId: e2.id, recommend: 1 }).then(res => {
                    e1.goodsAll[j].goodsInfoAll = res
                }, er => {
                    err = er
                })
                if (err !== undefined) {
                    break ii
                }
            }
        }
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetGoodsFail }
        }
        return { code: 200, message: MessageInfo.Success, data: goodsType }
    }

    // 获取某一个商品分类数据
    async getGoodsTypeByGoods(request: Request, response: Response, next: NextFunction) {
        let { id } = request.body
        let err = undefined
        let goodsType: GoodsType = null
        // 获取商品分类
        await this.goodsTypeRepository.findOneBy({ id }).then(
            res => {
                goodsType = res
            },
            er => {
                err = er
            })
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetGoodsTypeFail }
        }
        // 查询商品
        await this.goodsRepository.findBy({ goodsTypeId: goodsType.id }).then(res => {
            goodsType.goodsAll = res
        }, (er => {
            err = er
        }))
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetGoodsFail }
        }
        ii: for (let j = 0; j < goodsType.goodsAll.length; j++) {
            // 查询标签
            const e2 = goodsType.goodsAll[j];
            await this.goodsTargRepository.findBy({ id: In(e2.targ) }).then(res => {
                goodsType.goodsAll[j].goodsTarg = res
            }, er => {
                err = er
            })
            if (err !== undefined) {
                break ii
            }
            // 查询推荐商品
            await this.goodsInfoRepository.findBy({ goodsId: e2.id, recommend: 1 }).then(res => {
                goodsType.goodsAll[j].goodsInfoAll = res
            }, er => {
                err = er
            })
            if (err !== undefined) {
                break ii
            }
        }
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetGoodsFail }
        }
        return { code: 200, message: MessageInfo.Success, data: goodsType }
    }


    // 获取商品详细
    async getGoodsDetails(request: Request, response: Response, next: NextFunction) {
        let err = undefined
        const { id } = request.body
        let goods: Goods
        await this.goodsRepository.findOne({
            where: {
                id
            }
        }).then(res => {
            goods = res
        }, er => {
            err = er
        })
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetGoodsFail }
        }

        // 查询标签
        await this.goodsTargRepository.findBy({ id: In(goods.targ) }).then(res => {
            goods.goodsTarg = res
        }, er => {
            err = er
        })
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetGoodsTargFail }
        }
        // 查询规格
        await this.goodsSpecsRepository.findBy({ id: In(goods.specsIds) }).then(res => {
            goods.specsAll = res
        }, er => {
            err = er
        })
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetGoodsFail }
        }
        // 查询规格具体值
        await this.goodsSpecsInfoRepository.findBy({ goodsSpecs: In(goods.specsIds) }).then(res => {
            goods.goodsSpecsInfoAll = res
            for (let i = 0; i < goods.specsAll.length; i++) {
                const e1 = goods.specsAll[i];
                for (let j = 0; j < res.length; j++) {
                    const e2 = res[j];
                    if (e1.id == e2.goodsSpecs) {
                        goods.specsAll[i].goodsSpecsInfoAll.push(e2)
                    }
                }
            }
        }, er => {
            err = er
        })
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetGoodsFail }
        }
        // 查询默认规格商品
        await this.goodsInfoRepository.findOne({
            where: {
                goodsId: goods.id,
                recommend: 1
            }
        }).then(res => {
            goods.goodsInfoAll.push(res)
            // 获取当前商品的sku
            for (let i = 0; i < goods.goodsInfoAll.length; i++) {
                const e1 = goods.goodsInfoAll[i];
                let specsInfoIds = e1.specsInfoIds.split(',')
                for (let k = 0; k < specsInfoIds.length; k++) {
                    const e2 = specsInfoIds[k];
                    for (let j = 0; j < goods.goodsSpecsInfoAll.length; j++) {
                        const e3 = goods.goodsSpecsInfoAll[j];
                        if (e2 === e3.id.toString()) {
                            goods.goodsInfoAll[i].goodsSpecsInfoAll.push(e3)
                        }
                    }
                }
            }
        }, er => {
            err = er
        })
        return { code: 200, message: MessageInfo.Success, data: goods }
    }

    // 获取sku
    async getGoodsSku(request: Request, response: Response, next: NextFunction) {
        let err = undefined
        let { goods } = request.body
        console.log(goods.goodsId)
        const skus = goods.goodsSpecsInfoAll
        skus.sort((a, b) => a.id - b.id)
        let skustr = ''
        for (let i = 0; i < skus.length; i++) {
            const e1 = skus[i];
            if (i == skus.length - 1) {
                skustr += e1.id
            } else {
                skustr += e1.id + ','
            }
        }
        console.log(skustr)
        await this.goodsInfoRepository.findOneBy({ goodsId: goods.goodsId, specsInfoIds: skustr }).then(res => {
            goods = res
        }, er => {
            err = er
        })
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetGoodsFail }
        }
        // 查询sku
        await this.goodsSpecsInfoRepository.findBy({ id: In(goods.specsInfoIds.split(',')) }).then(res => {
            goods.goodsSpecsInfoAll = res
        }, er => {
            err = er
        })
        if (err !== undefined) {
            return { code: 500, message: MessageInfo.GetGoodsFail }
        }
        return { code: 200, message: MessageInfo.Success, data: goods }
    }

}

