import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Content } from './Content'
// 用户表
@Entity()
export class User extends Content {
    // 头像
    @Column({type:'varchar', length: 200, default: '/src/assets/defaultProfile.png' })
    profile: string
    // 账号
    @Column({type:'varchar', length: 12 })
    account: string
    // 密码
    @Column({type:'varchar', length: 50 })
    password: string
    //电话
    @Column({type:'varchar', length: 18, nullable: true })
    phone: string
    // 邮箱
    @Column( {type:'varchar', length: 18, nullable: true })
    email: string
    // 上级
    @Column({type:'varchar', name: 'top_user', length: 10, nullable: true })
    topUser: string
    // 下级
    @Column({type:'simple-array', nullable: true })
    inferior: string[]
    // 余额
    @Column({ default: 0 })
    money: number
    // 等级
    @Column({ default: 1 })
    level: number
    // 支付宝账号
    @Column({ name: 'zfb_account', nullable: true })
    zfbAccount: string
    // 支付宝名字
    @Column({ name: 'zfb_name', nullable: true })
    zfbName: string
    // 最后登录时间
    @Column({type:'timestamp', name: 'last_time',nullable: true })
    lastTime: string
}