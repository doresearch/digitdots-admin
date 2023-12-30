import { Injectable } from '@nestjs/common';

import { STS } from 'ali-oss';

@Injectable()
export class OssService {
  // 阿里云账户
  // accessKeyId: 'LTAI5tQeF31eBHjZ7ywZbz1v',
  // accessKeySecret: 'VnWh7qd6KJ6Elp9UlR7NvrnXo2OQnn',
  static accessKeyId: string = 'LTAI5tQeF31eBHjZ7ywZbz1v';
  static accessKeySecret: string = 'VnWh7qd6KJ6Elp9UlR7NvrnXo2OQnn';

  getOssToken() {}
}
