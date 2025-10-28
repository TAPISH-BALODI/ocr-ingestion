import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class User {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });


