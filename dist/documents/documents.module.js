"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const document_schema_1 = require("./document.schema");
const document_tag_schema_1 = require("./document-tag.schema");
const tag_schema_1 = require("../tags/tag.schema");
const documents_service_1 = require("./documents.service");
const documents_controller_1 = require("./documents.controller");
const audit_schema_1 = require("../audit/audit.schema");
const audit_service_1 = require("../audit/audit.service");
let DocumentsModule = class DocumentsModule {
};
exports.DocumentsModule = DocumentsModule;
exports.DocumentsModule = DocumentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: document_schema_1.Document.name, schema: document_schema_1.DocumentSchema },
                { name: document_tag_schema_1.DocumentTag.name, schema: document_tag_schema_1.DocumentTagSchema },
                { name: tag_schema_1.Tag.name, schema: tag_schema_1.TagSchema },
                { name: audit_schema_1.AuditLog.name, schema: audit_schema_1.AuditLogSchema },
            ]),
        ],
        providers: [documents_service_1.DocumentsService, audit_service_1.AuditService],
        controllers: [documents_controller_1.DocumentsController],
    })
], DocumentsModule);
//# sourceMappingURL=documents.module.js.map