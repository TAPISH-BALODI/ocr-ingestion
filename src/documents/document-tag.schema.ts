import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DocumentTagDocument = HydratedDocument<DocumentTag>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class DocumentTag {
  @Prop({ type: Types.ObjectId, ref: 'Document', required: true, index: true })
  documentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tag', required: true, index: true })
  tagId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true, default: false })
  isPrimary!: boolean;

  @Prop({ default: () => new Date() })
  createdAt!: Date;
}

export const DocumentTagSchema = SchemaFactory.createForClass(DocumentTag);

//Prevent more than one primary tag per document per owner
DocumentTagSchema.index(
  { documentId: 1, ownerId: 1, isPrimary: 1 },
  { unique: true, partialFilterExpression: { isPrimary: true } }
);

DocumentTagSchema.index({ documentId: 1, tagId: 1, ownerId: 1 }, { unique: true });


