

import { Body, Controller, Post} from '@nestjs/common';
import { OrderService } from './order.service';
import { error, wrapperResponse } from '../../utils';
@Controller('/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/order')
  searchByTeacherId(@Body() body) {
    // return wrapperResponse(
    //   this.orderService.findByTeacherid(body),
    //   '会议创建成功',
    // );
  }
}
