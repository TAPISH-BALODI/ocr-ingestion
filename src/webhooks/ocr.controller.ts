import { Body, Controller, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from '../tasks/task.schema';
import { AuditService } from '../audit/audit.service';
import { TenantUserId } from '../auth/decorators';

function classify(text: string): 'official' | 'ad' | 'other' {
  const t = (text || '').toLowerCase();
  if (/(invoice|payment|legal|contract|tax)/.test(t)) return 'official';
  if (/(sale|limited time|offer|promo|unsubscribe)/.test(t)) return 'ad';
  return 'other';
}

function extractUnsubscribe(text: string): { channel: string; target: string } | null {
  const email = text.match(/mailto:([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i);
  if (email) return { channel: 'email', target: email[1] };
  const url = text.match(/https?:\/\/[\w.-]+\.[a-z]{2,}[\w\/?#.&%=-]*/i);
  if (url) return { channel: 'web', target: url[0] };
  return null;
}

@Controller('v1/webhooks')
export class OcrController {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    private readonly audit: AuditService,
  ) {}

  @Post('ocr')
  async handle(
    @TenantUserId() tenantUserId: string,
    @Body() payload: { source: string; imageId: string; text: string; meta?: Record<string, any> }
  ) {
    const userId = new Types.ObjectId(tenantUserId);
    const category = classify(payload.text || '');

    await this.audit.log({ userId, action: 'webhook.ocr', entityType: 'Webhook', metadata: { source: payload.source, category } });

    if (category === 'ad') {
      const unsub = extractUnsubscribe(payload.text || '');
      if (unsub) {
        // rate limit: max 3 tasks per sender per day per user
        const start = new Date();
        start.setHours(0,0,0,0);
        const count = await this.taskModel.countDocuments({
          ownerId: userId,
          source: payload.source,
          createdAt: { $gte: start },
        });
        if (count < 3) {
          await this.taskModel.create({ ownerId: userId, status: 'pending', channel: unsub.channel, target: unsub.target, source: payload.source });
          await this.audit.log({ userId, action: 'task.created', entityType: 'Task', metadata: { channel: unsub.channel, target: unsub.target } });
        }
      }
    }
    return { ok: true, category };
  }
}


