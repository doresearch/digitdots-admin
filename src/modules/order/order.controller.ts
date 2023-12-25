import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { error, wrapperResponse } from '../../utils';
@Controller('/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 预下单.
  // 锁会议 metting x -> 5min
  @Post('/createOrder')
  preOrder(@Body() body) {
    return wrapperResponse(this.orderService.preCreateOrder(body), 'Meeting created successfully'); // 会议创建成功
  }

  // 锁会议 metting x -> 15min
  @Post('/buy')
  buy(@Body() body) {
    return wrapperResponse(this.orderService.buy(body), '');
  }

  // paypal支付完成 -> 锁死会议
  @Post('/payStatusCheck')
  async payStatusCheck(@Body() body) {
    return wrapperResponse(
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(true);
        }, 5000);
      }),
      '会议创建成功'
    );
  }

  // 查询订单
  @Get('/query/list')
  queryList(@Body() body) {
    return wrapperResponse(this.orderService.getOrderList(body), '');
  }

  // 查询订单详情
  @Get('/query/detail')
  queryDetail(@Body() body) {
    return wrapperResponse(this.orderService.getOrderInfoByOrderId(body.order_id), '');
  }
}
