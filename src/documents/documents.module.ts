import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Document as Doc, DocumentSchema } from './document.schema';
import { DocumentTag, DocumentTagSchema } from './document-tag.schema';
import { Tag, TagSchema } from '../tags/tag.schema';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { AuditLog, AuditLogSchema } from '../audit/audit.schema';
import { AuditService } from '../audit/audit.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Doc.name, schema: DocumentSchema },
      { name: DocumentTag.name, schema: DocumentTagSchema },
      { name: Tag.name, schema: TagSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [DocumentsService, AuditService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}


