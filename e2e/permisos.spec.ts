/**
 * Los permisos, contra el servidor (clase 13). No abre ninguna pantalla:
 * le pega directo a la API, como alguien con curl.
 *
 * La tabla sale del CONTRATO (docs/api.md, columna "Roles permitidos"),
 * no del código: cada fila dada vuelta —quién NO puede y qué tiene que
 * contestar el servidor—. Si una falla, se arregla el código, no la prueba.
 *
 *   401  no sé quién sos           → sin sesión
 *   403  tu ROL no puede           → rol fuera de la columna "Roles permitidos"
 *   404  para vos, esto no existe  → el recurso de otro cliente
 */
import { expect, test, type APIRequestContext } from "@playwright/test";
import { IDS, USUARIOS, type ClaveUsuario } from "./datos";
import { cookieDe } from "./sesiones";

type Caso = {
  fila: string;
  como: ClaveUsuario | null;
  metodo: "GET" | "POST" | "PATCH" | "DELETE";
  ruta: string;
  body?: unknown;
  espera: 401 | 403 | 404;
};

const MANANA = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

const CASOS: Caso[] = [
  // Fila: catálogo para cualquier usuario autenticado.
  { fila: "catálogo", como: null, metodo: "GET", ruta: "/api/clases", espera: 401 },
  { fila: "catálogo", como: null, metodo: "GET", ruta: "/api/planes", espera: 401 },

  // Fila: crear, editar y borrar clases, planes y ejercicios → ADMINISTRADOR.
  { fila: "abm de catálogo", como: "cliente", metodo: "POST", ruta: "/api/clases", body: {}, espera: 403 },
  { fila: "abm de catálogo", como: "profesor", metodo: "PATCH", ruta: `/api/clases/${IDS.clase}`, body: {}, espera: 403 },
  { fila: "abm de catálogo", como: "profesor", metodo: "POST", ruta: "/api/planes", body: {}, espera: 403 },
  { fila: "abm de catálogo", como: "cliente", metodo: "DELETE", ruta: `/api/planes/${IDS.plan}`, espera: 403 },
  { fila: "abm de catálogo", como: "cliente", metodo: "POST", ruta: "/api/ejercicios", body: {}, espera: 403 },

  // Fila: todas las operaciones de /api/profesores → ADMINISTRADOR.
  { fila: "profesores", como: "cliente", metodo: "GET", ruta: "/api/profesores", espera: 403 },
  { fila: "profesores", como: "profesor", metodo: "POST", ruta: "/api/profesores", body: {}, espera: 403 },

  // Fila: GET y POST /api/reservas → CLIENTE.
  { fila: "reservas propias", como: "administrador", metodo: "GET", ruta: "/api/reservas", espera: 403 },
  {
    fila: "reservas propias",
    como: "profesor",
    metodo: "POST",
    ruta: "/api/reservas",
    body: { claseId: IDS.clase, fecha: MANANA },
    espera: 403,
  },

  // Fila: GET /api/reservas/:id y cancelación → CLIENTE (las propias), ADMINISTRADOR.
  { fila: "una reserva", como: "profesor", metodo: "GET", ruta: `/api/reservas/${IDS.reservaOtroCliente}`, espera: 403 },
  { fila: "una reserva", como: "cliente", metodo: "GET", ruta: `/api/reservas/${IDS.reservaOtroCliente}`, espera: 404 },
  {
    fila: "una reserva",
    como: "cliente",
    metodo: "POST",
    ruta: `/api/reservas/${IDS.reservaOtroCliente}/cancelacion`,
    espera: 404,
  },

  // Fila: GET /api/suscripciones → CLIENTE. POST → ADMINISTRADOR.
  { fila: "suscripciones", como: "profesor", metodo: "GET", ruta: "/api/suscripciones", espera: 403 },
  { fila: "suscripciones", como: "cliente", metodo: "POST", ruta: "/api/suscripciones", body: {}, espera: 403 },
  {
    fila: "una suscripción",
    como: "cliente",
    metodo: "GET",
    ruta: `/api/suscripciones/${IDS.suscripcionOtroCliente}`,
    espera: 404,
  },
  {
    fila: "una suscripción",
    como: "cliente",
    metodo: "POST",
    ruta: `/api/suscripciones/${IDS.suscripcionOtroCliente}/cancelacion`,
    espera: 404,
  },

  // Fila: cuotas → GET CLIENTE y ADMINISTRADOR; POST solo ADMINISTRADOR.
  { fila: "cuotas", como: "profesor", metodo: "GET", ruta: "/api/cuotas", espera: 403 },
  { fila: "cuotas", como: "cliente", metodo: "POST", ruta: "/api/cuotas", body: {}, espera: 403 },

  // Fila: lesiones → el cliente solo ve y registra las propias.
  { fila: "lesiones", como: "cliente", metodo: "GET", ruta: `/api/lesiones/${IDS.lesionOtroCliente}`, espera: 404 },
  {
    fila: "lesiones",
    como: "cliente",
    metodo: "POST",
    ruta: "/api/lesiones",
    body: {
      clienteId: USUARIOS.otroCliente.id,
      descripcion: "Dolor de rodilla",
      zonaAfectada: "Rodilla",
      gravedad: "LEVE",
    },
    espera: 403,
  },
  // Fila: editar lesión y marcarla recuperada → PROFESOR, ADMINISTRADOR.
  {
    fila: "editar lesión",
    como: "cliente",
    metodo: "POST",
    ruta: `/api/lesiones/${IDS.lesionOtroCliente}/recuperacion`,
    espera: 403,
  },

  // Fila: rutinas → el cliente solo ve las propias.
  { fila: "rutinas", como: "cliente", metodo: "GET", ruta: `/api/rutinas/${IDS.rutinaOtroCliente}`, espera: 404 },
  // Fila: crear, editar o borrar rutinas → PROFESOR, ADMINISTRADOR.
  { fila: "abm de rutinas", como: "cliente", metodo: "POST", ruta: "/api/rutinas", body: {}, espera: 403 },
  // Fila: activar rutina → CLIENTE (propia), ADMINISTRADOR.
  {
    fila: "activar rutina",
    como: "profesor",
    metodo: "POST",
    ruta: `/api/rutinas/${IDS.rutinaOtroCliente}/activacion`,
    espera: 403,
  },
  {
    fila: "activar rutina",
    como: "cliente",
    metodo: "POST",
    ruta: `/api/rutinas/${IDS.rutinaOtroCliente}/activacion`,
    espera: 404,
  },
];

async function pedir(request: APIRequestContext, caso: Caso) {
  const headers: Record<string, string> = caso.como ? { Cookie: await cookieDe(caso.como) } : {};
  return request.fetch(caso.ruta, { method: caso.metodo, headers, data: caso.body });
}

const TITULO: Record<Caso["espera"], string> = {
  401: "sin sesión: 401",
  403: "el rol equivocado: 403",
  404: "el recurso de otro: 404",
};

for (const caso of CASOS) {
  test(`${TITULO[caso.espera]} › ${caso.fila} › ${caso.como ?? "anónimo"} › ${caso.metodo} ${caso.ruta}`, async ({
    request,
  }) => {
    const respuesta = await pedir(request, caso);
    expect(respuesta.status()).toBe(caso.espera);
  });
}

test("el recurso de otro no se modificó: la reserva ajena sigue CONFIRMADA", async ({ request }) => {
  // Comprueba que el 404 de la cancelación ajena no escribió nada.
  const respuesta = await request.get(`/api/reservas/${IDS.reservaOtroCliente}`, {
    headers: { Cookie: await cookieDe("administrador") },
  });
  expect(respuesta.status()).toBe(200);
  expect((await respuesta.json()).estado).toBe("CONFIRMADA");
});
