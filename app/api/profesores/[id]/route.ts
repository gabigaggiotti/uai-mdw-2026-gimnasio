import { NextResponse } from "next/server";
import { editarProfesorSchema } from "@/lib/schemas/profesor";
import { obtenerProfesor, editarProfesor, eliminarProfesor } from "@/lib/db/profesores";
import { manejarError } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  const profesor = await obtenerProfesor(id);

  if (!profesor) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(profesor);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = editarProfesorSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  try {
    const profesor = await editarProfesor(id, resultado.data);
    return NextResponse.json(profesor);
  } catch (error) {
    return manejarError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  try {
    await eliminarProfesor(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return manejarError(error, "clases");
  }
}
