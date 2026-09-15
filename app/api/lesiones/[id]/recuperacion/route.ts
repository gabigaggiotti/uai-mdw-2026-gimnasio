import { NextResponse } from "next/server";
import { obtenerLesion, marcarLesionRecuperada } from "@/lib/db/lesiones";
import { manejarError } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

/**
 * POST y no PATCH { estado: "RECUPERADA" }: confirmar la recuperación
 * de una lesión es un permiso propio (Profesor o Administrador, nunca
 * el propio Cliente), no una edición libre de sus datos.
 */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;

  // TODO (clase 6): requerirUsuario(["PROFESOR", "ADMINISTRADOR"]).
  const lesion = await obtenerLesion(id);

  if (!lesion) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (lesion.estado === "RECUPERADA") {
    return NextResponse.json({ error: "La lesión ya está marcada como recuperada" }, { status: 409 });
  }

  try {
    const lesionRecuperada = await marcarLesionRecuperada(id);
    return NextResponse.json(lesionRecuperada);
  } catch (error) {
    return manejarError(error);
  }
}
