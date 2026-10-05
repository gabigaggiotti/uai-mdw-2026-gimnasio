import { NextResponse } from "next/server";
import { editarEjercicioDeRutinaSchema } from "@/lib/schemas/rutinaEjercicio";
import { editarEjercicioDeRutina, quitarEjercicioDeRutina } from "@/lib/db/rutinas";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

// itemId es el id de RutinaEjercicio (la fila de composición), no el
// id de Ejercicio: dos filas distintas pueden apuntar al mismo
// ejercicio si aparece más de una vez en la rutina.
type Params = { params: Promise<{ id: string; itemId: string }> };

export const PATCH = manejarHandler("PATCH /api/rutinas/:id/ejercicios/:itemId", async (request: Request, { params }: Params) => {
  await requerirUsuario(["PROFESOR", "ADMINISTRADOR"]);
  const { id, itemId } = await params;
  const body: unknown = await request.json();
  const resultado = editarEjercicioDeRutinaSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const itemDeRutina = await editarEjercicioDeRutina(id, itemId, resultado.data);
  if (!itemDeRutina) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(itemDeRutina);
});

export const DELETE = manejarHandler("DELETE /api/rutinas/:id/ejercicios/:itemId", async (_request: Request, { params }: Params) => {
  await requerirUsuario(["PROFESOR", "ADMINISTRADOR"]);
  const { id, itemId } = await params;
  const eliminado = await quitarEjercicioDeRutina(id, itemId);
  if (!eliminado) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
});
