import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AllExceptionsFilter } from '../common/all-exceptions.filter';

// Configuración común de la API: prefijo, versiones, seguridad y validación de DTO
export function configureApp(app: INestApplication) {
  // Todas las rutas empiezan por /api
  app.setGlobalPrefix('api');

  // Versionado en la URL, v1 por defecto
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Cabeceras de seguridad con Helmet
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // Filtro global de excepciones: mismo formato en todos los errores
  app.useGlobalFilters(new AllExceptionsFilter());

  // Comprueba los DTO en todas las rutas
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // quita los campos que no estén en el DTO...
      forbidNonWhitelisted: true, // ...o mejor: responde 400 si llegan
      transform: true, // aplica las transformaciones del DTO (como el trim)
    }),
  );
}
