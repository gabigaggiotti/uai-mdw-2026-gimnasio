# Contrato de la API

> Este documento se completa clase a clase. Cada fila tiene que poder trazarse
> a una regla de negocio de [`docs/spec.md`](./spec.md), sección 6.

## Autenticación y permisos

La identidad se obtiene de la sesión de Auth.js en el servidor. Ningún endpoint
acepta `usuarioId` o `rol` como identidad desde el body, headers o query string.
Las rutas de negocio requieren sesión; no hay endpoints de datos públicos.

| Operaciones | Roles permitidos | Alcance |
|---|---|---|
| `GET /api/clases`, `GET /api/planes`, `GET /api/ejercicios` y sus GET por ID | Cualquier usuario autenticado | Datos del catálogo |
| Crear, editar y borrar clases, planes y ejercicios | `ADMINISTRADOR` | Global |
| Todas las operaciones de `/api/profesores` | `ADMINISTRADOR` | Global |
| `GET /api/reservas`, `POST /api/reservas` | `CLIENTE` | Solo reservas del usuario de sesión; al crear, el cliente sale de la sesión |
| `GET /api/reservas/:id`, cancelación de reserva | `CLIENTE`, `ADMINISTRADOR` | Para Cliente, la consulta y la cancelación filtran por su ID; un recurso ajeno responde `404` |
| `GET /api/suscripciones` | `CLIENTE` | Solo sus propias suscripciones |
| `POST /api/suscripciones` | `ADMINISTRADOR` | Global |
| `GET /api/suscripciones/:id`, cancelación de suscripción | `CLIENTE`, `ADMINISTRADOR` | Para Cliente, filtra por su ID y oculta ajenas con `404` |
| `GET /api/cuotas`, `GET /api/cuotas/:id` | `CLIENTE`, `ADMINISTRADOR` | Para Cliente, solo cuotas de sus suscripciones; ajenas responden `404` |
| `POST /api/cuotas` | `ADMINISTRADOR` | Global |
| `GET /api/lesiones`, `GET /api/lesiones/:id` | `CLIENTE`, `PROFESOR`, `ADMINISTRADOR` | Cliente solo ve las propias; Profesor y Administrador pueden consultar cualquiera |
| `POST /api/lesiones` | `CLIENTE`, `PROFESOR`, `ADMINISTRADOR` | Cliente solo puede registrar para sí mismo; Profesor y Administrador pueden registrar para cualquier cliente |
| Editar lesión y marcarla recuperada | `PROFESOR`, `ADMINISTRADOR` | Global |
| `GET /api/rutinas`, `GET /api/rutinas/:id` y ejercicios de una rutina | `CLIENTE`, `PROFESOR`, `ADMINISTRADOR` | Cliente solo ve las propias; Profesor y Administrador pueden consultar cualquiera |
| Crear, editar o borrar rutinas y sus ejercicios | `PROFESOR`, `ADMINISTRADOR` | Global |
| Activar rutina | `CLIENTE`, `ADMINISTRADOR` | Cliente solo puede activar una propia; Administrador puede activar cualquiera |

`requerirUsuario` responde `401` si falta la sesión y `403` si el rol no está
permitido. Para la pertenencia, `lib/db/` incluye el usuario de sesión en el
`where`; una fila ajena y una inexistente producen el mismo `404`.

## Los errores, en detalle

| Operación                           | Situación                                                        | Status | Mensaje                                                             | Capa que lo agarra |
| ------------------------------------ | ------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------- | ------------------- |
| `POST /api/reservas`                 | El cliente no tiene ninguna suscripción/cuota ACTIVA y vigente      | 409    | "Necesitás una suscripción o cuota activa para reservar"              | Regla (`lib/reservas.ts`) |
| `POST /api/reservas`                 | El cliente ya tiene otra reserva ese mismo día en ese horario        | 409    | "Ya tenés una reserva ese día en ese mismo horario"                    | Regla (`lib/reservas.ts`) |
| `POST /api/reservas`                 | Ya no hay cupo para esa clase y esa fecha                          | 409    | "No hay cupo disponible para esta clase"                               | Regla (`lib/reservas.ts`) |
| `POST /api/reservas`                 | El `claseId` no existe                                             | 404    | "No encontrado"                                                        | Base (Prisma P2025)  |
| `POST /api/reservas/{id}/cancelacion`| Faltan menos de 2hs para el inicio de la clase                     | 409    | "Ya no se puede cancelar: faltan menos de 2 horas para la clase"       | Regla (`lib/reservas.ts`) |
| `POST /api/reservas/{id}/cancelacion`| La reserva ya estaba CANCELADA                                     | 409    | "La reserva ya está cancelada"                                         | Handler (ya existía) |
| `POST /api/reservas/{id}/cancelacion`| El `id` no existe                                                  | 404    | "No encontrado"                                                        | Handler (ya existía) |

Las cuatro reglas de negocio de arriba (suscripción vigente, sin superposición,
cupo, cancelación anticipada) salen directo de la sección 6 de `docs/spec.md`.
El resto de los endpoints aplica las reglas de autorización y pertenencia de la
sección "Autenticación y permisos"; las validaciones de Zod responden `400`.

### Por qué 409 y no 400

En los cuatro casos de regla el `body` del request es perfecto: el `claseId`
es válido, la fecha tiene el formato correcto. Lo que falla es el **estado
del sistema** (no hay suscripción vigente, ese horario ya está ocupado, ese
cupo ya se llenó, ya pasó el límite de tiempo) — la prueba práctica de la
clase 5: *¿el cliente puede arreglarlo mandando el request distinto?* No,
tendría que pasar otra cosa en el sistema (pagar la cuota, elegir otro
horario, esperar a que se libere un lugar). Por eso es 409, no 400.

### Errores esperados vs. inesperados

Los casos de la tabla son **esperados**: se devuelven como un valor (las
funciones de `lib/reservas.ts` y `lib/suscripciones.ts` devuelven `boolean`;
`lib/db/reservas.ts` lanza el error de dominio correspondiente) y un único
`try/catch` por handler los traduce a su status vía
`lib/http.ts#manejarError`. Cualquier otra cosa (falla de la base, un bug)
cae en el mismo catch y responde `500` genérico, sin detalles — el detalle va
a `console.error`, nunca al cliente.
