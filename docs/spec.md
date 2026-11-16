# Especificación del sistema

> Este documento **es** el relevamiento de requerimientos del proyecto (eje metodológico, clase 2).
> Se completa en la clase 2 y se mantiene actualizado todo el cuatrimestre.
> Regla práctica: si una funcionalidad no está acá, no se implementa.

## 1. El problema

**Para quién:** gimnasios chicos y sus socios.
**Qué hace hoy sin el sistema:** coordinan las reservas de clases por WhatsApp o en papel.
**Qué mejora:** se terminan las clases sobrevendidas y los socios que viajan al gimnasio y se quedan sin lugar.

## 2. Roles

| Rol | Quién es | Qué puede hacer que el otro no |
|---|---|---|
| CLIENTE | Persona que entrena en el gimnasio | Consultar y administrar sus propias reservas, suscripciones, cuotas, lesiones y rutinas; reservar clases y activar sus rutinas |
| PROFESOR | Profesor que dicta clases y prepara rutinas | Gestionar rutinas y lesiones; consultar las rutinas y lesiones de los clientes |
| ADMINISTRADOR | Persona que administra el gimnasio | Gestionar clases, profesores, ejercicios, planes, suscripciones y cuotas; acceso global de administración |

## 3. Entidades

Los sustantivos que aparecen en las historias de usuario. De acá sale el modelo de datos.

| Entidad | Qué representa | Se relaciona con |
|---|---|---|
| Usuario | Persona con cuenta (Google); su `rol` define qué puede hacer | Tiene reservas, suscripciones, lesiones y rutinas; opcionalmente un perfil de Profesor |
| Profesor | Perfil del usuario con rol PROFESOR (especialidad, teléfono) | 1-1 con Usuario; dicta muchas Clases |
| Plan | Tipo de membresía (precio, duración en días, clases por semana) | Tiene muchas Suscripciones |
| Clase | Actividad de la grilla semanal (día, horario, cupo máximo, salón) | Pertenece a un Profesor; tiene muchas Reservas |
| Reserva | Lugar que un cliente toma en una clase para una fecha (CONFIRMADA, CANCELADA o ASISTIO) | Pertenece a un Usuario (cliente) y a una Clase |
| Suscripción | Plan contratado por un cliente, con fecha de inicio y de fin (ACTIVA, VENCIDA o CANCELADA) | Pertenece a un Usuario y a un Plan; tiene muchas Cuotas |
| Cuota | Pago registrado de una suscripción (fecha, modo de pago, monto, período) | Pertenece a una Suscripción |
| Lesión | Lesión registrada de un cliente (zona, gravedad, estado) | Pertenece a un Usuario (cliente) |
| Rutina | Plan de entrenamiento de un cliente (ACTIVA o INACTIVA) | Pertenece a un Usuario; tiene muchos ejercicios a través de RutinaEjercicio |
| Ejercicio | Ejercicio del catálogo (nombre, grupo muscular) | Se usa en muchas Rutinas a través de RutinaEjercicio |
| RutinaEjercicio | Relación N-N entre Rutina y Ejercicio, con series, repeticiones y orden | Pertenece a una Rutina y a un Ejercicio |

Relaciones 1-N: Profesor→Clases, Clase→Reservas, Plan→Suscripciones, Suscripción→Cuotas. Relación N-N con atributos propios: Rutina↔Ejercicio (`RutinaEjercicio`). El modelo está en `prisma/schema.prisma`.

## 4. Historias de usuario

Formato: **Como** <rol>, **quiero** <acción>, **para** <beneficio>.
Cada historia lleva su criterio de aceptación: cómo se verifica que está terminada.

### H1 — Publicar una clase en la grilla
**Como** administrador, **quiero** dar de alta una clase con día, horario, profesor y cupo, **para** que los clientes puedan reservarla.

