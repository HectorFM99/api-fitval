import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

// Configuración común de la API: prefijo, versiones y validación de DTO
export function configureApp(app: INestApplication) {
  // Todas las rutas empiezan por /api
  app.setGlobalPrefix('api');

  // Versionado en la URL, v1 por defecto
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Comprueba los DTO en todas las rutas
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // quita los campos que no estén en el DTO...
      forbidNonWhitelisted: true, // ...o mejor: responde 400 si llegan
      transform: true, // aplica las transformaciones del DTO (como el trim)
    }),
  );
}
