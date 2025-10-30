import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Document as Doc } from '../documents/document.schema';
import { Tag } from '../tags/tag.schema';
import { DocumentTag } from '../documents/document-tag.schema';
import { Usage } from '../actions/usage.schema';
import { Task } from '../tasks/task.schema';
import { TenantUserId } from '../auth/decorators';

@Controller('v1/metrics')
export class MetricsController {
  constructor(
    @InjectModel(Doc.name) private readonly docModel: Model<Doc>,
    @InjectModel(Tag.name) private readonly tagModel: Model<Tag>,
    @InjectModel(DocumentTag.name) private readonly docTagModel: Model<DocumentTag>,
    @InjectModel(Usage.name) private readonly usageModel: Model<Usage>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
  ) {}

  @Get()
  async get(@TenantUserId() tenantUserId: string) {
    const owner = new Types.ObjectId(tenantUserId);
    const [docs_total, folders_total] = await Promise.all([
      this.docModel.countDocuments({ ownerId: owner }),
      this.docTagModel.distinct('tagId', { ownerId: owner, isPrimary: true }).then(arr => arr.length),
    ]);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const actions_monthAgg = await this.usageModel.aggregate([
      { $match: { userId: owner, at: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$credits' } } },
    ]);
    const actions_month = actions_monthAgg[0]?.total ? Math.floor(actions_monthAgg[0].total / 5) : 0;
    const startToday = new Date();
    startToday.setHours(0,0,0,0);
    const tasks_today = await this.taskModel.countDocuments({ ownerId: owner, createdAt: { $gte: startToday } });
    return { docs_total, folders_total, actions_month, tasks_today };
  }
}


