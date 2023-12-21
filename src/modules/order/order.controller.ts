import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { error, wrapperResponse } from '../../utils';
@Controller('/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // order状态
  // 锁会议 metting x -> 5min
  @Post('/preOrder')
  preOrder(@Body() body) {
    // return wrapperResponse(
    //   this.orderService.findByTeacherid(body),
    //   '会议创建成功',
    // );
  }

  // 锁会议 metting x -> 15min
  @Post('/buy')
  buy(@Body() body) {
    //
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
  @Post('/query/list')
  queryList(@Body() body) {
    //
  }

  // 查询订单详情
  @Post('/query/detail')
  queryDetail(@Body() body) {
    //
  }
}
