"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const tenant_scope_guard_1 = require("./auth/tenant-scope.guard");
const roles_guard_1 = require("./auth/roles.guard");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: ['log', 'error', 'warn', 'debug'] });
    app.setGlobalPrefix('v1');
    app.useGlobalGuards(app.get(jwt_auth_guard_1.JwtAuthGuard), app.get(tenant_scope_guard_1.TenantScopeGuard), app.get(roles_guard_1.RolesGuard));
    await app.listen(process.env.PORT || 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map