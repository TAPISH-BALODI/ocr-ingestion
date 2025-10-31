import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log','error','warn','debug'] });
  app.setGlobalPrefix('v1');
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  // Swagger/OpenAPI setup
  const config = new DocumentBuilder()
    .setTitle('OCR Ingestion API')
    .setDescription('Document management, OCR webhooks, scoped actions, RBAC, and metrics')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT || 3031);
  console.log(`Application is running on: http://localhost:${process.env.PORT || 3031}`);
  console.log(`Swagger docs available at: http://localhost:${process.env.PORT || 3031}/api`);
}
bootstrap();
