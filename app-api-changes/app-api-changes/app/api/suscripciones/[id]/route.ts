import { NextResponse } from "next/server";
import { obtenerSuscripcion } from "@/lib/db/suscripciones";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  // TODO (clase 6): requerirUsuario(["CLIENTE", "ADMINISTRADOR"]) +
  // si es CLIENTE, verificar que la suscripción sea la suya (si no, 404).
  const suscripcion = await obtenerSuscripcion(id);

  if (!suscripcion) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(suscripcion);
}
