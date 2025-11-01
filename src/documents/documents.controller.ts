import { Body, Controller, Get, Param, Post, Query, UseInterceptors, UploadedFile, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentResponseDto, FolderDto } from './dto/document-response.dto';
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Upload a document with primary and optional secondary tags',
    description: 'Upload a document with text content and tags. You can either send JSON with textContent or upload a file (file upload will extract text automatically).'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Document created successfully',
    type: DocumentResponseDto,
    example: {
      _id: '672abc123def456',
      ownerId: 'user123',
      filename: 'invoice-001.pdf',
      mime: 'application/pdf',
      textContent: 'Invoice total $1200. Payment due.',
      createdAt: '2025-10-30T12:00:00.000Z'
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  @Roles(Role.USER, Role.ADMIN)
  async create(@TenantUserId() userId: string, @Body() dto: CreateDocumentDto) {
    const doc = await this.docs.create(userId, dto);
    await this.audit.log({ userId, action: 'document.upload', entityType: 'Document', entityId: String(doc._id), metadata: { filename: doc.filename } });
    return doc;
  }

  @Post('v1/docs/upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Upload a document file with primary and optional secondary tags',
    description: 'Upload a file directly (multipart/form-data). The system will extract text content from the file.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'primaryTag'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file to upload'
        },
        primaryTag: {
          type: 'string',
          example: 'invoices-2025',
          description: 'Primary tag name (required). This becomes the folder name.'
        },
        secondaryTags: {
          type: 'string',
          example: 'financial,urgent',
          description: 'Comma-separated secondary tag names (optional)'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Document uploaded and created successfully',
    type: DocumentResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  @Roles(Role.USER, Role.ADMIN)
  async upload(
    @TenantUserId() userId: string,
    @UploadedFile() file: { originalname: string; mimetype: string; buffer: Buffer },
    @Body('primaryTag') primaryTag: string,
    @Body('secondaryTags') secondaryTags?: string
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!primaryTag) {
      throw new BadRequestException('primaryTag is required');
    }
    // For now, read file buffer as text (in production, would use OCR)
    const textContent = file.buffer.toString('utf-8');
    const dto: CreateDocumentDto = {
      filename: file.originalname,
      mime: file.mimetype,
      textContent,
      primaryTag,
      secondaryTags: secondaryTags ? secondaryTags.split(',').map(s => s.trim()).filter(Boolean) : []
    };
    const doc = await this.docs.create(userId, dto);
    await this.audit.log({ userId, action: 'document.upload', entityType: 'Document', entityId: String(doc._id), metadata: { filename: doc.filename } });
    return doc;
  }

  @Get('v1/folders')
  @ApiOperation({ 
    summary: 'List all folders with document counts',
    description: 'Returns all primary tags (folders) with the number of documents in each folder.'
  })
  @ApiResponse({ 
    status: 200,
    description: 'List of folders',
    type: [FolderDto],
    example: [
      { name: 'invoices-2025', count: 5 },
      { name: 'receipts', count: 3 }
    ]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles(Role.USER, Role.ADMIN, Role.SUPPORT, Role.MODERATOR)
  async folders(@TenantUserId() userId: string) {
    return this.docs.listFolders(userId);
  }

  @Get('v1/folders/:tag/docs')
  @ApiOperation({ 
    summary: 'List documents in a folder',
    description: 'Returns all documents where the specified tag is the primary tag.'
  })
  @ApiParam({ 
    name: 'tag',
    description: 'Primary tag name (folder name)',
    example: 'invoices-2025'
  })
  @ApiResponse({ 
    status: 200,
    description: 'List of documents in the folder',
    type: [DocumentResponseDto]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles(Role.USER, Role.ADMIN, Role.SUPPORT, Role.MODERATOR)
  async byFolder(@TenantUserId() userId: string, @Param('tag') tag: string) {
    return this.docs.listByPrimaryTag(userId, tag);
  }

  @Get('v1/search')
  @ApiOperation({ 
    summary: 'Full-text search across documents',
    description: 'Search documents by text content. Supports optional scoping by folder or specific file IDs.'
  })
  @ApiQuery({ 
    name: 'q',
    required: true,
    description: 'Search query string',
    example: 'payment'
  })
  @ApiQuery({ 
    name: 'scope',
    required: false,
    enum: ['folder', 'files'],
    description: 'Scope type: folder or files (not both)'
  })
  @ApiQuery({ 
    name: 'name',
    required: false,
    description: 'Folder name (required if scope=folder)',
    example: 'invoices-2025'
  })
  @ApiQuery({ 
    name: 'ids',
    required: false,
    description: 'Comma-separated document IDs (required if scope=files)',
    example: '672abc123,672abc456'
  })
  @ApiResponse({ 
    status: 200,
    description: 'Search results',
    type: [DocumentResponseDto]
  })
  @ApiResponse({ status: 400, description: 'Bad request - scope validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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


