import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UsageDocument = HydratedDocument<Usage>;

@Schema({ timestamps: { createdAt: 'at', updatedAt: false } })
export class Usage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  credits!: number; // positive numbers 

  @Prop({ default: () => new Date() })
  at!: Date;
}

export const UsageSchema = SchemaFactory.createForClass(Usage);
UsageSchema.index({ userId: 1, at: -1 });


