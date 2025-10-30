import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log','error','warn','debug'] });
  app.setGlobalPrefix('v1');
  await app.listen(process.env.PORT || 3031);
}
bootstrap();
