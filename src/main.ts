import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.config';

process.loadEnvFile(); // lee el .env y guarda sus valores en process.env

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Para Render: confía en el proxy para leer la IP real del cliente
  app.set('trust proxy', 1);

  // Misma configuración que los tests
  configureApp(app);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
