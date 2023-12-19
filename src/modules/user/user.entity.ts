import { Entity, Column, Unique, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column('int', { comment: '1-admin 2-老师 3-学生' })
  role: number;

  @Column('varchar', { length: 45 })
  @Unique(['account'])
  account: string;

  @Column('varchar', { length: 45 })
  password: string;

  @Column('varchar', { length: 45 })
  fname: string;

  @Column('varchar', { length: 45 })
  lname: string;

  @Column('varchar', { length: 255, default: '' })
  address: string;

  @Column('varchar', { length: 128, default: '' })
  school: string;

  @Column('varchar', { length: 128, default: '' })
  major: string;

  @Column('varchar', { length: 128, default: '' })
  company: string;

  @Column('varchar', { length: 32, default: '' })
  @Unique(['invite_code'])
  invite_code: string;

  @Column('varchar', { length: 32, default: '' })
  invited_by_code: string;

  @Column('int', { comment: '0-删除，1-有效', default: 1 })
  status: number;

  @CreateDateColumn({
    name: 'create_time',
    nullable: true,
  })
  create_time: Date;

  @UpdateDateColumn({
    name: 'update_time',
    nullable: true,
  })
  update_time: Date | null;
}
