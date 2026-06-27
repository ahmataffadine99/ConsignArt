import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { BusinessRuleFilter } from './common/filters/business-rule.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation des DTO globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtres d'exceptions globaux
  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    new BusinessRuleFilter(),
  );

  // Intercepteurs globaux
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('ConsignArt API')
    .setDescription("L'API de gestion pour la galerie d'art ConsignArt")
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // L'UI sera sur http://localhost:3000/api

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
