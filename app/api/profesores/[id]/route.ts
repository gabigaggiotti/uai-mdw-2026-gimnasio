import { NextResponse } from "next/server";
import { editarProfesorSchema } from "@/lib/schemas/profesor";
import { obtenerProfesor, editarProfesor, eliminarProfesor } from "@/lib/db/profesores";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export const GET = manejarHandler("GET /api/profesores/:id", async (_request: Request, { params }: Params) => {
  await requerirUsuario(["ADMINISTRADOR"]);
  const { id } = await params;
  const profesor = await obtenerProfesor(id);

  if (!profesor) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(profesor);
});

export const PATCH = manejarHandler("PATCH /api/profesores/:id", async (request: Request, { params }: Params) => {
  await requerirUsuario(["ADMINISTRADOR"]);
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = editarProfesorSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const profesor = await editarProfesor(id, resultado.data);
  return NextResponse.json(profesor);
});

export const DELETE = manejarHandler("DELETE /api/profesores/:id", async (_request: Request, { params }: Params) => {
  await requerirUsuario(["ADMINISTRADOR"]);
  const { id } = await params;
  await eliminarProfesor(id);
  return new NextResponse(null, { status: 204 });
});
