import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  order_id: string;

  @Column('int' , {comment: '0 - 锁单，预下单（5min） 1000 - 下单（锁15min） 2000 - 支付完成  2001-支付成功 2002-支付失败 3000 - 交易完成 3001-交易成功 3002-交易失败, 4000 - 取消订单' })
  order_status: string;

  @Column('int' , {comment: '0 - 未push，1-已push'})
  push_status: string;

  @Column('varchar', { length: 13, comment: '订单时间, 格式时间戳' })
  order_time: string;

  @Column('varchar', { length: 32, comment: '购买用户的id' })
  student_id: string;

  @Column('varchar', { length: 32, comment: '下单的会议' })
  meeting_id: string;

  @Column('double', { comment: '价格' })
  price: number;

  @Column('int', { comment: '状态，0 - 无效；1 - 有效' })
  status: number;

  @CreateDateColumn({ nullable: true })
  ctime: Date;

  @UpdateDateColumn({ nullable: true })
  mtime: Date | null;
}


// CREATE TABLE IF NOT EXISTS `mydb`.`order` (
//   `order_id` INT NOT NULL,
//   `order_status` INT(2) COMMONT '',
//   `push_status` INT(2) COMMONT '0 - 未push，1-已push',
//   `seller_uid` VARCHAR(13) NULL,
//   `buyer_uid` VARCHAR(13) NULL,
//   `meeting_id` VARCHAR(13) NULL,
//   `price` VARCHAR(13) NULL,
//   `status` Int(2) COMMONT '0-删除，1-有效',
//   `ctime` VARCHAR(13) NULL,
//   `mtime` VARCHAR(13) NULL,
//   PRIMARY KEY (`meeting_id`))
// ENGINE = InnoDB
// COMMENT = '订单信息'