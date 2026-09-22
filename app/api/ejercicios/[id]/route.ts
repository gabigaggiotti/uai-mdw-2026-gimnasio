import { NextResponse } from "next/server";
import { editarEjercicioSchema } from "@/lib/schemas/ejercicio";
import { obtenerEjercicio, editarEjercicio, eliminarEjercicio } from "@/lib/db/ejercicios";
import { manejarError } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const ejercicio = await obtenerEjercicio(id);

  if (!ejercicio) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(ejercicio);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = editarEjercicioSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  try {
    const ejercicio = await editarEjercicio(id, resultado.data);
    return NextResponse.json(ejercicio);
  } catch (error) {
    return manejarError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  try {
    await eliminarEjercicio(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return manejarError(error, "rutinas");
  }
}
