import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionsController } from './actions.controller';
import { Document as Doc, DocumentSchema } from '../documents/document.schema';
import { DocumentTag, DocumentTagSchema } from '../documents/document-tag.schema';
import { Tag, TagSchema } from '../tags/tag.schema';
import { Usage, UsageSchema } from './usage.schema';
import { AuditLog, AuditLogSchema } from '../audit/audit.schema';
import { AuditService } from '../audit/audit.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Doc.name, schema: DocumentSchema },
      { name: DocumentTag.name, schema: DocumentTagSchema },
      { name: Tag.name, schema: TagSchema },
      { name: Usage.name, schema: UsageSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [ActionsController],
  providers: [AuditService],
})
export class ActionsModule {}


