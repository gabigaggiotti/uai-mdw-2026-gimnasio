import { NextResponse } from "next/server";
import { crearReservaSchema } from "@/lib/schemas/reserva";
import { crearReserva, listarReservasDeCliente } from "@/lib/db/reservas";
import { manejarError } from "@/lib/http";

export async function GET() {
  // TODO (clase 6): const { id: clienteId } = await requerirUsuario(["CLIENTE"]);
  const clienteId = "usuario-de-ejemplo";
  const reservas = await listarReservasDeCliente(clienteId);
  return NextResponse.json(reservas);
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const resultado = crearReservaSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): const { id: clienteId } = await requerirUsuario(["CLIENTE"]);
  const clienteId = "usuario-de-ejemplo";

  try {
    const reserva = await crearReserva(resultado.data, clienteId);
    return NextResponse.json(reserva, { status: 201 });
  } catch (error) {
    // CupoAgotadoError → 409 vía manejarError. findUniqueOrThrow sobre
    // una clase que no existe → P2025 → 404, también vía manejarError.
    return manejarError(error);
  }
}
