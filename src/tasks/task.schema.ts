import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class Task {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true, enum: ['pending', 'completed', 'failed'], default: 'pending' })
  status!: 'pending' | 'completed' | 'failed';

  @Prop({ required: true })
  channel!: string; // e.g., email/web

  @Prop()
  target?: string; // email/url

  @Prop()
  source?: string; // sender/source id
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ ownerId: 1, createdAt: -1 });


