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
exports.MetricsController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const document_schema_1 = require("../documents/document.schema");
const tag_schema_1 = require("../tags/tag.schema");
const document_tag_schema_1 = require("../documents/document-tag.schema");
const usage_schema_1 = require("../actions/usage.schema");
const task_schema_1 = require("../tasks/task.schema");
const decorators_1 = require("../auth/decorators");
let MetricsController = class MetricsController {
    constructor(docModel, tagModel, docTagModel, usageModel, taskModel) {
        this.docModel = docModel;
        this.tagModel = tagModel;
        this.docTagModel = docTagModel;
        this.usageModel = usageModel;
        this.taskModel = taskModel;
    }
    async get(tenantUserId) {
        const owner = new mongoose_2.Types.ObjectId(tenantUserId);
        const [docs_total, folders_total] = await Promise.all([
            this.docModel.countDocuments({ ownerId: owner }),
            this.docTagModel.distinct('tagId', { ownerId: owner, isPrimary: true }).then(arr => arr.length),
        ]);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const actions_monthAgg = await this.usageModel.aggregate([
            { $match: { userId: owner, at: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$credits' } } },
        ]);
        const actions_month = actions_monthAgg[0]?.total ? Math.floor(actions_monthAgg[0].total / 5) : 0;
        const startToday = new Date();
        startToday.setHours(0, 0, 0, 0);
        const tasks_today = await this.taskModel.countDocuments({ ownerId: owner, createdAt: { $gte: startToday } });
        return { docs_total, folders_total, actions_month, tasks_today };
    }
};
exports.MetricsController = MetricsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, decorators_1.TenantUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "get", null);
exports.MetricsController = MetricsController = __decorate([
    (0, common_1.Controller)('v1/metrics'),
    __param(0, (0, mongoose_1.InjectModel)(document_schema_1.Document.name)),
    __param(1, (0, mongoose_1.InjectModel)(tag_schema_1.Tag.name)),
    __param(2, (0, mongoose_1.InjectModel)(document_tag_schema_1.DocumentTag.name)),
    __param(3, (0, mongoose_1.InjectModel)(usage_schema_1.Usage.name)),
    __param(4, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], MetricsController);
//# sourceMappingURL=metrics.controller.js.map