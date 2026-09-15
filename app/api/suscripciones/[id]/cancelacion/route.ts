import { NextResponse } from "next/server";
import { cancelarSuscripcion, obtenerSuscripcion } from "@/lib/db/suscripciones";
import { manejarError } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;

  // TODO (clase 6): requerirUsuario(["CLIENTE", "ADMINISTRADOR"]) +
  // verificar que si es CLIENTE, la suscripción sea la suya.
  const suscripcion = await obtenerSuscripcion(id);

  if (!suscripcion) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (suscripcion.estado === "CANCELADA") {
    return NextResponse.json({ error: "La suscripción ya está cancelada" }, { status: 409 });
  }

  try {
    const suscripcionCancelada = await cancelarSuscripcion(id);
    return NextResponse.json(suscripcionCancelada);
  } catch (error) {
    return manejarError(error);
  }
}
