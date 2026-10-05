import { NextResponse } from "next/server";
import { editarLesionSchema } from "@/lib/schemas/lesion";
import { obtenerLesion, editarLesion } from "@/lib/db/lesiones";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export const GET = manejarHandler("GET /api/lesiones/:id", async (_request: Request, { params }: Params) => {
  const usuario = await requerirUsuario(["CLIENTE", "PROFESOR", "ADMINISTRADOR"]);
  const { id } = await params;
  const lesion = await obtenerLesion(
    id,
    usuario.rol === "CLIENTE" ? usuario.id : undefined,
  );

  if (!lesion) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(lesion);
});

export const PATCH = manejarHandler("PATCH /api/lesiones/:id", async (request: Request, { params }: Params) => {
  await requerirUsuario(["PROFESOR", "ADMINISTRADOR"]);
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = editarLesionSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const lesion = await editarLesion(id, resultado.data);
  if (!lesion) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(lesion);
});
