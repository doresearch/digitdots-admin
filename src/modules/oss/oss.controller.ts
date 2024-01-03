import { Controller, Get, Post } from '@nestjs/common';
import { OssService } from './oss.service';
import { Public } from '../auth/public.decorator';
import { wrapperResponse } from 'src/utils';

@Controller('oss')
export class OssController {
  constructor(private readonly ossService: OssService) {}
  // 登陆用户才可以进行获取零时key操作
  @Post('getToken')
  @Public()
  async getToken() {
    return wrapperResponse(this.ossService.getOssToken(), '请求成功');
  }
}
