import { NextResponse } from "next/server";
import { editarLesionSchema } from "@/lib/schemas/lesion";
import { obtenerLesion, editarLesion } from "@/lib/db/lesiones";
import { manejarError } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  // TODO (clase 6): requerirUsuario(["CLIENTE", "PROFESOR", "ADMINISTRADOR"]).
  const lesion = await obtenerLesion(id);

  if (!lesion) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(lesion);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = editarLesionSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["PROFESOR", "ADMINISTRADOR"]).
  try {
    const lesion = await editarLesion(id, resultado.data);
    return NextResponse.json(lesion);
  } catch (error) {
    return manejarError(error);
  }
}
