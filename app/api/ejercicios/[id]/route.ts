import { NextResponse } from "next/server";
import { editarEjercicioSchema } from "@/lib/schemas/ejercicio";
import { obtenerEjercicio, editarEjercicio, eliminarEjercicio } from "@/lib/db/ejercicios";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export const GET = manejarHandler("GET /api/ejercicios/:id", async (_request: Request, { params }: Params) => {
  await requerirUsuario();
  const { id } = await params;
  const ejercicio = await obtenerEjercicio(id);

  if (!ejercicio) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(ejercicio);
});

export const PATCH = manejarHandler("PATCH /api/ejercicios/:id", async (request: Request, { params }: Params) => {
  await requerirUsuario(["ADMINISTRADOR"]);
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = editarEjercicioSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const ejercicio = await editarEjercicio(id, resultado.data);
  return NextResponse.json(ejercicio);
});

export const DELETE = manejarHandler("DELETE /api/ejercicios/:id", async (_request: Request, { params }: Params) => {
  const { id } = await params;
  await requerirUsuario(["ADMINISTRADOR"]);
  await eliminarEjercicio(id);
  return new NextResponse(null, { status: 204 });
}, "rutinas");
