"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const health_module_1 = require("./health/health.module");
const database_module_1 = require("./database/database.module");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("./users/user.schema");
const tag_schema_1 = require("./tags/tag.schema");
const document_schema_1 = require("./documents/document.schema");
const document_tag_schema_1 = require("./documents/document-tag.schema");
const auth_module_1 = require("./auth/auth.module");
const documents_module_1 = require("./documents/documents.module");
const actions_module_1 = require("./actions/actions.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const metrics_module_1 = require("./metrics/metrics.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./auth/roles.guard");
const tenant_scope_guard_1 = require("./auth/tenant-scope.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            database_module_1.DatabaseModule,
            health_module_1.HealthModule,
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: tag_schema_1.Tag.name, schema: tag_schema_1.TagSchema },
                { name: document_schema_1.Document.name, schema: document_schema_1.DocumentSchema },
                { name: document_tag_schema_1.DocumentTag.name, schema: document_tag_schema_1.DocumentTagSchema },
            ]),
            auth_module_1.AuthModule,
            documents_module_1.DocumentsModule,
            actions_module_1.ActionsModule,
            webhooks_module_1.WebhooksModule,
            metrics_module_1.MetricsModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: tenant_scope_guard_1.TenantScopeGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map