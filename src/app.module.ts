import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/user.schema';
import { Tag, TagSchema } from './tags/tag.schema';
import { Document as Doc, DocumentSchema } from './documents/document.schema';
import { DocumentTag, DocumentTagSchema } from './documents/document-tag.schema';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { ActionsModule } from './actions/actions.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { MetricsModule } from './metrics/metrics.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { TenantScopeGuard } from './auth/tenant-scope.guard';

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
    DocumentsModule,
    ActionsModule,
    WebhooksModule,
    MetricsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: TenantScopeGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
