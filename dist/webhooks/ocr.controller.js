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
exports.OcrController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const task_schema_1 = require("../tasks/task.schema");
const audit_service_1 = require("../audit/audit.service");
const decorators_1 = require("../auth/decorators");
const ocr_webhook_dto_1 = require("./dto/ocr-webhook.dto");
function classify(text) {
    const t = (text || '').toLowerCase();
    if (/(invoice|payment|legal|contract|tax)/.test(t))
        return 'official';
    if (/(sale|limited time|offer|promo|unsubscribe)/.test(t))
        return 'ad';
    return 'other';
}
function extractUnsubscribe(text) {
    const email = text.match(/mailto:([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i);
    if (email)
        return { channel: 'email', target: email[1] };
    const url = text.match(/https?:\/\/[\w.-]+\.[a-z]{2,}[\w\/?#.&%=-]*/i);
    if (url)
        return { channel: 'web', target: url[0] };
    return null;
}
let OcrController = class OcrController {
    constructor(taskModel, audit) {
        this.taskModel = taskModel;
        this.audit = audit;
    }
    async handle(tenantUserId, payload) {
        const userId = new mongoose_2.Types.ObjectId(tenantUserId);
        const category = classify(payload.text || '');
        await this.audit.log({ userId, action: 'webhook.ocr', entityType: 'Webhook', metadata: { source: payload.source, category } });
        if (category === 'ad') {
            const unsub = extractUnsubscribe(payload.text || '');
            if (unsub) {
                const start = new Date();
                start.setHours(0, 0, 0, 0);
                const count = await this.taskModel.countDocuments({
                    ownerId: userId,
                    source: payload.source,
                    createdAt: { $gte: start },
                });
                if (count < 3) {
                    await this.taskModel.create({ ownerId: userId, status: 'pending', channel: unsub.channel, target: unsub.target, source: payload.source });
                    await this.audit.log({ userId, action: 'task.created', entityType: 'Task', metadata: { channel: unsub.channel, target: unsub.target } });
                }
            }
        }
        return { ok: true, category };
    }
};
exports.OcrController = OcrController;
__decorate([
    (0, common_1.Post)('ocr'),
    (0, swagger_1.ApiOperation)({
        summary: 'Ingest OCR webhook event',
        description: 'Receives OCR text, classifies content (official/ad/other), and creates tasks for ads with rate limiting (max 3 tasks per sender per day).'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook processed successfully',
        type: ocr_webhook_dto_1.OcrWebhookResponseDto,
        example: {
            ok: true,
            category: 'ad'
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, decorators_1.TenantUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ocr_webhook_dto_1.OcrWebhookDto]),
    __metadata("design:returntype", Promise)
], OcrController.prototype, "handle", null);
exports.OcrController = OcrController = __decorate([
    (0, swagger_1.ApiTags)('Webhooks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('v1/webhooks'),
    __param(0, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        audit_service_1.AuditService])
], OcrController);
//# sourceMappingURL=ocr.controller.js.map