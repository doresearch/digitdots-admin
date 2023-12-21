import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('meeting')
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  meeting_id: string;

  @Column('varchar', { length: 13, comment: '订单时间, 格式时间戳' })
  order_time: string;

  @Column('varchar', { length: 48, comment: '老师ID' })
  teacher_id: string;

  @Column('double', { comment: '价格' })
  price: number;

  @Column('int', { comment: '状态，0 - 无效；1 - 有效' })
  status: number;

  @Column('int', { comment: '0 - 未预定，1-已预定，不可删除', default: 0 })
  order_status: number;

  @CreateDateColumn({ nullable: true })
  ctime: Date;

  @UpdateDateColumn({ nullable: true })
  mtime: Date | null;
}
