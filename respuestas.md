# Respuestas - API FitVal

## Parte 5
### Pregunta 6
- **Por qué funciona sin volver a hacer login:** Porque `StaffGuard` consulta la base de datos en tiempo real mediante `UsersService`.
- **Qué pasaría si el rol estuviera en el token:** El sistema seguiría denegando el acceso (`403`) hasta generar un nuevo token con el login actualizado.
