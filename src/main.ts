import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.config';

// Carga .env solo si existe (local); en Render las variables vienen del dashboard
try {
  process.loadEnvFile();
} catch {
  // .env no existe, se usan las variables de entorno del sistema (Render)
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Para Render: confía en el proxy para leer la IP real del cliente
  app.set('trust proxy', 1);

  // Sirve los ficheros subidos en /uploads
  app.useStaticAssets('uploads', { prefix: '/uploads' });

  // Misma configuración que los tests
  configureApp(app);

  // Documentación con Swagger en /docs
  const config = new DocumentBuilder()
    .setTitle('API de FitVal')
    .setDescription('API del gimnasio FitVal con NestJS y PostgreSQL')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
