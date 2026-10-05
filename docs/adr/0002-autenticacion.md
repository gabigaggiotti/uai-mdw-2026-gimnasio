# ADR 0002 — Autenticación y autorización

**Estado:** aceptado
**Fecha:** 2026-10-05
**Decide:** equipo

## Contexto

Los handlers necesitan identificar al usuario y aplicar permisos de servidor. El modelo ya guarda los roles `CLIENTE`, `PROFESOR` y `ADMINISTRADOR`; no se deben aceptar identidad ni rol desde el request.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| Google OAuth con Auth.js y JWT | No guardamos contraseñas ni consultamos la base en cada request | Depende de Google y el rol del JWT no cambia hasta iniciar sesión de nuevo |
| Login propio o sesión en base de datos | Control completo sobre credenciales o revocación inmediata | Más código, almacenamiento seguro de contraseñas o una consulta por request |

## Decisión

Usar Google OAuth con Auth.js `5.0.0-beta.32` y estrategia JWT. Al primer login se crea el usuario con rol `CLIENTE`; los logins siguientes no modifican el rol guardado. Los endpoints verifican el rol en servidor y las consultas de recursos propios filtran por el ID de la sesión en `lib/db/`.

## Consecuencias

- No se guardan contraseñas y no se agrega una tabla de sesiones.
- Un cambio de rol entra en vigor cuando el usuario vuelve a iniciar sesión.
- Si Google no está disponible, los usuarios no pueden iniciar sesión.
- Los secretos de Google y las cookies de prueba se configuran fuera del repositorio.