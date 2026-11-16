# ADR 0003 — Base de datos: PostgreSQL en Supabase

**Estado:** propuesto, a confirmar por el equipo
**Fecha:** 2026-11-16 (la decisión está vigente desde la migración inicial, 2026-09-01)
**Decide:** equipo

## Contexto

El proyecto necesita persistir un modelo con 11 entidades y 8 enums (`prisma/schema.prisma`). El modelo tiene relaciones 1-N y una N-N con atributos propios (`RutinaEjercicio`), claves foráneas con comportamiento distinto al borrar (`Restrict` para historial, `Cascade` para filas que no tienen sentido sin su padre) y operaciones que deben ser atómicas: reservar (verifica suscripción, superposición y cupo antes de escribir), registrar una cuota (crea la cuota y extiende la suscripción) y activar una rutina (desactiva las demás). La materia permite Postgres o MongoDB y pide justificar la elección en un ADR.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| PostgreSQL en Supabase | El modelo es relacional, y las claves foráneas, los enums y las transacciones están en el motor; Prisma genera migraciones versionadas; plan gratuito; se puede levantar un Postgres idéntico en CI y en local para las pruebas e2e | Hay que manejar dos URL de conexión (por el pooler y directa); el plan gratuito de Supabase puede pausar el proyecto por inactividad |
| MongoDB en Atlas | Esquema flexible; plan gratuito | Las relaciones y la N-N con atributos habría que resolverlas a mano o desnormalizando; las reglas de integridad (`Restrict`/`Cascade`) pasarían a la aplicación; el modelo y las migraciones ya están escritos para Postgres, así que cambiar implicaría rehacerlos |

## Decisión

Elegimos **PostgreSQL en Supabase**, accedido con Prisma.

Porque el dominio es relacional y varias reglas de integridad y atomicidad (historial que no se borra, cupo, cuotas) se apoyan en claves foráneas y transacciones que el motor ya ofrece.

## Consecuencias

- Hay migraciones versionadas en `prisma/migrations/` (`20260901043028_init`, `20261006213610_modelo_gimnasio`). Después de cambiar el schema hay que generar una migración y aplicarla también en la base de producción.
- La conexión usa `DATABASE_URL` (pooler de Supabase) y `DIRECT_URL` (migraciones), y los secretos se comparten por privado, nunca en el repositorio.
- El CI levanta un Postgres 16 propio para las pruebas e2e (`.github/workflows/ci.yml`), y `playwright.config.ts` se niega a correr si la base no es local, porque esas pruebas borran datos.
- Si el proyecto de Supabase se pausa o se rotan las credenciales, el sistema deja de responder hasta restablecerlas.
- Habría que revisar esta decisión si el modelo pasara a ser de documentos sin relaciones fuertes, o si el volumen superara el plan gratuito.
