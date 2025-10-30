import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OcrController } from './ocr.controller';
import { Task, TaskSchema } from '../tasks/task.schema';
import { AuditLog, AuditLogSchema } from '../audit/audit.schema';
import { AuditService } from '../audit/audit.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [OcrController],
  providers: [AuditService],
})
export class WebhooksModule {}


