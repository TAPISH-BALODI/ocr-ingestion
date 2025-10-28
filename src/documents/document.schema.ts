import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DocumentDocument = HydratedDocument<Document>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true })
  filename!: string;

  @Prop({ required: true })
  mime!: string;

  @Prop()
  textContent?: string;

  @Prop({ default: () => new Date() })
  createdAt!: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
DocumentSchema.index({ ownerId: 1, createdAt: -1 });


