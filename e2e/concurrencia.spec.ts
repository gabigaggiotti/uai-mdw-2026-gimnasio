/**
 * Dos usuarios a la vez (clase 14). Una reserva se cancela UNA sola vez:
 * si llegan varias cancelaciones juntas —el cliente que toca dos veces el
 * botón, o el cliente y un administrador al mismo tiempo—, una pasa y las
 * demás reciben el 409 "La reserva ya está cancelada" de docs/api.md.
 *
 * Los pedidos salen a la vez con Promise.all: ninguno espera la respuesta
 * del anterior, así que todos pueden leer la reserva todavía CONFIRMADA.
 * Lo único que los ordena es la base de datos.
 */
import { expect, test } from "@playwright/test";
import { IDS } from "./datos";
import { cookieDe } from "./sesiones";

const SIMULTANEOS = 10;

test("cancelaciones simultáneas de la misma reserva: una pasa y las demás reciben 409", async ({ request }) => {
  const headers = { Cookie: await cookieDe("cliente") };
  const ruta = `/api/reservas/${IDS.reservaCliente}/cancelacion`;

  const respuestas = await Promise.all(
    Array.from({ length: SIMULTANEOS }, () => request.post(ruta, { headers })),
  );
  const estados = respuestas.map((respuesta) => respuesta.status());

  expect(estados.filter((estado) => estado === 200)).toHaveLength(1);
  expect(estados.filter((estado) => estado === 409)).toHaveLength(SIMULTANEOS - 1);

  const reserva = await request.get(`/api/reservas/${IDS.reservaCliente}`, { headers });
  expect((await reserva.json()).estado).toBe("CANCELADA");
});
