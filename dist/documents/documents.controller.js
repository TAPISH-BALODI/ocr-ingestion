"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const documents_service_1 = require("./documents.service");
const create_document_dto_1 = require("./dto/create-document.dto");
const document_response_dto_1 = require("./dto/document-response.dto");
const decorators_1 = require("../auth/decorators");
const auth_types_1 = require("../auth/auth.types");
const decorators_2 = require("../auth/decorators");
const audit_service_1 = require("../audit/audit.service");
let DocumentsController = class DocumentsController {
    constructor(docs, audit) {
        this.docs = docs;
        this.audit = audit;
    }
    async create(userId, dto) {
        const doc = await this.docs.create(userId, dto);
        await this.audit.log({ userId, action: 'document.upload', entityType: 'Document', entityId: String(doc._id), metadata: { filename: doc.filename } });
        return doc;
    }
    async upload(userId, file, primaryTag, secondaryTags) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        if (!primaryTag) {
            throw new common_1.BadRequestException('primaryTag is required');
        }
        const textContent = file.buffer.toString('utf-8');
        const dto = {
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
    async folders(userId) {
        return this.docs.listFolders(userId);
    }
    async byFolder(userId, tag) {
        return this.docs.listByPrimaryTag(userId, tag);
    }
    async search(userId, q, scope, name, idsCsv) {
        if (scope === 'folder' && idsCsv) {
            return { error: 'Scope must be either folder or files, not both' };
        }
        const ids = idsCsv ? idsCsv.split(',').map(s => s.trim()).filter(Boolean) : undefined;
        return this.docs.search(userId, q || '', scope ? { type: scope, name, ids } : undefined);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)('v1/docs'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload a document with primary and optional secondary tags',
        description: 'Upload a document with text content and tags. You can either send JSON with textContent or upload a file (file upload will extract text automatically).'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Document created successfully',
        type: document_response_dto_1.DocumentResponseDto,
        example: {
            _id: '672abc123def456',
            ownerId: 'user123',
            filename: 'invoice-001.pdf',
            mime: 'application/pdf',
            textContent: 'Invoice total $1200. Payment due.',
            createdAt: '2025-10-30T12:00:00.000Z'
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient role' }),
    (0, decorators_1.Roles)(auth_types_1.Role.USER, auth_types_1.Role.ADMIN),
    __param(0, (0, decorators_2.TenantUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_document_dto_1.CreateDocumentDto]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('v1/docs/upload'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload a document file with primary and optional secondary tags',
        description: 'Upload a file directly (multipart/form-data). The system will extract text content from the file.'
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Document uploaded and created successfully',
        type: document_response_dto_1.DocumentResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, decorators_1.Roles)(auth_types_1.Role.USER, auth_types_1.Role.ADMIN),
    __param(0, (0, decorators_2.TenantUserId)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('primaryTag')),
    __param(3, (0, common_1.Body)('secondaryTags')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)('v1/folders'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all folders with document counts',
        description: 'Returns all primary tags (folders) with the number of documents in each folder.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of folders',
        type: [document_response_dto_1.FolderDto],
        example: [
            { name: 'invoices-2025', count: 5 },
            { name: 'receipts', count: 3 }
        ]
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, decorators_1.Roles)(auth_types_1.Role.USER, auth_types_1.Role.ADMIN, auth_types_1.Role.SUPPORT, auth_types_1.Role.MODERATOR),
    __param(0, (0, decorators_2.TenantUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "folders", null);
__decorate([
    (0, common_1.Get)('v1/folders/:tag/docs'),
    (0, swagger_1.ApiOperation)({
        summary: 'List documents in a folder',
        description: 'Returns all documents where the specified tag is the primary tag.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'tag',
        description: 'Primary tag name (folder name)',
        example: 'invoices-2025'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of documents in the folder',
        type: [document_response_dto_1.DocumentResponseDto]
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, decorators_1.Roles)(auth_types_1.Role.USER, auth_types_1.Role.ADMIN, auth_types_1.Role.SUPPORT, auth_types_1.Role.MODERATOR),
    __param(0, (0, decorators_2.TenantUserId)()),
    __param(1, (0, common_1.Param)('tag')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "byFolder", null);
__decorate([
    (0, common_1.Get)('v1/search'),
    (0, swagger_1.ApiOperation)({
        summary: 'Full-text search across documents',
        description: 'Search documents by text content. Supports optional scoping by folder or specific file IDs.'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'q',
        required: true,
        description: 'Search query string',
        example: 'payment'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'scope',
        required: false,
        enum: ['folder', 'files'],
        description: 'Scope type: folder or files (not both)'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'name',
        required: false,
        description: 'Folder name (required if scope=folder)',
        example: 'invoices-2025'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'ids',
        required: false,
        description: 'Comma-separated document IDs (required if scope=files)',
        example: '672abc123,672abc456'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Search results',
        type: [document_response_dto_1.DocumentResponseDto]
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - scope validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, decorators_1.Roles)(auth_types_1.Role.USER, auth_types_1.Role.ADMIN, auth_types_1.Role.SUPPORT, auth_types_1.Role.MODERATOR),
    __param(0, (0, decorators_2.TenantUserId)()),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('scope')),
    __param(3, (0, common_1.Query)('name')),
    __param(4, (0, common_1.Query)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "search", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('Documents'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService, audit_service_1.AuditService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map