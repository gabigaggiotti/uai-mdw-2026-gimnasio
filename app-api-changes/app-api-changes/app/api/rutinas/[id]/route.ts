import { NextResponse } from "next/server";
import { editarRutinaSchema } from "@/lib/schemas/rutina";
import { obtenerRutinaConEjercicios, editarRutina, eliminarRutina } from "@/lib/db/rutinas";
import { manejarError } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  // TODO (clase 6): requerirUsuario(["CLIENTE", "PROFESOR", "ADMINISTRADOR"]) +
  // si es CLIENTE, verificar que la rutina sea la suya.
  const rutina = await obtenerRutinaConEjercicios(id);

  if (!rutina) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(rutina);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = editarRutinaSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["PROFESOR", "ADMINISTRADOR"]).
  try {
    const rutina = await editarRutina(id, resultado.data);
    return NextResponse.json(rutina);
  } catch (error) {
    return manejarError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  // TODO (clase 6): requerirUsuario(["PROFESOR", "ADMINISTRADOR"]).
  try {
    await eliminarRutina(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return manejarError(error);
  }
}
