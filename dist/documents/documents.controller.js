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
const swagger_1 = require("@nestjs/swagger");
const documents_service_1 = require("./documents.service");
const create_document_dto_1 = require("./dto/create-document.dto");
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
    (0, swagger_1.ApiOperation)({ summary: 'Upload a document with primary and optional secondary tags' }),
    (0, decorators_1.Roles)(auth_types_1.Role.USER, auth_types_1.Role.ADMIN),
    __param(0, (0, decorators_2.TenantUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_document_dto_1.CreateDocumentDto]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('v1/folders'),
    (0, decorators_1.Roles)(auth_types_1.Role.USER, auth_types_1.Role.ADMIN, auth_types_1.Role.SUPPORT, auth_types_1.Role.MODERATOR),
    __param(0, (0, decorators_2.TenantUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "folders", null);
__decorate([
    (0, common_1.Get)('v1/folders/:tag/docs'),
    (0, decorators_1.Roles)(auth_types_1.Role.USER, auth_types_1.Role.ADMIN, auth_types_1.Role.SUPPORT, auth_types_1.Role.MODERATOR),
    __param(0, (0, decorators_2.TenantUserId)()),
    __param(1, (0, common_1.Param)('tag')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "byFolder", null);
__decorate([
    (0, common_1.Get)('v1/search'),
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