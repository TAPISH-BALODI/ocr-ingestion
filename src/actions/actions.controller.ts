import { Body, Controller, Get, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Document as Doc } from '../documents/document.schema';
import { DocumentTag } from '../documents/document-tag.schema';
import { Tag } from '../tags/tag.schema';
import { Usage } from './usage.schema';
import { TenantUserId } from '../auth/decorators';
import { AuditService } from '../audit/audit.service';

type Scope = { type: 'folder'; name: string } | { type: 'files'; ids: string[] };

@Controller('v1/actions')
export class ActionsController {
  constructor(
    @InjectModel(Doc.name) private readonly docModel: Model<Doc>,
    @InjectModel(DocumentTag.name) private readonly docTagModel: Model<DocumentTag>,
    @InjectModel(Tag.name) private readonly tagModel: Model<Tag>,
    @InjectModel(Usage.name) private readonly usageModel: Model<Usage>,
    private readonly audit: AuditService,
  ) {}

  private async collectContext(userId: Types.ObjectId, scope: Scope) {
    if (scope.type === 'folder') {
      const tag = await this.tagModel.findOne({ ownerId: userId, name: scope.name.trim().toLowerCase() }).lean();
      if (!tag) return [] as any[];
      const links = await this.docTagModel.find({ ownerId: userId, tagId: tag._id, isPrimary: true }).lean();
      const ids = links.map(l => l.documentId);
      return this.docModel.find({ _id: { $in: ids } }).lean();
    }
    const ids = scope.ids.map(id => new Types.ObjectId(id));
    return this.docModel.find({ _id: { $in: ids }, ownerId: userId }).lean();
  }

  private mockProcessor(messages: { role: string; content: string }[], docs: any[]) {
    const combined = docs.map(d => `${d.filename}: ${(d.textContent||'').slice(0,40)}`).join('\n');
    const prompt = messages.map(m => `${m.role}> ${m.content}`).join('\n');
    return {
      generatedText: `Summary based on ${docs.length} docs\n${combined}\nPROMPT:${prompt}`,
      csv: `filename,chars\n${docs.map(d=>`${d.filename},${(d.textContent||'').length}`).join('\n')}`,
    };
  }

  @Post('run')
  async run(
    @TenantUserId() tenantUserId: string,
    @Body() body: { scope: Scope; messages: { role: string; content: string }[]; actions: ('make_document'|'make_csv')[] },
  ) {
    // Rule: scope must be either folder OR files, not both
    if (!body.scope || !body.actions?.length) {
      return { error: 'scope and actions are required' };
    }
    const userId = new Types.ObjectId(tenantUserId);
    const docs = await this.collectContext(userId, body.scope);
    const out = this.mockProcessor(body.messages || [], docs);

    const created: any[] = [];
    if (body.actions.includes('make_document')) {
      const doc = await this.docModel.create({ ownerId: userId, filename: 'generated.txt', mime: 'text/plain', textContent: out.generatedText });
      created.push(doc);
    }
    if (body.actions.includes('make_csv')) {
      const doc = await this.docModel.create({ ownerId: userId, filename: 'generated.csv', mime: 'text/csv', textContent: out.csv });
      created.push(doc);
    }

    // usage: consume 5 credits
    await this.usageModel.create({ userId, credits: 5 });
    await this.audit.log({ userId, action: 'actions.run', entityType: 'Action', metadata: { actions: body.actions, scope: body.scope } });

    return { created: created.map(d => ({ id: d._id, filename: d.filename })), credits: 5 };
  }

  @Get('usage/month')
  async usageMonth(@TenantUserId() tenantUserId: string) {
    const userId = new Types.ObjectId(tenantUserId);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const total = await this.usageModel.aggregate([
      { $match: { userId, at: { $gte: start } } },
      { $group: { _id: null, credits: { $sum: '$credits' } } },
    ]);
    return { credits: total[0]?.credits || 0 };
  }
}


