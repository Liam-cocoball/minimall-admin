import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Content } from './Content'
// 商品类型表
@Entity('goods_type')
export class GoodsType extends Content {
    // 商品图片
    @Column({ type: 'text' })
    imagesAddress: string
    // 商品类型名字
    @Column({ type: 'varchar', length: 200 })
    name: string
    // 商品类型排序
    @Column()
    order: number

    // 所有商品
    goodsAll: Goods[] = []
}
// 商品规格表
@Entity('goods_specs')
export class GoodsSpecs extends Content {
    // 规格类型
    @Column({ type: 'varchar', length: 200 })
    name: string
    // 规格顺序（从小到大生成具体的规格，不能随意改变顺序）
    @Column({ type: 'text' })
    order: number
    // 指定商品 规格id
    @Column({ type: 'bigint' })
    goodsId: number

    // 规格值
    goodsSpecsInfoAll: GoodsSpecsInfo[] = []
}
// 商品规格详细值表
@Entity('goods_specs_info')
export class GoodsSpecsInfo extends Content {
    // 规格id
    @Column({ type: 'bigint', name: 'goods_specs' })
    goodsSpecs: number
    // 规格具体名
    @Column({ type: 'varchar', length: 200 })
    value: string
    // 规格详细值顺序（从小到大生成具体的sku，不能随意改变顺序）
    @Column({ type: 'text' })
    order: number
}

// 商品表
@Entity('goods')
export class Goods extends Content {
    // 商品类型名字
    @Column({ type: 'varchar', length: 200 })
    name: string
    // 商品标题
    @Column({ type: 'varchar', length: 500 })
    title: string
    @Column({ type: 'simple-array' })
    images: string
    // 商品标签id
    @Column({ type: 'simple-array' })
    targ: string[]
    // 商品类型id
    @Column({ type: 'bigint', name: 'goods_type_id' })
    goodsTypeId: number
    // 规格类型ids（多个规格值用逗号区分，生成的顺序是按照规格的顺序生成的）
    @Column({ name: 'specs_ids', type: 'simple-array' })
    specsIds: string[]
    // 商品介绍
    @Column({ type: 'text' })
    details: string

    // 规格
    specsAll: GoodsSpecs[] = []
    // 规格值
    goodsSpecsInfoAll: GoodsSpecsInfo[] = []
    // 商品标签
    goodsTarg: GoodsTarg[] = []
    // 商品sku
    goodsInfoAll: GoodsInfo[] = []
}
@Entity('goods_info')
export class GoodsInfo extends Content {
    // 商品id
    @Column({type:'bigint'})
    goodsId: number
    // 规格详细值（多个规格值用逗号区分，生成的顺序是按照规格详细值的顺序生成的）
    @Column({ type: 'text' })
    specsInfoIds: string
    // 商品状态 1、上架（默认值） -1 下架
    @Column({ default: 1 })
    state: number
    // 库存
    @Column({ default: 0 })
    inventory: number
    // 现价
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number
    // 优惠价
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    couponPrice: number
    // 是否推荐显示 1、展示 -1、不展示（默认值）//在某一个商品展示的时候，有多个sku，这个时候就需要有一个sku进行展示
    @Column({ default: -1 })
    recommend: number

    // 规格值
    goodsSpecsInfoAll: GoodsSpecsInfo[] = []
}


@Entity('goods_targ')
export class GoodsTarg extends Content {
    // 标签提示
    @Column({ type: 'varchar', length: 200 })
    name: string
}
