import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { TenantScopeGuard } from './tenant-scope.guard';

@Module({
  imports: [PassportModule],
  providers: [JwtStrategy, RolesGuard, TenantScopeGuard],
  exports: [JwtStrategy, RolesGuard, TenantScopeGuard],
})
export class AuthModule {}
