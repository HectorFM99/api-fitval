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
