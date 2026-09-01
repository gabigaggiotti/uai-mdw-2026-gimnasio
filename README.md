# Proyecto MDW 2026 — Sistema de gestión para gimnasio

**Equipo:**

- Gabriele Gaggiotti — responsable del repositorio (creó el repo y tiene la cuenta de Vercel)
- Ramiro Filippi
- Agustin Faucetta
- Lucas Jaime

**Producción:** https://uai-mdw-2026-gimnasio.vercel.app

**Problema que resuelve:** Los gimnasios chicos coordinan las reservas de clases por WhatsApp o en papel, y terminan con clases sobrevendidas o socios que viajan hasta el gimnasio y se quedan sin lugar.

**Flujo principal:** El cliente consulta la grilla, reserva un lugar en una clase con cupo disponible y recibe la confirmación; el administrador gestiona las clases, los profesores y los planes.

**Roles:** Cliente (reserva y cancela) y Administrador (gestiona grilla, profesores y planes).

**Stack:** Next.js (App Router) + TypeScript + Postgres (Supabase) + Prisma + Zod + Tailwind. Deploy en Vercel.

## Puesta en marcha

Requisitos: Node 20+, npm, y una base de datos: **Postgres** (Supabase) o **MongoDB** (Atlas). Las dos tienen plan gratuito.

```bash
npm install
cp .env.example .env.local     # completar DATABASE_URL, DIRECT_URL y AUTH_SECRET
npx prisma migrate dev --name init
npm run db:seed
npm run dev                       # http://localhost:3000
```

Generar el `AUTH_SECRET`:

```bash
npx auth secret
```

> Usen **npm** en todo el equipo y commiteen el `package-lock.json`. Si alguien instala con otro gestor aparece un segundo lockfile y las instalaciones dejan de ser reproducibles.

> **Los que se suman después:** la base ya está creada y migrada. Pedile las dos connection strings al responsable del repo (por privado, nunca al repo), pegalas en tu `.env.local` y corré solo `npm install` y `npx prisma generate`. No corras la migración.

> **En Windows**, si `npm` falla con "la ejecución de scripts está deshabilitada":
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## Comandos

| Comando                  | Para qué                                        |
| ------------------------ | ----------------------------------------------- |
| `npm run dev`            | Levantar en desarrollo                          |
| `npm run build`          | Build de producción (lo mismo que corre Vercel) |
| `npm run lint`           | Lint                                            |
| `npm run typecheck`      | Chequeo de tipos sin emitir                     |
| `npm test`               | Tests                                           |
| `npx prisma migrate dev` | Crear y aplicar una migración                   |
| `npx prisma studio`      | Ver y editar los datos a mano                   |
| `npm run db:seed`        | Cargar datos de ejemplo                         |

## Estructura

```
app/                    rutas (App Router)
  (public)/             páginas sin sesión
  (app)/                páginas con sesión
  api/                  Route Handlers
components/             componentes de UI
lib/
  db/                   acceso a datos — ÚNICO lugar que habla con Prisma
  schemas/              schemas de Zod (validación + tipos)
  auth.ts               configuración de sesión y roles
prisma/
  schema.prisma         modelo de datos
  seed.ts               datos de ejemplo
docs/
  spec.md               qué hace el sistema (requerimientos)
  adr/                  decisiones técnicas y por qué
```

## Reglas del equipo

- Nadie pushea a `main`. Todo entra por Pull Request con al menos 1 aprobación.
- Las convenciones de código están en [`AGENTS.md`](./AGENTS.md) — mantenerlo al día es responsabilidad del equipo.
- Una decisión técnica que cueste revertir se documenta como ADR en `docs/adr/`.

## Definition of Done

Una tarea está terminada cuando:

- [ ] Funciona en el preview deployment, no solo en la máquina de quien la escribió.
- [ ] La validación está en el servidor, no solo en el cliente.
- [ ] Los estados de carga y error están resueltos en la UI.
- [ ] `npm run build` y `npm run typecheck` pasan.
- [ ] Alguien más del equipo la revisó y puede explicarla.
