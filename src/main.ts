import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TenantScopeGuard } from './auth/tenant-scope.guard';
import { RolesGuard } from './auth/roles.guard';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log','error','warn','debug'] });
  app.setGlobalPrefix('v1');
  app.useGlobalGuards(app.get(JwtAuthGuard), app.get(TenantScopeGuard), app.get(RolesGuard));
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
