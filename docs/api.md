# Contrato de la API

> Este documento se completa clase a clase. Hoy (clase 5) se agrega la sección
> "Los errores, en detalle": cada fila tiene que poder trazarse a una regla de
> negocio de [`docs/spec.md`](./spec.md), sección 6.

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
El resto del catálogo (clases, profesores, planes, cuotas, lesiones, rutinas,
notas, ejercicios) queda pendiente: son en su mayoría 400 de Zod (ya resueltos
desde la clase 2) o TODO (clase 6) de autorización, sin una regla de negocio
nueva de por medio todavía.

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
