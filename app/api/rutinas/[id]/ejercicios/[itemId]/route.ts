import { NextResponse } from "next/server";
import { editarEjercicioDeRutinaSchema } from "@/lib/schemas/rutinaEjercicio";
import { editarEjercicioDeRutina, quitarEjercicioDeRutina } from "@/lib/db/rutinas";
import { manejarError } from "@/lib/http";

// itemId es el id de RutinaEjercicio (la fila de composición), no el
// id de Ejercicio: dos filas distintas pueden apuntar al mismo
// ejercicio si aparece más de una vez en la rutina.
type Params = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { itemId } = await params;
  const body: unknown = await request.json();
  const resultado = editarEjercicioDeRutinaSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["PROFESOR", "ADMINISTRADOR"]).
  try {
    const itemDeRutina = await editarEjercicioDeRutina(itemId, resultado.data);
    return NextResponse.json(itemDeRutina);
  } catch (error) {
    return manejarError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { itemId } = await params;
  // TODO (clase 6): requerirUsuario(["PROFESOR", "ADMINISTRADOR"]).
  try {
    await quitarEjercicioDeRutina(itemId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return manejarError(error);
  }
}
