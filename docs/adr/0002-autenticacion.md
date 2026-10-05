# ADR 0002 — Autenticación y autorización

**Estado:** aceptado
**Fecha:** 2026-10-05
**Decide:** equipo

## Contexto

Los handlers necesitan identificar al usuario y aplicar permisos de servidor. El modelo ya guarda los roles `CLIENTE`, `PROFESOR` y `ADMINISTRADOR`; no se deben aceptar identidad ni rol desde el request.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| Google OAuth con Auth.js y JWT | No guardamos contraseñas; no hace falta construir registro, recuperación ni verificación; no se consulta la base para recuperar la sesión en cada request | El login depende de Google; el rol del token es una foto y no se revoca de inmediato |
| Login propio | Control completo sobre credenciales y experiencia de acceso | Hay que guardar contraseñas con hash seguro y resolver registro, recuperación y verificación |
| Sesión persistida en la base | Los cambios de rol y las revocaciones tienen efecto inmediato | Cada request requiere consultar la base y agrega estado al despliegue |
| Permisos como columna de rol | Es sencillo de consultar y alcanza para los tres roles actuales | Si aparecen muchos permisos por recurso, la lógica de roles puede crecer demasiado |
| Tabla de permisos granulares | Permite combinar permisos finos y configurables | Agrega modelo y administración innecesarios para los roles actuales |
| Pertenencia comprobada después con `if` | La comparación puede parecer explícita dentro del handler | Es fácil olvidarla y puede revelar que un recurso ajeno existe |
| Pertenencia incluida en el `where` de Prisma | La consulta no obtiene recursos ajenos; inexistente y ajeno se responden igual | Las consultas de acceso propio deben aceptar y aplicar el ID del usuario |

## Decisión

Usar Google OAuth con Auth.js `5.0.0-beta.32` y estrategia JWT. Al primer login se crea el usuario con rol `CLIENTE`; los logins siguientes no modifican el rol guardado. Mantener el rol en la columna enum `Usuario.rol`, suficiente para `CLIENTE`, `PROFESOR` y `ADMINISTRADOR`. Los endpoints verifican el rol en el servidor y las consultas de acceso propio incluyen el ID de la sesión en el `where` de Prisma dentro de `lib/db/`. Los endpoints de negocio requieren sesión; no hay una ruta de datos pública intencional.

## Consecuencias

- No se guardan contraseñas y no se agrega una tabla de sesiones.
- Un cambio de rol entra en vigor cuando el usuario vuelve a iniciar sesión.
- Si Google no está disponible, los usuarios no pueden iniciar sesión.
- Los secretos de Google y las cookies de prueba se configuran fuera del repositorio.
- No se implementan recuperación de contraseña, verificación de email, segundo factor, refresh tokens, permisos granulares por recurso ni una pantalla de administración de usuarios.