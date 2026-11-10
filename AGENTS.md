# AGENTS.md — reglas de este proyecto

Este archivo lo lee tu asistente de IA (Cursor, Copilot, Claude Code, etc.) antes de escribir código. Manténlo actualizado: si el equipo cambia una convención y esto no lo refleja, la IA va a seguir escribiendo con la convención vieja.

> **Cómo se escribe una regla acá:** verificable, no aspiracional. "Escribir código limpio" no es una regla. "Un componente por archivo, en PascalCase" sí lo es.

## Qué es este proyecto

<Completar en la clase 1: qué hace el sistema, quiénes son los dos roles y cuál es el flujo principal.>

Sistema de gestión para un gimnasio. Los clientes reservan lugares en las clases de la grilla semanal; los administradores gestionan clases, profesores y planes.

Dos roles:

- **Cliente:** consulta la grilla, reserva y cancela sus lugares.
- **Administrador:** da de alta, edita y baja clases, profesores y planes.

Flujo principal: el cliente elige una clase con cupo disponible, confirma la reserva y recibe la confirmación.

## La especificación

Lo que el sistema tiene que hacer está en [`docs/spec.md`](./docs/spec.md): entidades, historias de usuario con sus criterios de aceptación, el flujo principal y las reglas de negocio.

- **Antes de escribir lógica de dominio, leelo.** Las reglas de la sección 6 no se deducen del código.
- **Si algo no está ahí, no lo inventes: preguntá.** Una regla de negocio adivinada es un error que compila y que nadie detecta hasta producción.
- Las reglas no se copian a este archivo: viven en un solo lugar y se leen desde ahí.

## Stack

- Next.js (App Router) + TypeScript
- Postgres + Prisma (o MongoDB Atlas + Prisma, si el equipo lo eligió y lo documentó en un ADR)
- Zod para validación
- Auth.js para sesión y roles
- Tailwind + shadcn/ui
- Deploy en Vercel

## Comandos

```bash
npm run dev          # desarrollo
npm run build        # build de producción
npm run typecheck    # chequeo de tipos
npm run lint         # lint
npm test             # pruebas de dominio (vitest, sin base)
npm run test:e2e     # flujo principal y permisos (Playwright, base local)
npx prisma migrate dev --name <nombre>
```

Después de tocar `prisma/schema.prisma`, siempre generar una migración. Nunca editar SQL de migraciones ya aplicadas.

## Estructura y dónde va cada cosa

| Si vas a escribir…         | Va en…                                                            |
| -------------------------- | ----------------------------------------------------------------- |
| Una página                 | `app/(public)/` si es sin sesión, `app/(app)/` si requiere sesión |
| Un endpoint                | `app/api/<recurso>/route.ts`                                      |
| Una Server Action          | `acciones.ts` al lado de la página que la usa, con `"use server"` |
| Un formulario              | `formulario.tsx` (o un nombre propio) al lado de su `page.tsx`    |
| Un componente base de UI   | `components/ui/` (shadcn/ui). No sabe nada del dominio            |
| Un componente del dominio  | `components/` (sabe qué es una clase, una reserva, un rol)        |
| Una consulta a la base     | `lib/db/<entidad>.ts`                                             |
| Una regla de negocio pura  | `lib/<dominio>.ts`, con su `lib/<dominio>.test.ts`                |
| Un caso de uso con dos puertas (API + Server Action) | `lib/casos/<verbo-entidad>.ts`          |
| Una llamada a un servicio externo | `lib/servicios/<cual>.ts`                                  |
| Un schema de validación    | `lib/schemas/<entidad>.ts`                                        |
| Un helper sin dependencias | `lib/utils.ts`                                                    |
| Una prueba e2e             | `e2e/<tema>.spec.ts`                                              |

## Reglas

### Datos

- **Todo acceso a la base pasa por `lib/db/`.** Está prohibido importar el cliente de Prisma en componentes o en `app/`.
- El cliente de Prisma se importa solo desde `lib/db/client.ts`.
- Toda consulta que devuelva listas tiene paginación o límite explícito.

