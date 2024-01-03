import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

// gmail
// yanxipanxi@gmail
// qepa lngp voro nvzk
@Injectable()
export class MailService {
  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'yanxipanxi@gmail.com',
        pass: 'qepa lngp voro nvzk',
      },
    });

    const mailOptions = {
      from: 'yanxipanxi@gmail.com',
      to: ['jiangnanjiaxu@digitdots.com'],
      subject: `这是一个邮件`,
      text: `这是邮件${new Date()}`,
    };

    const res = await transporter.sendMail(mailOptions);

    console.log(res);
  }
}

// 创建nest 服务
