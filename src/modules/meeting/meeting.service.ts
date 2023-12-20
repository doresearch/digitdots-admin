import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Meeting } from './meeting.entity';
import { Order } from '../order/order.entity';

export class MeetingService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>
  ) {}

  // 通过老师id来查询会议
  findByTeacherid(body) {
    if (!body.teacherId) {
      throw new Error('老师ID不能为空');
    }

    const sql = `select * from meeting WHERE status = 1 AND teacher_id='${body.teacherId}' order by order_time asc`;
    return this.meetingRepository.query(sql);
  }

  // 保存商品，没有meeting_id视为创建，有meeting_id视为更新
  async updateMetting(body) {
    const { teacherId } = body;
    // console.log(typeof body.meeting);
    const meeting = body.meeting;

    if (!meeting) {
      throw new Error('预定时间不能为空');
    }
    if (!teacherId) {
      throw new Error('老师ID不能为空');
    }

    if (Array.isArray(meeting)) {
      const allow = meeting.every(item => {
        return item.orderTime;
      });
      if (!allow) {
        throw new Error('预定时间不能为空');
      }
    }

    const adds = meeting.filter(item => !item.meetingId);
    const updates = meeting.filter(item => item.meetingId);
    // 使用typeorm创建事务
    await this.meetingRepository.manager.transaction(async transactionalEntityManager => {
      if (adds.length > 0) {
        const addsParams = adds.map(item => {
          return {
            order_time: item.orderTime,
            teacher_id: body.teacherId,
            status: 1,
            price: 100,
          };
        });

        await transactionalEntityManager.createQueryBuilder().insert().into(Meeting).values(addsParams).execute();
      }

      if (updates.length > 0) {
        await Promise.allSettled(
          updates.map(item => {
            return new Promise(resolve => {
              transactionalEntityManager.createQueryBuilder().update(Meeting).set({ order_time: item.orderTime }).where('meeting_id = :meeting_id', { meeting_id: item.meetingId }).execute();
              resolve('');
            });
          })
        );
      }
    });
    return '';
  }

  async deleteMetting(body) {
    const orderded = await this.orderRepository.findOne({ where: { meeting_id: body.meetingId } });
    if (orderded) {
      return '该会议已被预定，不能删除';
    }
    await this.meetingRepository.update({ meeting_id: body.meetingId }, { status: 0 });
    return '删除完毕';
  }
}
