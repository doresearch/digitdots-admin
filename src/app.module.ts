import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestService } from './test.service';
import { UserModule } from './modules/user/user.module';
import { MeetingModule } from './modules/meeting/meeting.module';
import { RoleModule } from './modules/role/role.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookModule } from './modules/book/book.module';
import { ContentsModule } from './modules/contents/contents.module';
import { MenuModule } from './modules/menu/menu.module';
import { getMysqlUsernameAndPassword } from './utils';
import { OrderModule } from './modules/order/order.module';

// const { username, password } = getMysqlUsernameAndPassword();
const { username, password } = { username: 'root', password: '12345678' };

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username,
      password,
      database: 'my_db',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    UserModule,
    MeetingModule,
    AuthModule,
    OrderModule,
    // RoleModule,
    // AuthModule,
    // BookModule,
    // MenuModule,
    // ContentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, TestService],
})
export class AppModule {}
