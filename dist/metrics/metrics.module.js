"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const metrics_controller_1 = require("./metrics.controller");
const document_schema_1 = require("../documents/document.schema");
const document_tag_schema_1 = require("../documents/document-tag.schema");
const tag_schema_1 = require("../tags/tag.schema");
const usage_schema_1 = require("../actions/usage.schema");
const task_schema_1 = require("../tasks/task.schema");
let MetricsModule = class MetricsModule {
};
exports.MetricsModule = MetricsModule;
exports.MetricsModule = MetricsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: document_schema_1.Document.name, schema: document_schema_1.DocumentSchema },
                { name: document_tag_schema_1.DocumentTag.name, schema: document_tag_schema_1.DocumentTagSchema },
                { name: tag_schema_1.Tag.name, schema: tag_schema_1.TagSchema },
                { name: usage_schema_1.Usage.name, schema: usage_schema_1.UsageSchema },
                { name: task_schema_1.Task.name, schema: task_schema_1.TaskSchema },
            ]),
        ],
        controllers: [metrics_controller_1.MetricsController],
    })
], MetricsModule);
//# sourceMappingURL=metrics.module.js.map