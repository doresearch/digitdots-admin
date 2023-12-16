import { Entity, Column, Unique, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  role: string;

  @Column()
  @Unique(['account'])
  account: string;

  @Column()
  password: string;

  @Column()
  fname: string;

  @Column()
  lname: string;

  @Column()
  address: string;

  @Column()
  invite_code: string;

  @Column()
  status: number;

  @Column()
  ctime: string;

  @Column()
  mtime: string;
}
