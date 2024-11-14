import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Content } from './Content'

@Entity('order')
export class Order {
    @PrimaryGeneratedColumn("uuid")
    id: number;
    // 订单号：MM+用户id+当前时间戳秒
    @Column({ name: 'order_number', type: 'varchar', length: 20 })
    orderNumber: string
    // 商品id
    @Column({ name: 'goods_id', type: 'bigint' })
    goodsId: number
    // 支付金额
    @Column({ name: 'play_money', type: 'decimal', precision: 10, scale: 2 })
    playMoney: number
    // 购买数量
    @Column()
    count: number
    // 支付方式 1- 微信 2-支付宝 3-余额
    @Column({ name: 'play_func' })
    playFunc: number
    // 状态：1-支付成功	-1：待支付（默认值）0-支付失败，订单超时
    @Column({ default: -1 })
    state: number
    // 用户id：（有id就是用户，没有就是游客）
    @Column({ name: 'user_id', type: 'bigint' })
    userId: number
    // 邮箱：（唯一，不重复，提供给游客查询订单的）
    @Column()
    email: string
    // 商户id
    @Column({ name: 'mch_id' })
    mchId: number
    // 创建此订单密钥
    @Column()
    sign: string
    // 创建时间
    @CreateDateColumn({ name: 'create_time' })
    createTime: string
    // 修改时间
    @UpdateDateColumn({ name: 'update_time' })
    updateTime: string
}

// 支付通知回调参数
// export class NotifyUrlData {
//     code: ''
//     timestamp: ''
//     mch_id: ''
//     order_no: ''
//     out_trade_no: ''
//     pay_no: ''
//     total_fee: ''
//     sign: ''
//     pay_channel: ''
//     trade_type: ''
//     success_time: ''
//     attach: ''
//     openid: ''
// }
