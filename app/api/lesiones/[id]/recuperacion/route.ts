import { NextResponse } from "next/server";
import { obtenerLesion, marcarLesionRecuperada } from "@/lib/db/lesiones";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

/**
 * POST y no PATCH { estado: "RECUPERADA" }: confirmar la recuperación
 * de una lesión es un permiso propio (Profesor o Administrador, nunca
 * el propio Cliente), no una edición libre de sus datos.
 */
export const POST = manejarHandler("POST /api/lesiones/:id/recuperacion", async (_request: Request, { params }: Params) => {
  await requerirUsuario(["PROFESOR", "ADMINISTRADOR"]);
  const { id } = await params;

  const lesion = await obtenerLesion(id);

  if (!lesion) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (lesion.estado === "RECUPERADA") {
    return NextResponse.json({ error: "La lesión ya está marcada como recuperada" }, { status: 409 });
  }

  const lesionRecuperada = await marcarLesionRecuperada(id);
  if (!lesionRecuperada) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(lesionRecuperada);
});
