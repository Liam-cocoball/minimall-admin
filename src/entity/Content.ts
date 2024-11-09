import {  PrimaryGeneratedColumn,  CreateDateColumn, UpdateDateColumn } from 'typeorm'
// 所有表都拥有的字段
export abstract class Content {
    // 主键唯一id
    @PrimaryGeneratedColumn({ type: 'bigint'})
    id: number;
    // 创建时间
    @CreateDateColumn({ name: 'create_time' })
    createTime: string
    // 修改时间
    @UpdateDateColumn({ name: 'update_time' })
    updateTime: string

}