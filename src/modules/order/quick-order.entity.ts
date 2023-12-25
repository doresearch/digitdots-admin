import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('quick_order')
export class QuickOrder {
  @PrimaryGeneratedColumn('uuid')
  quick_order_id: string;

  @Column('varchar', { length: 48 })
  order_id: string;

  @Column('int')
  order_status: number;

  @Column('text')
  order_text: string;

  @Column('int', { comment: '0-删除, 1-有效', default: 1 })
  status: number;

  @CreateDateColumn({
    nullable: true,
  })
  ctime: Date;

  @UpdateDateColumn({
    nullable: true,
  })
  mtime: Date | null;
}
