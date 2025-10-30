import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetricsController } from './metrics.controller';
import { Document as Doc, DocumentSchema } from '../documents/document.schema';
import { DocumentTag, DocumentTagSchema } from '../documents/document-tag.schema';
import { Tag, TagSchema } from '../tags/tag.schema';
import { Usage, UsageSchema } from '../actions/usage.schema';
import { Task, TaskSchema } from '../tasks/task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Doc.name, schema: DocumentSchema },
      { name: DocumentTag.name, schema: DocumentTagSchema },
      { name: Tag.name, schema: TagSchema },
      { name: Usage.name, schema: UsageSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
  ],
  controllers: [MetricsController],
})
export class MetricsModule {}


