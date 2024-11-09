import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Content } from './Content'

@Entity('answer')
export class Answer extends Content{
    // 标题名字
    @Column({ type: 'varchar', length: 200 })
    name: string
    // 父级id 
    @Column({ type: 'bigint',default:0 })
    parentalId: number

    // 子级
    answer:Answer[] = []
}