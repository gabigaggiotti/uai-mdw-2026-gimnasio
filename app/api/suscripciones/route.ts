import { NextResponse } from "next/server";
import { crearSuscripcionSchema } from "@/lib/schemas/suscripcion";
import { crearSuscripcion, listarSuscripcionesDeCliente } from "@/lib/db/suscripciones";
import { manejarError } from "@/lib/http";

export async function GET() {
  // TODO (clase 6): const { id: clienteId } = await requerirUsuario(["CLIENTE"]);
  const clienteId = "usuario-de-ejemplo";
  const suscripciones = await listarSuscripcionesDeCliente(clienteId);
  return NextResponse.json(suscripciones);
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const resultado = crearSuscripcionSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  try {
    const suscripcion = await crearSuscripcion(resultado.data);
    return NextResponse.json(suscripcion, { status: 201 });
  } catch (error) {
    return manejarError(error);
  }
}
