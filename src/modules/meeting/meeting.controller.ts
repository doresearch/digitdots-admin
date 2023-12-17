import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { error, wrapperResponse } from '../../utils';
@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post('/searchByTeacherId')
  searchByTeacherId(@Body() body) {
    return wrapperResponse(this.meetingService.findByTeacherid(body), '会议创建成功');
  }

  @Post('/saveOrders')
  saveOrders(@Body() body) {
    const { meeting, teacherId } = body;

    if (!meeting) {
      return error('预定时间不能为空');
    }
    if (!teacherId) {
      return error('老师ID不能为空');
    }

    // 没有meeting_id视为创建，有meeting_id视为更新
    return wrapperResponse(this.meetingService.updateMetting(body), '会议创建成功');
  }
}
