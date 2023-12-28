import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { wrapperResponse } from '../../utils';
import { Public } from '../auth/public.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { GetUser } from './user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('info')
  getUserByToken(@GetUser('uid') user) {
    return wrapperResponse(this.userService.findOne(user.userid), '');
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

  @Public()
  @Post('getAllTeacher')
  getAllTeacher(@Body() body) {
    return wrapperResponse(this.userService.getAllTeacher(), '获取教师列表成功');
  }

  // @Delete(':id')
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.userService.remove(id);
  // }
}
