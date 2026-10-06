import { NextResponse } from "next/server";
import { crearReservaSchema } from "@/lib/schemas/reserva";
import { crearReserva, listarReservasDeCliente } from "@/lib/db/reservas";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

export const GET = manejarHandler("GET /api/reservas", async () => {
  const { id: clienteId } = await requerirUsuario(["CLIENTE"]);
  const reservas = await listarReservasDeCliente(clienteId);
  return NextResponse.json(reservas);
});

export const POST = manejarHandler("POST /api/reservas", async (request: Request) => {
  const { id: clienteId } = await requerirUsuario(["CLIENTE"]);
  const body: unknown = await request.json();
  const resultado = crearReservaSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const reserva = await crearReserva(resultado.data, clienteId);
  return NextResponse.json(reserva, { status: 201 });
});