Criterios de aceptación:
- [ ] Dado un administrador con sesión, cuando completa el formulario de `/admin/clases/nueva` con datos válidos, entonces la clase queda creada y se muestra su detalle.
- [ ] Caso de error: cuando el nombre tiene menos de 3 caracteres, el sistema muestra el mensaje debajo del campo y no vacía lo ya cargado.

Verificada por: `e2e/flujo-principal.spec.ts`, paso 1.

### H2 — Reservar un lugar en una clase
**Como** cliente, **quiero** reservar un lugar en una clase con cupo, **para** asegurarme de que tengo sitio al llegar.

Criterios de aceptación:
- [ ] Dado un cliente con suscripción vigente y una clase con cupo, cuando confirma la reserva, entonces la reserva queda `CONFIRMADA` y ve la confirmación en pantalla.
- [ ] Caso de error: cuando no tiene suscripción vigente, el sistema rechaza con "Necesitás una suscripción o cuota activa para reservar".
- [ ] Caso de error: cuando ya tiene otra reserva en el mismo día y horario, o la clase no tiene cupo, el sistema rechaza y explica el motivo (reglas 2 y 3 de la sección 6).
- [ ] Caso de error: cuando el mail de confirmación no se puede enviar, la reserva igual queda confirmada y se avisa que el mail no salió (sección 8).

Verificada por: `lib/reservas.test.ts` (reglas) y `e2e/flujo-principal.spec.ts`, pasos 3, 4 y 5.

### H3 — Cancelar una reserva
**Como** cliente, **quiero** cancelar una reserva desde "Mis reservas", **para** liberar el lugar si no puedo ir.

Criterios de aceptación:
- [ ] Dado una reserva confirmada que empieza en más de 2 horas, cuando el cliente la cancela, entonces pasa a `CANCELADA` y deja de ofrecerse el botón de cancelar.
- [ ] Caso de error: cuando faltan menos de 2 horas, el sistema rechaza con "Ya no se puede cancelar: faltan menos de 2 horas para la clase".
- [ ] Caso de error: cuando la reserva ya estaba cancelada, el sistema rechaza con "La reserva ya está cancelada".

Verificada por: `lib/reservas.test.ts` (regla de las 2 horas) y `e2e/flujo-principal.spec.ts`, paso 6.

### H4 — Ver solo mis propios datos
**Como** cliente, **quiero** que mis reservas, suscripciones y cuotas no sean visibles para otros clientes, **para** proteger mi información.

Criterios de aceptación:
- [ ] Dado un cliente con sesión, cuando abre una reserva que pertenece a otro cliente, entonces ve la misma pantalla de "no encontrado" que para una reserva inexistente (`404` en la API).
- [ ] Caso de error: cuando no hay sesión, una pantalla privada redirige a `/ingresar` y la API responde `401`; con sesión pero sin el rol permitido, la API responde `403`.

Verificada por: `e2e/flujo-principal.spec.ts` y `e2e/permisos.spec.ts`.

## 5. Flujo principal

El recorrido completo, paso a paso, del flujo que da valor al sistema (no un ABM).

1. El administrador da de alta una clase en la grilla semanal (día, horario, profesor y cupo).
2. El cliente consulta la grilla y elige una clase.
3. El cliente elige una de las próximas fechas de esa clase y confirma la reserva.
4. El sistema valida suscripción vigente, superposición y cupo; si algo falla, explica el motivo.
5. El cliente ve la confirmación de la reserva (y, si el correo responde, la recibe por mail).
6. El cliente consulta "Mis reservas" y, si falta más de 2 horas, cancela la reserva.

### Mapa de pantallas (clase 10)

Las direcciones se deciden acá y no las inventa un asistente: si cambian, se rompen los enlaces ya mandados.

