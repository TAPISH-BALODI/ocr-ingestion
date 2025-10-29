"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_strategy_1 = require("./jwt.strategy");
const roles_guard_1 = require("./roles.guard");
const tenant_scope_guard_1 = require("./tenant-scope.guard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [passport_1.PassportModule],
        providers: [jwt_strategy_1.JwtStrategy, roles_guard_1.RolesGuard, tenant_scope_guard_1.TenantScopeGuard],
        exports: [jwt_strategy_1.JwtStrategy, roles_guard_1.RolesGuard, tenant_scope_guard_1.TenantScopeGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map