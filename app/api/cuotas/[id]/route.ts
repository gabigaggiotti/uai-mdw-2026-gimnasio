import { NextResponse } from "next/server";
import { obtenerCuota } from "@/lib/db/cuotas";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  // TODO (clase 6): requerirUsuario(["CLIENTE", "ADMINISTRADOR"]) +
  // si es CLIENTE, verificar que la cuota sea de una suscripción suya.
  const cuota = await obtenerCuota(id);

  if (!cuota) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(cuota);
}
