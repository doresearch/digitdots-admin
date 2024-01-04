import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { error, wrapperResponse } from '../../utils';
import { AuthGuard } from '../auth/auth.guard';

@Controller('/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 预下单.
  // 锁会议 metting x -> 5min
  @Post('/preCreateOrder')
  preOrder(@Body() body) {
    return wrapperResponse(this.orderService.preCreateOrder(body), 'Meeting created successfully'); // 会议创建成功
  }

  // 锁会议 metting x -> 15min
  @Post('/buy')
  buy(@Body() body) {
    return wrapperResponse(this.orderService.buy(body), '');
  }

  @Post('/create-paypal-order')
  createPaypalOrder(@Body() body) {
    return wrapperResponse(this.orderService.createOrder(body), '');
  }

  // paypal支付完成 -> 锁死会议
  @Post('/capture')
  async payStatusCheck(@Body() body) {
    return wrapperResponse(this.orderService.capture(body), 'Payment Successfully');
  }

  @UseGuards(AuthGuard)
  // 查询订单
  @Get('/query/list')
  queryList(@Request() request) {
    const { user } = request;
    return wrapperResponse(this.orderService.getOrderList(user.userid), '');
  }

  // 查询订单详情
  @Get('/query/detail')
  queryDetail(@Query() query) {
    return wrapperResponse(this.orderService.getOrderInfoByOrderId(query.order_id), '');
  }
}