| Paso | Pantalla | Dirección | Quién la puede abrir |
|---|---|---|---|
| — | Ingresar con Google | `/ingresar` | Cualquiera, sin sesión |
| 1 | Nueva clase (formulario) | `/admin/clases/nueva` | `ADMINISTRADOR` |
| 2 | Grilla semanal (home) | `/` | Cualquier usuario con sesión |
| 2 y 3 | Detalle de la clase, con el formulario de reserva | `/clases/:id` | Cualquier usuario con sesión; solo `CLIENTE` ve el formulario |
| 4 | No es una pantalla: el rechazo aparece arriba del formulario de `/clases/:id` | — | — |
| 5 | Detalle de la reserva (confirmación) | `/reservas/:id` | `CLIENTE` dueño de la reserva, `ADMINISTRADOR` |
| 6 | Mis reservas | `/reservas` | `CLIENTE` |
| 6 | Cancelar: botón dentro de `/reservas/:id` | — | `CLIENTE` dueño, `ADMINISTRADOR` |
| — | Galería de componentes | `/sistema` | Cualquier usuario con sesión |

Una reserva ajena y una inexistente muestran la misma pantalla de "no encontrado" (mismo criterio que el `404` de la API).

## 6. Reglas de negocio

Las restricciones que **no** son obvias y que la IA no puede adivinar. Estas son las que hay que revisar a mano.

Reglas de la reserva y de la suscripción. Cada una vive como función pura en `lib/reservas.ts` o `lib/suscripciones.ts`, con su prueba en `lib/*.test.ts`, y se llama desde `lib/db/reservas.ts`. Todas responden `409` (el pedido es válido; lo que falla es el estado del sistema), según `docs/api.md`.

1. **Suscripción activa obligatoria.** Un cliente no puede reservar sin al menos una suscripción vigente: estado `ACTIVA` y `fechaFin` no vencida.
2. **Sin superposición de turnos.** Un cliente no puede tener dos reservas confirmadas que coincidan en el mismo día y rango horario, aunque sean clases distintas.
3. **Límite de capacidad.** Se puede reservar solo si las reservas confirmadas de esa clase y esa fecha son menos que su `cupoMaximo`. Cancelar una reserva libera el lugar.
4. **Cancelación anticipada.** Una reserva solo puede cancelarse hasta 2 horas antes del inicio de la clase.

Otras reglas que ya implementa el sistema:

5. **La fecha de fin de una suscripción la calcula el servidor.** Se obtiene de la fecha de inicio más `plan.duracionDias`; el cliente nunca la envía (`lib/db/suscripciones.ts`).
6. **Pagar una cuota extiende la suscripción.** Registrar una cuota suma `plan.duracionDias` a la `fechaFin` y deja la suscripción `ACTIVA`, en una sola transacción (`lib/db/cuotas.ts`).
7. **Una sola rutina activa por cliente.** Al activar una rutina, las demás rutinas activas de ese cliente pasan a `INACTIVA` en la misma transacción (`lib/db/rutinas.ts`).
8. **Solo el dueño o un administrador gestiona una reserva.** Un cliente solo puede consultar y cancelar sus propias reservas; un administrador, cualquiera.

### Autenticación y autorización (clase 6)

- La identidad y el rol se obtienen de la sesión del servidor; nunca se aceptan desde body, headers o query string.
- El registro OAuth crea usuarios nuevos como `CLIENTE`. Los roles `PROFESOR` y `ADMINISTRADOR` los asigna un administrador desde la base de datos; no existe autoasignación por API.
- Si no hay sesión, la API responde `401`. Si hay sesión pero el rol no está permitido, responde `403`.
- Los clientes solo pueden consultar o modificar sus propios recursos. Las consultas filtran por el ID de la sesión dentro de `lib/db/`; para un recurso ajeno se devuelve `404`, igual que para uno inexistente.
- Los profesores pueden consultar lesiones y rutinas de cualquier cliente, además de gestionar lesiones y rutinas según los permisos definidos en `docs/api.md`.
- Las operaciones de catálogo y administración requieren el rol indicado en la matriz de `docs/api.md`; los endpoints de negocio no son públicos.
- Un cliente que intente crear una lesión para otro cliente recibe `403`. Las creaciones permitidas para un cliente usan su identidad de sesión.