### Validación

- **Toda entrada externa se valida con un schema de Zod** definido en `lib/schemas/`. Entrada externa = body de un request, params, query string, formulario, respuesta de una API de terceros.
- El mismo schema se usa en el cliente y en el servidor. No duplicar reglas de validación.
- El tipo se **deriva** del schema con `z.infer`. No se escribe un `type` aparte que después se desincroniza.
- Todo campo con un conjunto conocido de valores —estados, roles, categorías— va como **unión literal** (`z.enum`), nunca `string`.
- Las fechas relativas a "ahora" se validan con `.refine()`, no con `.max(new Date())`: ese `new Date()` se evalúa al construir el schema y queda congelado al arrancar el servidor.
- Prohibido `any`. Si no se conoce el tipo, usar `unknown` y validar.

### Seguridad

- **La autorización se verifica siempre en el servidor**, en cada Route Handler y cada Server Action. Que la UI esconda un botón no es una medida de seguridad.
- Nunca confiar en un `userId` o un `role` que venga del cliente: se leen de la sesión.
- Los secretos van en variables de entorno. Ninguna variable con secretos lleva el prefijo `NEXT_PUBLIC_`.

### Servicios externos

- **Todo servicio de terceros se llama solo desde `lib/servicios/<cual>.ts`**, y ese archivo es el único que lee su credencial de `process.env`.
- Ninguna llamada a un tercero sin timeout (`AbortSignal.timeout`). Hoy: 5 segundos.
- El módulo **devuelve, no lanza**: el resultado o `null`/`false`, y loguea la falla con `console.error`.
- Si el servicio es accesorio (`docs/spec.md`, sección 8), la llamada va **después** de la operación principal y su falla no cambia el status de la respuesta.

### React / Next

- Los componentes son Server Components por defecto. `"use client"` solo si hay estado, efectos o eventos del navegador, y en el componente más chico posible (nunca arriba de una página entera).
- Las páginas leen datos con `await` a `lib/db/`, **nunca con `fetch` a la API propia**. La consulta lleva el id de la sesión.
- Las fechas se formatean en el servidor y al cliente viaja el texto (`lib/utils.ts#formatearDia`).
- Un componente por archivo. El componente exportado va en PascalCase; el archivo, en kebab-case como los genera shadcn/ui (`components/sin-datos.tsx` exporta `SinDatos`). Los archivos de utilidades, en camelCase.
- Los estados de carga y de error se resuelven siempre; no dejar la pantalla en blanco: `loading.tsx`, `error.tsx`, el vacío con `SinDatos` y el "sin resultados" en el componente que filtra.
- Las páginas con sesión van en `app/(app)/` y vuelven a pedir el usuario aunque el layout ya redirija: el layout no es seguridad. `notFound()` para "no existe" y para "no es tuya", con el mismo texto.

### Formularios (Server Actions)

- Una Server Action es un endpoint público: **la primera línea es `requerirUsuario([...roles])`**.
- Ningún id que salga de la sesión o de la URL viaja en el formulario: el usuario sale de la sesión y el id del recurso llega con `.bind`.
- Se valida con el mismo schema de `lib/schemas/` que usa el Route Handler, y las reglas se llaman desde el mismo `lib/casos/`.
- Errores de validación debajo del campo (`errores`), rechazo de una regla arriba del formulario (`mensaje`). El formulario no se vacía al fallar (`valores`). Tipo: `lib/formularios.ts`.
- El botón se deshabilita mientras `pendiente` y dice "Guardando…".
- Toda acción que escribe llama a `revalidatePath` con las pantallas que quedaron viejas, y `redirect` va al final.
- Todo campo usa `components/campo.tsx` (label conectado, `aria-describedby`, `aria-invalid`).
- Mobile-first: las clases sin prefijo son el teléfono; `sm:` agrega lo ancho. `<select>` nativo, `inputMode="numeric"` en vez de `type="number"`, botón principal a lo ancho en el teléfono.

