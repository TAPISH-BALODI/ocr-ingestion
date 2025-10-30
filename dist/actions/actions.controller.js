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
exports.ActionsController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const document_schema_1 = require("../documents/document.schema");
const document_tag_schema_1 = require("../documents/document-tag.schema");
const tag_schema_1 = require("../tags/tag.schema");
const usage_schema_1 = require("./usage.schema");
const decorators_1 = require("../auth/decorators");
const audit_service_1 = require("../audit/audit.service");
let ActionsController = class ActionsController {
    constructor(docModel, docTagModel, tagModel, usageModel, audit) {
        this.docModel = docModel;
        this.docTagModel = docTagModel;
        this.tagModel = tagModel;
        this.usageModel = usageModel;
        this.audit = audit;
    }
    async collectContext(userId, scope) {
        if (scope.type === 'folder') {
            const tag = await this.tagModel.findOne({ ownerId: userId, name: scope.name.trim().toLowerCase() }).lean();
            if (!tag)
                return [];
            const links = await this.docTagModel.find({ ownerId: userId, tagId: tag._id, isPrimary: true }).lean();
            const ids = links.map(l => l.documentId);
            return this.docModel.find({ _id: { $in: ids } }).lean();
        }
        const ids = scope.ids.map(id => new mongoose_2.Types.ObjectId(id));
        return this.docModel.find({ _id: { $in: ids }, ownerId: userId }).lean();
    }
    mockProcessor(messages, docs) {
        const combined = docs.map(d => `${d.filename}: ${(d.textContent || '').slice(0, 40)}`).join('\n');
        const prompt = messages.map(m => `${m.role}> ${m.content}`).join('\n');
        return {
            generatedText: `Summary based on ${docs.length} docs\n${combined}\nPROMPT:${prompt}`,
            csv: `filename,chars\n${docs.map(d => `${d.filename},${(d.textContent || '').length}`).join('\n')}`,
        };
    }
    async run(tenantUserId, body) {
        if (!body.scope || !body.actions?.length) {
            return { error: 'scope and actions are required' };
        }
        const userId = new mongoose_2.Types.ObjectId(tenantUserId);
        const docs = await this.collectContext(userId, body.scope);
        const out = this.mockProcessor(body.messages || [], docs);
        const created = [];
        if (body.actions.includes('make_document')) {
            const doc = await this.docModel.create({ ownerId: userId, filename: 'generated.txt', mime: 'text/plain', textContent: out.generatedText });
            created.push(doc);
        }
        if (body.actions.includes('make_csv')) {
            const doc = await this.docModel.create({ ownerId: userId, filename: 'generated.csv', mime: 'text/csv', textContent: out.csv });
            created.push(doc);
        }
        await this.usageModel.create({ userId, credits: 5 });
        await this.audit.log({ userId, action: 'actions.run', entityType: 'Action', metadata: { actions: body.actions, scope: body.scope } });
        return { created: created.map(d => ({ id: d._id, filename: d.filename })), credits: 5 };
    }
    async usageMonth(tenantUserId) {
        const userId = new mongoose_2.Types.ObjectId(tenantUserId);
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const total = await this.usageModel.aggregate([
            { $match: { userId, at: { $gte: start } } },
            { $group: { _id: null, credits: { $sum: '$credits' } } },
        ]);
        return { credits: total[0]?.credits || 0 };
    }
};
exports.ActionsController = ActionsController;
__decorate([
    (0, common_1.Post)('run'),
    __param(0, (0, decorators_1.TenantUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActionsController.prototype, "run", null);
__decorate([
    (0, common_1.Get)('usage/month'),
    __param(0, (0, decorators_1.TenantUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActionsController.prototype, "usageMonth", null);
exports.ActionsController = ActionsController = __decorate([
    (0, common_1.Controller)('v1/actions'),
    __param(0, (0, mongoose_1.InjectModel)(document_schema_1.Document.name)),
    __param(1, (0, mongoose_1.InjectModel)(document_tag_schema_1.DocumentTag.name)),
    __param(2, (0, mongoose_1.InjectModel)(tag_schema_1.Tag.name)),
    __param(3, (0, mongoose_1.InjectModel)(usage_schema_1.Usage.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        audit_service_1.AuditService])
], ActionsController);
//# sourceMappingURL=actions.controller.js.map