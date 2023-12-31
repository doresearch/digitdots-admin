import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as md5 from 'md5';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';
import { generateRandomCode } from 'src/utils/generateRandomCode';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  // findOne(id: string): Promise<User> {
  //   return this.usersRepository.findOneBy({ uid: id });
  // }

  findAll(query: any): Promise<User[]> {
    console.log(query);
    let where = 'WHERE 1=1';
    if (query.id) {
      where += ` AND id='${query.id}'`;
    }
    if (query.username) {
      where += ` AND username='${query.username}'`;
    }
    if (query.active) {
      where += ` AND active='${query.active}'`;
    }
    let page = +query.page || 1;
    let pageSize = +query.pageSize || 20;
    if (page <= 0) {
      page = 1;
    }
    if (pageSize <= 0) {
      pageSize = 20;
    }
    const sql = `SELECT id, username, avatar, role, nickname, active FROM user ${where} limit ${pageSize} offset ${(page - 1) * pageSize}`;
    return this.usersRepository.query(sql);
  }

  async create(createUserDto: CreateUserDto): Promise<boolean> {
    const findUser = await this.usersRepository.findOneBy({ account: createUserDto.account, status: 1 });
    if (findUser) {
      throw new Error('Account already exists'); // 该账户已存在
    }
    const user = new User();
    user.role = Number(createUserDto.role) || 3;
    user.account = createUserDto.account;
    user.password = md5(createUserDto.password).toUpperCase();
    user.fname = createUserDto.fname;
    user.lname = createUserDto.lname;
    user.address = createUserDto.address;
    user.avator = createUserDto.avator;
    user.invited_by_code = createUserDto.invited_by_code || '';
    user.invite_code = generateRandomCode(8);
    user.status = 1;

    await this.usersRepository.save(user);

    return true;
  }

  async update(params) {
    const findUser = await this.usersRepository.findOneBy({ account: params.account });
    if (!findUser) {
      throw new Error('Account not found'); // 该账户不存在
    }
    const { account, role, password, fname, lname, address } = params;
    const setSql = [];
    if (role) {
      setSql.push(`role=${[2, 3].includes(Number(role)) ? Number(role) : findUser.role}`);
    }
    if (password) {
      setSql.push(`password="${password}"`);
    }
    if (fname) {
      setSql.push(`fname="${fname}"`);
    }
    if (lname) {
      setSql.push(`lname="${lname}"`);
    }
    if (address) {
      setSql.push(`address="${address}"`);
    }
    const updateSql = `UPDATE user SET ${setSql.join(',')} WHERE account="${account}"`;
    await this.usersRepository.query(updateSql);

    return true;
  }

  remove(id: number): Promise<DeleteResult> {
    return this.usersRepository.delete(id);
  }

  async findOne(id: string): Promise<any> {
    if (!id) {
      throw new Error('token is required');
    }
    try {
      const { account, avator, role, fname, lname, address, invite_code, uid } = await this.usersRepository.findOneBy({ uid: id });
      return {
        account,
        avator,
        role,
        fname,
        lname,
        address,
        invite_code,
        uid,
      };
    } catch (error) {
      throw new Error('Account not found'); // 该账户不存在
    }
  }

  findByUsername(accountName: string): Promise<User> {
    return this.usersRepository.findOneBy({ account: accountName });
  }

  async getAllTeacher() {
    const sql = `SELECT uid, fname, lname, school, major, company FROM user WHERE role=2 and status=1`;
    return this.usersRepository.query(sql);
  }
}
