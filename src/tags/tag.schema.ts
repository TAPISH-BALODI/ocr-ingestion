import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TagDocument = HydratedDocument<Tag>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class Tag {
  @Prop({ required: true, trim: true, lowercase: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ default: () => new Date() })
  createdAt!: Date;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
TagSchema.index({ ownerId: 1, name: 1 }, { unique: true });


