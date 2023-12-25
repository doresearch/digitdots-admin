import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './order.entity';
import { Meeting } from '../meeting/meeting.entity';
import { QuickOrder } from './quick-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Meeting, QuickOrder])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
