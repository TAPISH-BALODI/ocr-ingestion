"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const actions_controller_1 = require("./actions.controller");
const document_schema_1 = require("../documents/document.schema");
const document_tag_schema_1 = require("../documents/document-tag.schema");
const tag_schema_1 = require("../tags/tag.schema");
const usage_schema_1 = require("./usage.schema");
const audit_schema_1 = require("../audit/audit.schema");
const audit_service_1 = require("../audit/audit.service");
let ActionsModule = class ActionsModule {
};
exports.ActionsModule = ActionsModule;
exports.ActionsModule = ActionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: document_schema_1.Document.name, schema: document_schema_1.DocumentSchema },
                { name: document_tag_schema_1.DocumentTag.name, schema: document_tag_schema_1.DocumentTagSchema },
                { name: tag_schema_1.Tag.name, schema: tag_schema_1.TagSchema },
                { name: usage_schema_1.Usage.name, schema: usage_schema_1.UsageSchema },
                { name: audit_schema_1.AuditLog.name, schema: audit_schema_1.AuditLogSchema },
            ]),
        ],
        controllers: [actions_controller_1.ActionsController],
        providers: [audit_service_1.AuditService],
    })
], ActionsModule);
//# sourceMappingURL=actions.module.js.map