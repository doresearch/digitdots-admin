import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Meeting } from '../meeting/meeting.entity';
import { QuickOrder } from './quick-order.entity';
import schedule from 'node-schedule';

export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    @InjectRepository(QuickOrder)
    private readonly quickOrderRepository: Repository<QuickOrder>
  ) {}

  getOrderInfoByOrderId(order_id: string) {
    return this.orderRepository.findOneBy({ order_id });
  }

  getOrderList(body) {
    const sql = `SELECT o.order_id, o.order_status, o.order_time, o.price, m.meeting_id, m.teacher_id, m.order_time meeting_time, u.fname, u.lname
    FROM \`order\` o
    JOIN meeting m ON o.meeting_id = m.meeting_id
    JOIN user u ON m.teacher_id = u.uid`;
    return this.orderRepository.query(sql);
  }

  async cancelOrder(order_id: string) {
    const order = await this.orderRepository.findOneBy({ order_id });
    if (!order) {
      throw new Error('Order not found');
    }

    try {
      await this.orderRepository.manager.transaction(async transactionalEntityManager => {
        const orderStatus = 1002;
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Order)
          .set({
            order_status: orderStatus,
          })
          .where('order_id = :order_id', { order_id })
          .execute();
        await transactionalEntityManager.createQueryBuilder().update(Meeting).set({ order_status: 0, lock_time: 0 }).where('meeting_id = :meeting_id', { meeting_id: order.meeting_id }).execute();
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(QuickOrder)
          .values({
            order_id,
            order_status: orderStatus,
            order_text: 'Automatically cancel orders',
          })
          .execute();
      });
    } catch (error) {
      throw new Error('Service error');
    }
    return true;
  }

  async preCreateOrder(orderInfo) {
    const { meeting_id, uid } = orderInfo;
    const findMeeting = await this.meetingRepository.findOneBy({ meeting_id });
    console.log(findMeeting);
    if (!findMeeting) {
      throw new Error('Meeting not found'); // 会议不存在
    }
    if (findMeeting.status !== 1) {
      throw new Error('Invalid meeting'); // 会议无效
    }
    if (findMeeting.order_status === 1) {
      throw new Error('Meeting already scheduled'); // 会议已预定
    }

    try {
      let order_id = '0';
      const orderStatus = 1000;
      await this.orderRepository.manager.transaction(async transactionalEntityManager => {
        const now = Date.now().toString();
        const info = {
          ...orderInfo,
          order_status: orderStatus,
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
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(QuickOrder)
          .values({
            order_id,
            order_status: orderStatus,
            order_text: 'The meeting order was created successfully',
          })
          .execute();
      });
      // const time = Date.now() + 5 * 60 * 1000;
      // schedule.scheduleJob(new Date(time), () => {
      //   this.cancelOrder(order_id);
      // });
      return {
        order_id,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create meeting'); // 会议创建失败
    }
  }

  async buy(body) {
    const { order_id } = body;
    const findOrder = await this.getOrderInfoByOrderId(order_id);
    if (!findOrder) {
      throw new Error('Order not found'); // 订单不存在
    }
    if (!(findOrder.status === 1 && findOrder.order_status === 1000)) {
      throw new Error('Invalid order'); // 订单无效
    }
    const now = Date.now().toString();
    const orderStatus = 1001;
    try {
      await this.orderRepository.manager.transaction(async transactionalEntityManager => {
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Order)
          .set({
            order_status: orderStatus,
            order_time: now,
          })
          .where('order_id = :order_id', { order_id })
          .execute();
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(QuickOrder)
          .values({
            order_id,
            order_status: orderStatus,
            order_text: 'Payment order created successfully',
          })
          .execute();
      });
      // const time = Date.now() + 15 * 60 * 1000;
      // schedule.scheduleJob(new Date(time), () => {
      //   this.cancelOrder(order_id);
      // });
      return {
        ...findOrder,
        order_time: now,
        order_status: orderStatus,
      };
    } catch (error) {
      throw new Error('Order payment failed'); // 订单支付失败
    }
  }
}
