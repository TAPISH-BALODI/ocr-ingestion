import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Document as Doc } from '../documents/document.schema';
import { Tag } from '../tags/tag.schema';
import { DocumentTag } from '../documents/document-tag.schema';
import { Usage } from '../actions/usage.schema';
import { Task } from '../tasks/task.schema';
import { TenantUserId } from '../auth/decorators';
import { MetricsResponseDto } from './dto/metrics-response.dto';

@ApiTags('Metrics')
@ApiBearerAuth()
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
  @ApiOperation({ 
    summary: 'Get system metrics',
    description: 'Returns aggregated statistics: total documents, folders, actions this month, and tasks created today.'
  })
  @ApiResponse({ 
    status: 200,
    description: 'Metrics retrieved successfully',
    type: MetricsResponseDto,
    example: {
      docs_total: 123,
      folders_total: 7,
      actions_month: 42,
      tasks_today: 5
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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