## 7. Requisitos no funcionales

No son funcionalidades: son condiciones que todo el sistema tiene que cumplir. Se escriben ahora
porque al final del cuatrimestre ya no se pueden arreglar. En la **clase 10** se auditan contra lo
que hayan construido.

### Usabilidad

Los cinco criterios del material de la clase 2, convertidos en algo **medible**. Reemplacen los
ejemplos por los de su dominio: lo que importa es que se pueda verificar, no que suene bien.

- **Eficiencia:** reservar una clase se hace en 3 interacciones o menos desde la home (elegir la clase, elegir la fecha, confirmar).
- **Errores:** si falta un campo obligatorio, se señala el campo y no se pierde lo ya cargado.
- **Aprendizaje:** alguien que nunca vio el sistema puede reservar una clase sin que le expliquen.
- **Recuerdo:** el flujo principal está a un clic desde la home y siempre en el mismo lugar.
- **Satisfacción:** se prueba con una persona de afuera del equipo antes del Demo Day.

### Accesibilidad

Esta lista es **igual para todos los proyectos**: no hay que adaptarla, hay que cumplirla.

- [ ] Todo se puede operar **con el teclado**, y se ve dónde está el foco.
- [ ] Los campos de formulario tienen `label` asociado, no solo *placeholder*.
- [ ] Las imágenes que informan tienen texto alternativo; las decorativas, alternativo vacío.
- [ ] El **contraste** entre texto y fondo llega a **4,5:1** (3:1 si la letra es grande).
- [ ] El error nunca se comunica **solo con color**: siempre hay texto.

## 8. Integración externa

**Cuál:** correo transaccional con [Resend](https://resend.com), llamado solo desde `lib/servicios/correo.ts`.
**Para qué:** mandarle al cliente la confirmación de su reserva (clase, fecha y horario) por mail.
**Qué pasa si se cae:** la reserva **igual se confirma**. Lo que vale es el registro en la base, no el mail: el cliente la ve en pantalla y en "Mis reservas".

| Operación | Servicio externo | Si no responde… | ¿Esencial o accesorio? | Qué ve el usuario |
|---|---|---|---|---|
| Reservar una clase | Resend (mail de confirmación) | La reserva queda `CONFIRMADA`; no sale el mail. La API responde `201` con `confirmacionEnviada: false` | Accesorio | "Tu reserva está confirmada. No pudimos mandarte el mail de confirmación; la reserva está guardada en Mis reservas." |
| Iniciar sesión (clase 6) | Google | No entra nadie | Esencial | La pantalla de error de Google; no hay forma de operar sin sesión |

Reglas del módulo (clase 7): timeout de 5 segundos, devuelve `true`/`false` y nunca lanza, la credencial (`RESEND_API_KEY`) se lee solo ahí y sin prefijo `NEXT_PUBLIC_`, y toda falla se loguea con `console.error`. La llamada va **después** de crear la reserva, nunca antes. Las pruebas de la falla (credencial rota, servicio que tarda, sin configuración) están documentadas en `docs/api.http`.

## 9. Fuera de alcance

Lo que decidimos **no** hacer, para no volver a discutirlo en la clase 12.

- Login propio y almacenamiento de contraseñas; la identidad se delega a Google OAuth.
- Recuperación de contraseña, verificación de email y segundo factor.
- Sesiones persistidas en la base, revocación inmediata y refresh tokens.
- Permisos granulares configurables por recurso; se usan los roles `CLIENTE`, `PROFESOR` y `ADMINISTRADOR`.
- Pantalla de administración de usuarios y roles; la asignación de roles privilegiados se realiza fuera de la API pública.
- Endpoints de datos accesibles sin sesión.
