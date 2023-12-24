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
        await transactionalEntityManager.createQueryBuilder().insert().into(Order).values(info).execute();
        const updateSql = `UPDATE meeting SET lock_time=${now}, order_status=1 WHERE meeting_id="${meeting_id}"`;
        await this.meetingRepository.query(updateSql);
      });
      return true;
    } catch (error) {
      throw new Error('下单失败');
    }
  }

  async buy(body) {
    //
  }
}
