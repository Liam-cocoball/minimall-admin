import { GoodsType, Goods } from '../entity/Goods'


// 首页响应数据
export class GoodsTypeRes extends GoodsType {
    goods: GoodsRes[] = []
}

export class GoodsRes extends Goods {

}