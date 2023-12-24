import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Meeting } from '../meeting/meeting.entity';

export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>
  ) {}

  getOrderInfoByOrderId(order_id: string) {
    return this.orderRepository.findOneBy({ order_id });
  }

  getOrderList(body) {
    return this.orderRepository.find();
  }

  async preCreateOrder(orderInfo) {
    const { meeting_id, uid } = orderInfo;
    const findMeeting = await this.meetingRepository.findOneBy({ meeting_id });
    console.log(findMeeting);
    if (!findMeeting) {
      throw new Error('会议不存在');
    }
    if (findMeeting.status !== 1) {
      throw new Error('会议无效');
    }
    if (findMeeting.order_status === 1) {
      throw new Error('会议已预定');
    }

    try {
      let order_id = 0;
      await this.orderRepository.manager.transaction(async transactionalEntityManager => {
        const now = Date.now().toString();
        const info = {
          ...orderInfo,
          order_status: 1000,
          push_status: 0,
          order_time: now,
          student_id: uid,
          meeting_id,
          price: findMeeting.price,
          status: 1,
        };
        const data = await transactionalEntityManager.createQueryBuilder().insert().into(Order).values(info).execute();
        order_id = data.identifiers[0].order_id;
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Meeting)
          .set({
            lock_time: now,
            order_status: 1,
          })
          .where('meeting_id = :meeting_id', { meeting_id })
          .execute();
      });
      // TODO:
      return {
        order_id,
      };
    } catch (error) {
      throw new Error('下单失败');
    }
  }

  async buy(body) {
    const { order_id } = body;
    const findOrder = await this.getOrderInfoByOrderId(order_id);
    if (!findOrder) {
      throw new Error('订单不存在');
    }
    if (!(findOrder.status === 1 && findOrder.order_status === 1000)) {
      throw new Error('订单无效');
    }
    const now = Date.now().toString();
    const orderStatus = 1001;
    try {
      const updateSql = `UPDATE \`order\` SET order_status=${orderStatus}, order_time="${now}" WHERE order_id="${findOrder.order_id}" AND order_time > ${now}`;
      await this.orderRepository.query(updateSql);
      // TODO:
      return {
        ...findOrder,
        order_time: now,
        order_status: orderStatus,
      };
    } catch (error) {
      throw new Error('订单支付失败');
    }
  }
}
