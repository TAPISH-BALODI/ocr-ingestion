import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/user.schema';
import { Tag, TagSchema } from './tags/tag.schema';
import { Document as Doc, DocumentSchema } from './documents/document.schema';
import { DocumentTag, DocumentTagSchema } from './documents/document-tag.schema';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    HealthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Tag.name, schema: TagSchema },
      { name: Doc.name, schema: DocumentSchema },
      { name: DocumentTag.name, schema: DocumentTagSchema },
    ]), 
    AuthModule,
  ],
})
export class AppModule {}
