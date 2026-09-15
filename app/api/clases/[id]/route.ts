import { NextResponse } from "next/server";
import { editarClaseSchema } from "@/lib/schemas/clase";
import { obtenerClase, editarClase, eliminarClase } from "@/lib/db/clases";
import { manejarError } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const clase = await obtenerClase(id);

  if (!clase) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(clase);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = editarClaseSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  try {
    const clase = await editarClase(id, resultado.data);
    return NextResponse.json(clase);
  } catch (error) {
    return manejarError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  // Si tira 409 (tiene reservas), la alternativa es desactivarla:
  // PATCH { "activa": false } en vez de borrarla.
  try {
    await eliminarClase(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return manejarError(error, "reservas");
  }
}
