"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantUserId = exports.CurrentUser = exports.Roles = void 0;
const common_1 = require("@nestjs/common");
const Roles = (...roles) => (0, common_1.SetMetadata)('roles', roles);
exports.Roles = Roles;
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
exports.TenantUserId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantUserId || request.user?.userId;
});
//# sourceMappingURL=decorators.js.map