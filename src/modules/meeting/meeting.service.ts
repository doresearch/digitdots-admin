import { Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Meeting } from './meeting.entity';

export class MeetingService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>
  ) {}

  findByMeetingId(body) {
    const { meetingId } = body;
    if (!meetingId) {
      throw new Error('会议ID不能为空');
    }

    return new Promise((resolve, reject) => {
      this.meetingRepository.manager.transaction(async (entityManager: EntityManager) => {
        // 超过当前时间
        const meeting = await entityManager
          .getRepository(Meeting)
          .createQueryBuilder('meeting')
          .select(['order_time', 'teacher_id', 'price', 'lock_time', 'order_status', 'user.fname', 'user.lname', 'user.school', 'user.address', 'user.major', 'price'])
          // .addSelect('fname', 'user.fname')
          // .addSelect('lname', 'user.lname')
          // .addSelect('school', 'user.school')
          // .addSelect('address', 'user.address')
          // .addSelect('major', 'user.major')
          .where('meeting.meeting_id = :meetingId', { meetingId })
          .andWhere('meeting.order_time > :currentTime', { currentTime: Date.now() })
          .andWhere('meeting.status = :status', { status: 1 })
          .leftJoin('user', 'user', 'meeting.teacher_id = user.uid')
          .getRawOne();

        if (meeting.lock_time > Date.now()) {
          throw new Error('该会议已锁定，不可购买');
        }

        if (meeting.order_status === 2) {
          throw new Error('该会议已预定，不可购买');
        }

        if (!meeting) {
          throw new Error('会议不存在');
        }

        resolve(meeting);
      });
    });
  }

  // 通过老师id来查询会议
  findByTeacherId(body) {
    if (!body.teacherId) {
      throw new Error('老师ID不能为空');
    }
    // Todo: 已经过了的时间不查询
    const sql = `select * from meeting WHERE status = 1 AND teacher_id='${body.teacherId}' AND order_time > ${Date.now()} order by order_time asc`;
    return this.meetingRepository.query(sql);
  }

  findByTeacherIds(body) {
    if (Array.isArray(body.teacherIds)) {
      const teacherIds = body.teacherIds.filter(item => item);
      // 多个 teacherId 查询
      const sql = `select * from meeting WHERE status = 1 AND teacher_id IN (${teacherIds.join(',')}) AND order_time > ${Date.now()} order by order_time asc`;
      return this.meetingRepository.query(sql);
    } else {
      throw new Error('老师ID不能为空');
    }
  }

  // 保存商品，没有meeting_id视为创建，有meeting_id视为更新
  async updateMetting(body) {
    try {
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
    } catch (e) {
      throw new Error('请联系网站人员，稍后再试');
    }
  }

  async deleteMetting(body) {
    // Todo: lock不允许删除
    const findOne = await this.meetingRepository.findOneBy({ meeting_id: body.meetingId });
    if (findOne.order_status === 0) {
      throw new Error('该会议已预定，不可删除');
    }
    await this.meetingRepository.update({ meeting_id: body.meetingId }, { status: 0 });
    return '删除完毕';
  }
}
