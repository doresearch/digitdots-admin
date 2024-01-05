import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './order.entity';
import { Meeting } from '../meeting/meeting.entity';
import { QuickOrder } from './quick-order.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Meeting, QuickOrder, User])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
