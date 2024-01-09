import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  order_id: string;

  @Column('int', { comment: '1000 锁单,预下单(5min) 1001-已下单,待支付(锁15min) 1002-取消订单; 2001-支付成功 2002-支付失败; 3001-交易成功 3002-交易失败' })
  order_status: number;

  @Column('int', { comment: '0 - 未push,1-已push' })
  push_status: number;

  @Column('varchar', { length: 13, comment: '预下单时间, 格式时间戳' })
  order_time: string;

  @Column('varchar', { length: 13, default: '', comment: '创建支付单时间, 格式时间戳' })
  create_pay_order_time: string;

  @Column('varchar', { length: 13, default: '', comment: '支付时间, 格式时间戳' })
  payment_order_time: string;

  @Column('varchar', { length: 48, comment: '购买用户的id' })
  student_id: string;

  @Column('varchar', { length: 48, comment: '下单的会议' })
  meeting_id: string;

  @Column('varchar', { length: 48 })
  meeting_teacher_id: string;

  @Column('varchar', { length: 45 })
  meeting_teacher_fname: string;

  @Column('varchar', { length: 45 })
  meeting_teacher_lname: string;

  @Column('double', { comment: '价格' })
  price: number;

  @Column('varchar', { length: 48, default: '', comment: '支付订单' })
  payment_order: string;

  @Column('int', { default: 0, comment: '支付类型; 1: PayPal' })
  payment_type: string;

  @Column('int', { comment: '状态: 0 - 无效; 1 - 有效' })
  status: number;

  // paypal信息

  @CreateDateColumn({ nullable: true })
  ctime: Date;

  @UpdateDateColumn({ nullable: true })
  mtime: Date | null;
}
