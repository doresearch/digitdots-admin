import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Meeting } from "./meeting.entity";

export class MeetingService {
  constructor(
    @InjectRepository(Meeting)
    private readonly menuRepository: Repository<Meeting>,
  ) {}

  // 通过老师id来查询会议
  findByTeacherid(teacher_id) {
    const sql = `select * from meeting WHERE status = 1 AND teacher_id='${teacher_id}' order by id asc`;
    return this.menuRepository.query(sql);
  }
  
  // 保存商品，没有meeting_id视为创建，有meeting_id视为更新
  updateMetting(body) {
    const adds = body.meeting.filter(item => !item.meeting_id);
    const updates = body.meeting.filter(item => item.meeting_id);

    // 使用typeorm创建事务
    return this.menuRepository.manager.transaction(async (transactionalEntityManager) => {
      if (adds.length > 0) {
        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(Meeting)
          .values(adds)
          .execute();
      }

      if (updates.length > 0) {
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Meeting)
          .set(updates)
          .where('meeting_id = :meeting_id', { meeting_id: updates[0].meeting_id })
          .execute();
      }
    })
  }
}