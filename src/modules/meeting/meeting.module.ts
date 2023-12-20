import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { Meeting } from './meeting.entity';
import { Order } from '../order/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting]), TypeOrmModule.forFeature([Order])],
  controllers: [MeetingController],
  providers: [MeetingService],
})
export class MeetingModule {}