### Estilos

- Solo Tailwind. Nada de CSS suelto ni estilos inline salvo valores calculados en runtime.
- Los componentes de UI base salen de shadcn/ui y se editan en `components/ui/`. Ningún borde, radio ni sombra escrito a mano en `app/`: se usa `Card`, `Button`, etc.
- Los colores y el radio son tokens en `app/globals.css`. Ningún estado se comunica solo con color: siempre hay texto.
- Un componente nuevo se agrega primero a la galería `/sistema` (`app/(app)/sistema/page.tsx`), con todos sus estados.

## Pruebas

| Capa | Qué contesta | Dónde | Con qué |
|---|---|---|---|
| Dominio | ¿La regla calcula bien? | `lib/**/*.test.ts` | vitest, sin base ni red (`npm test`) |
| Permisos | ¿El servidor dice que no aunque nadie pase por la pantalla? | `e2e/permisos.spec.ts` | Playwright contra la API |
| Flujo | ¿Se recorre el flujo principal entero, de una persona a otra? | `e2e/flujo-principal.spec.ts` | Playwright con navegador |

- **Cuándo se actualiza cada una:** si cambia una regla de la sección 6 de la spec, su prueba en `lib/*.test.ts`. Si cambia quién puede hacer qué o hay un endpoint nuevo en `docs/api.md`, un caso en `e2e/permisos.spec.ts`. Si cambia el recorrido de la sección 5, `e2e/flujo-principal.spec.ts`.
- **El valor esperado sale de la spec o del contrato, nunca de correr el código y copiar lo que dio.** Si una prueba falla, se arregla el código, no el valor esperado.
- Toda prueba nueva se ve fallar una vez (se saca lo que prueba, se ve en rojo, se vuelve a poner) y se cuenta en el PR.
- Las pruebas buscan como una persona: `getByRole`, `getByLabel`, `getByText`. Nunca por id ni por clase de CSS. Nada de `sleep`: `expect(...).toBeVisible()` espera solo.
- Las e2e corren **solo contra una base local** (`.env.e2e`); `playwright.config.ts` se niega a arrancar si no lo es.
- **Prohibido un "modo prueba"**, un usuario mágico o un `if (process.env.E2E)` en la app. Las sesiones de prueba se fabrican afuera (`e2e/sesiones.ts`) con el secreto de `.env.e2e`.
- Las funciones de reglas reciben el "ahora" por parámetro, para poder probarse sin congelar el reloj.
- El CI (`.github/workflows/ci.yml`) corre `verificar` (tipos, lint, dominio) y `e2e` en cada PR; los dos son obligatorios para mergear a `main`.

### Git

- Ramas: `feat/<descripcion-corta>`, `fix/<descripcion-corta>`.
- Commits en imperativo y en español: "agrega validación de turnos superpuestos".
- Nunca commitear `.env.local` ni credenciales.

## Cómo quiero que trabajes

- Si la consigna es ambigua, **preguntá antes de escribir código**. No inventes reglas de negocio.
- Cambios chicos y enfocados. No refactorices archivos que no tienen que ver con la tarea.
- Antes de crear un helper nuevo, buscá si ya existe uno en `lib/`.
- Cuando toques algo de seguridad o del modelo de datos, explicá el porqué del cambio: son las dos áreas que se revisan línea por línea.
- **Antes de entregar un cambio, corré vos los sensores**: `npm run typecheck`, `npm run lint` y `npm test` (y `npm run test:e2e` si tocaste pantallas, permisos o el flujo). Si alguno falla, el cambio no está terminado. Contá en la respuesta qué corriste y qué dio.
- Nunca corras comandos que borren o reseteen una base (`prisma migrate reset`, `db push --force-reset`, `TRUNCATE`) contra una URL que no sea local. Si no estás seguro de a qué base apunta una variable, preguntá.
