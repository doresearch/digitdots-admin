import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { wrapperResponse } from '../../utils';
import { Public } from '../auth/public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  getUserByToken(@Query() query) {
    return wrapperResponse(this.userService.findUserByUsername(query.account), '');
  }

  // @Get(':id')
  // getUser(@Param('id', ParseIntPipe) id: string) {
  //   return this.userService.findOne(id);
  // }

  // @Get()
  // getAllUser(@Query() query) {
  //   return wrapperResponse(this.userService.findAll(query), '获取用户列表成功');
  // }

  @Post('update')
  update(@Body() body) {
    return wrapperResponse(this.userService.update(body), 'Account information updated'); // 修改账户信息成功.
  }

  @Public()
  @Post('create')
  create(@Body() body) {
    return wrapperResponse(this.userService.create(body), 'Account registered successfully'); // 注册账户成功.
  }

  // @Delete(':id')
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.userService.remove(id);
  // }
}
