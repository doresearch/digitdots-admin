import { Injectable } from '@nestjs/common';
import { STS } from 'ali-oss';

@Injectable()
export class OssService {
  // 阿里云账户
  // accessKeyId: 'LTAI5tQeF31eBHjZ7ywZbz1v',
  // accessKeySecret: 'VnWh7qd6KJ6Elp9UlR7NvrnXo2OQnn',
  static accessKeyId: string = 'LTAI5tQeF31eBHjZ7ywZbz1v';
  static accessKeySecret: string = 'VnWh7qd6KJ6Elp9UlR7NvrnXo2OQnn';
  static buketName: string = 'for-yanhu-test';
  static roleArn: string = 'acs:ram::1813623121375376:role/ramosstest';

  getOssToken() {
    const sts = new STS({
      region: 'oss-cn-beijing',
      accessKeyId: OssService.accessKeyId,
      accessKeySecret: OssService.accessKeySecret,
    });
    return new Promise((reslove, reject) => {
      sts
        .assumeRole(
          OssService.roleArn,
          `{
            "Version": "1",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [			
                      "oss:*"			
                    ],
                    "Resource": [
                        "acs:oss:*:*:for-yanhu-test",
                        "acs:oss:*:*:for-yanhu-test/*"
                    ]
                }
            ]
        }`,
          '3600',
          'SessionTest'
        )
        .then(res => {
          reslove({
            ...res.credentials,
            buketName: OssService.buketName,
          });
        });
    });
  }
}
