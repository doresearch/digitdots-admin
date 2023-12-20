import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { error, wrapperResponse } from '../../utils';
@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post('/searchByTeacherId')
  searchByTeacherId(@Body() body) {
    return wrapperResponse(this.meetingService.findByTeacherid(body), '查询成功');
  }

  @Post('/saveOrders')
  saveOrders(@Body() body) {
    // 没有meeting_id视为创建，有meeting_id视为更新
    return wrapperResponse(this.meetingService.updateMetting(body), '会议创建成功');
  }

  @Post('/delete')
  deleteOrders(@Body() body) {
    // 没有meeting_id视为创建，有meeting_id视为更新
    return wrapperResponse(this.meetingService.deleteMetting(body), '会议删除成功');
  }
}
