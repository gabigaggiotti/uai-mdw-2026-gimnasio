import { NextResponse } from "next/server";
import { crearReservaSchema } from "@/lib/schemas/reserva";
import { listarReservasDeCliente } from "@/lib/db/reservas";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";
import {
  MENSAJE_RECHAZO_RESERVA,
  reservarClase,
  type MotivoRechazoReserva,
} from "@/lib/casos/reservar-clase";

// Cómo traduce esta puerta cada motivo del caso de uso. Si aparece un
// motivo nuevo, esto deja de compilar hasta decidir su status.
const STATUS_RECHAZO: Record<MotivoRechazoReserva, number> = {
  CLASE_INEXISTENTE: 404,
  SIN_SUSCRIPCION: 409,
  SUPERPOSICION: 409,
  SIN_CUPO: 409,
};

export const GET = manejarHandler("GET /api/reservas", async () => {
  const { id: clienteId } = await requerirUsuario(["CLIENTE"]);
  const reservas = await listarReservasDeCliente(clienteId);
  return NextResponse.json(reservas);
});

export const POST = manejarHandler("POST /api/reservas", async (request: Request) => {
  const cliente = await requerirUsuario(["CLIENTE"]);
  const body: unknown = await request.json();
  const resultado = crearReservaSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const reserva = await reservarClase(resultado.data, cliente);

  if (!reserva.ok) {
    return NextResponse.json(
      { error: MENSAJE_RECHAZO_RESERVA[reserva.motivo] },
      { status: STATUS_RECHAZO[reserva.motivo] },
    );
  }

  // 201 con mail o sin mail: el mail de confirmación es accesorio
  // (docs/spec.md, sección 8). `confirmacionEnviada` le dice al cliente
  // si le llegó o si tiene que mirar la reserva en "Mis reservas".
  return NextResponse.json(
    { ...reserva.reserva, confirmacionEnviada: reserva.confirmacionEnviada },
    { status: 201 },
  );
});
