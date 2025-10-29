import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from './auth.types';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const TenantUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantUserId || request.user?.userId;
  },
);
