import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { Meeting } from './meeting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting])],
  controllers: [MeetingController],
  providers: [MeetingService],
})
export class MeetingModule {}
