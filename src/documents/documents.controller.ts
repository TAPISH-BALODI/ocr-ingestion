import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { Roles } from '../auth/decorators';
import { Role } from '../auth/auth.types';
import { TenantUserId } from '../auth/decorators';
import { AuditService } from '../audit/audit.service';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller()
export class DocumentsController {
  constructor(private readonly docs: DocumentsService, private readonly audit: AuditService) {}

  @Post('v1/docs')
  @ApiOperation({ summary: 'Upload a document with primary and optional secondary tags' })
  @Roles(Role.USER, Role.ADMIN)
  async create(@TenantUserId() userId: string, @Body() dto: CreateDocumentDto) {
    const doc = await this.docs.create(userId, dto);
    await this.audit.log({ userId, action: 'document.upload', entityType: 'Document', entityId: String(doc._id), metadata: { filename: doc.filename } });
    return doc;
  }

  @Get('v1/folders')
  @Roles(Role.USER, Role.ADMIN, Role.SUPPORT, Role.MODERATOR)
  async folders(@TenantUserId() userId: string) {
    return this.docs.listFolders(userId);
  }

  @Get('v1/folders/:tag/docs')
  @Roles(Role.USER, Role.ADMIN, Role.SUPPORT, Role.MODERATOR)
  async byFolder(@TenantUserId() userId: string, @Param('tag') tag: string) {
    return this.docs.listByPrimaryTag(userId, tag);
  }

  @Get('v1/search')
  @Roles(Role.USER, Role.ADMIN, Role.SUPPORT, Role.MODERATOR)
  async search(
    @TenantUserId() userId: string,
    @Query('q') q: string,
    @Query('scope') scope?: 'folder' | 'files',
    @Query('name') name?: string,
    @Query('ids') idsCsv?: string,
  ) {
    if (scope === 'folder' && idsCsv) {
      return { error: 'Scope must be either folder or files, not both' };
    }
    const ids = idsCsv ? idsCsv.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    return this.docs.search(userId, q || '', scope ? { type: scope, name, ids } : undefined);
  }
}


