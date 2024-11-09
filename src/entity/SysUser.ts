import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Content } from './Content'
// 用户表
@Entity()
export class SysUser extends Content {
    // 头像
    @Column({ type: 'varchar', length: 200, default: '/src/assets/defaultProfile.png' })
    profile: string
    // 账号
    @Column({ type: 'varchar', length: 12 })
    account: string
    // 密码
    @Column({ type: 'varchar', length: 50 })
    password: string
    //电话
    @Column({ type: 'varchar', length: 18, nullable: true })
    phone: string
    // 邮箱
    @Column({ type: 'varchar', length: 18, nullable: true })
    email: string
    // 最后登录时间
    @Column({ type: 'timestamp', name: 'last_time', nullable: true })
    lastTime: string
}