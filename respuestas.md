# Respuestas - API FitVal

## Ejercicio 0
- **Línea de error al hacer push a main:**
  `remote: error: Protected branch hook declined changes.` / `GH006: Protected branch hook declined changes.`

---

## Parte 1
### Pregunta 1
- **Código que recibe el cliente:** `500 Internal Server Error`.
- **Qué se ve en la terminal:** El error detallado de conexión `ECONNREFUSED` de PostgreSQL con puerto e IP.
- **Por qué es mejor así:** Oculta detalles internos de infraestructura y mensajes técnicos al cliente por seguridad.

---

## Parte 2
### Pregunta 2
- **Con `$1` (segura):** Devuelve solo las clases que coinciden con el filtro de actividad.
- **Con interpolación (`${activity}`):** Devuelve **todas** las clases porque la inyección `' OR 1=1 --` anula la condición WHERE convirtiéndola en `TRUE` y comenta el resto de la sentencia SQL.

---

## Parte 3
### Pregunta 3
- **Para qué comprobamos el monitor en la API:** Para responder con un código HTTP `400 Bad Request` claro cuando el monitor no existe.
- **Qué recibiría el cliente sin esto:** Un error `500 Internal Server Error` derivado del fallo de clave ajena en PostgreSQL.

### Pregunta 4
- **Por qué es `409` y no `400`:** Porque `400` es para peticiones mal formadas, mientras que `409 Conflict` indica que la petición es válida pero entra en conflicto con el estado actual de los datos (tiene reservas activas).

---

## Parte 4
### Pregunta 5
- **Qué datos lleva el token:** `{ "sub": id, "iat": ..., "exp": ... }`.
- **Por qué no metemos el rol:** Para evitar que los permisos queden desactualizados si el rol cambia en la base de datos antes de que expire el token.

---

## Parte 5
### Pregunta 6
- **Por qué funciona sin volver a hacer login:** Porque `StaffGuard` consulta la base de datos en tiempo real mediante `UsersService`.
- **Qué pasaría si el rol estuviera en el token:** El sistema seguiría denegando el acceso (`403`) hasta generar un nuevo token con el login actualizado.

---

## Parte 6
### Pregunta 7
- **Qué se prueba con los tests unitarios:** Que `toGymClass`, `toPlan`, `ClassesService` (incluido `findPage`) y `StaffGuard` funcionan aislados, sin base de datos ni HTTP real.
- **Dónde están:** En `src/**/*.spec.ts`, ejecutados con `npm test`. Pasan 13 tests.

---

## Parte 7
### Pregunta 8
- **Qué prueban los tests de integración (e2e):** Que la API responde correctamente por HTTP: estado `healthy`, listado de clases, login con token, y que las clases devuelven `403` sin rol de staff.
- **Dónde están:** En `test/fitval.e2e-spec.ts`, ejecutados con `npm run test:e2e` contra PostgreSQL real.

---

## Parte 8
### Pregunta 9
- **Cómo funciona el versionado:** Con `enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })`, las rutas se exponen bajo `/api/v1/...` y `/api/v2/...`.
- **Cómo funciona la paginación:** `ListClassesQueryDto` recibe `page` y `limit`; `findPage` devuelve `{ data, total, page, totalPages }` con `OFFSET`/`LIMIT` en SQL.

---

## Parte 9
### Pregunta 10
- **Helmet:** Aplica cabeceras de seguridad; `crossOriginResourcePolicy: 'cross-origin'` permite compartir recursos entre orígenes.
- **AllExceptionsFilter:** Unifica el formato de error con `{ timestamp, path, message }` para cualquier excepción no controlada.
- **Throttler:** Global de 20 req/min por IP (`APP_GUARD` + `ThrottlerGuard`) y `@Throttle({ default: { limit: 5, ttl: 60000 } })` solo en login (5 intentos/min).

---

## Parte 10
### Pregunta 11
- **GET trainers con especialidades:** `JOIN` entre `trainers`, `trainer_specialties` y `specialties`, mapeado con `toTrainer` que agrupa las especialidades por monitor.
- **POST con transacción:** `trainersService.create` abre `BEGIN`, inserta monitor e especialidades, hace `COMMIT`; si falla (violación única 23505 DNI/correo) hace `ROLLBACK` y responde `409 Conflict`.

---

## Parte 11
### Pregunta 12
- **Subida de foto:** `multer` con `diskStorage` en `./uploads`, `fileFilter` que solo permite `.jpg/.jpeg/.png`, y `limits.fileSize` de 2 MB.
- **Foto persistida:** La ruta se guarda en `trainers.photo_url` y se sirve estáticamente con `useStaticAssets('uploads', { prefix: '/uploads' })` bajo `/uploads/`.

---

## Parte 13
### Pregunta 13
- **Qué dice ahora `/api/v1/health` en `database`:** Dice `"database": "postgres"` (el nombre de la base de datos por defecto de Supabase), no `"fitval"`.
- **Por qué:** El endpoint ejecuta `SELECT current_database()`, que devuelve el nombre de la base de datos a la que está conectada la API en ese momento, que en Supabase es `postgres`.
- **¿Has tenido que cambiar algo del código?** No. El código ya devuelve el nombre dinámico de la base de datos conectada, así que funciona igual con Docker que con Supabase sin modificaciones.

---

### Pregunta 14
- **Qué ha pasado con la foto:** La foto se subió al disco local del servidor de Render (`uploads/`), pero al hacer un nuevo despliegue (`Deploy latest commit`), el disco efímero de Render se reinicia y la imagen física desaparece.
- **¿Y con el `photoUrl`?** Sigue apuntando a la ruta antigua (`/uploads/xxx.png`), pero ese archivo ya no existe en el nuevo despliegue, así que devuelve 404.
- **Por qué:** Render usa un sistema de archivos efímero; los archivos subidos no persisten entre despliegues.
- **¿Dónde habría que guardar las fotos?** En un servicio de almacenamiento en la nube (por ejemplo Supabase Storage, AWS S3 o similar) con un bucket público, y guardar en la base de datos la URL remota, no una ruta local.

---

### Pregunta 15
- **Ejercicio 13.8 — ¿por qué la Direct connection no funciona desde Render y el Session pooler sí?** La conexión directa apunta al puerto 5432 de PostgreSQL y requiere que Render esté en la misma red privada (VPC) de Supabase o que se añada la IP de Render a la lista de permitidos. Desde Render (fuera de Supabase) no es alcanzable, da `ENETUNREACH`. El Session pooler sí es accesible desde internet y es el que debe usarse.
- **Ejercicio 13.9 — ¿qué código recibes y por qué?** Al cambiar `JWT_SECRET`, el token de Ana ya no es válido porque su firma fue generada con el secreto antiguo. La API responde `401 Unauthorized`.
- **¿En qué situación real cambiarías el secreto a propósito?** Si se filtra o sospechas que está comprometido, para invalidar todos los tokens existentes y forzar a todos los usuarios a hacer login de nuevo.
