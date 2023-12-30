import { Controller, Get, Post } from '@nestjs/common';
import { OssService } from './oss.service';

@Controller('oss')
export class OssController {
  constructor(private readonly ossService: OssService) {}
  // 登陆用户才可以进行获取零时key操作
  @Post('getToken')
  async getToken() {
    return this.ossService.getOssToken();
  }
}
