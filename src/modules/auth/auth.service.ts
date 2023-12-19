import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as md5 from 'md5';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async login(username, password) {
    const user = await this.userService.findPwdByUsername(username);
    // const md5Password = md5(password).toUpperCase();
    const md5Password = password;
    if (user.password !== md5Password) {
      throw new UnauthorizedException();
    }
    const payload = { username: user.account, userid: user.uid };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}
