import { Entity, Column, Unique, PrimaryGeneratedColumn } from 'typeorm';

@Entity('metting')
export class Meeting {
  @PrimaryGeneratedColumn({ type: 'varchar', length: 32, name: 'meeting_id' })
  meeting_id: number;

  @Column({ type: 'varchar', length: 13, Comment: '订单时间, 格式时间戳' })
  order_time: string;

  @Column({ type: 'varchar', length: 32, Comment: '订单时间' })
  teacher_id: string;

  @Column({ type: 'int', Comment: '价格' })
  price: number;

  @Column({ type: 'int', Comment: '状态，0 - 无效；1 - 有效' })
  status: number;

  @Column({ type: 'varchar', length: 13, Comment: '订单时间' })
  ctime: string;

  @Column({ type: 'varchar', length: 13, Comment: '订单时间' })
  mtime: string;
}


// CREATE TABLE IF NOT EXISTS `mydb`.`meeting` (
//   `meeting_id` INT NOT NULL,
//   `order_time` VARCHAR(13) NULL,
//   `lark_url` VARCHAR(13) NULL,
//   `teacher_id` VARCHAR(13) NULL,
//   `price` VARCHAR(13) NULL,
//   `status` Int(2) COMMONT '0-删除，1-有效',
//   `ctime` VARCHAR(13) NULL,
//   `mtime` VARCHAR(13) NULL,
//   PRIMARY KEY (`meeting_id`))
// ENGINE = InnoDB
// COMMENT = '商品信息'
