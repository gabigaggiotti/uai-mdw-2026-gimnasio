import { NextResponse } from "next/server";
import { editarRutinaSchema } from "@/lib/schemas/rutina";
import { obtenerRutinaConEjercicios, editarRutina, eliminarRutina } from "@/lib/db/rutinas";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export const GET = manejarHandler("GET /api/rutinas/:id", async (_request: Request, { params }: Params) => {
  const usuario = await requerirUsuario(["CLIENTE", "PROFESOR", "ADMINISTRADOR"]);
  const { id } = await params;
  const rutina = await obtenerRutinaConEjercicios(
    id,
    usuario.rol === "CLIENTE" ? usuario.id : undefined,
  );

  if (!rutina) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(rutina);
});

export const PATCH = manejarHandler("PATCH /api/rutinas/:id", async (request: Request, { params }: Params) => {
  await requerirUsuario(["PROFESOR", "ADMINISTRADOR"]);
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = editarRutinaSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const rutina = await editarRutina(id, resultado.data);
  return NextResponse.json(rutina);
});

export const DELETE = manejarHandler("DELETE /api/rutinas/:id", async (_request: Request, { params }: Params) => {
  await requerirUsuario(["PROFESOR", "ADMINISTRADOR"]);
  const { id } = await params;
  await eliminarRutina(id);
  return new NextResponse(null, { status: 204 });
});
