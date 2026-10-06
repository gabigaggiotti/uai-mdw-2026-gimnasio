import { NextResponse } from "next/server";
import { editarClaseSchema } from "@/lib/schemas/clase";
import { obtenerClase, editarClase, eliminarClase } from "@/lib/db/clases";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export const GET = manejarHandler("GET /api/clases/:id", async (_request: Request, { params }: Params) => {
  await requerirUsuario();
  const { id } = await params;
  const clase = await obtenerClase(id);

  if (!clase) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(clase);
});

export const PATCH = manejarHandler("PATCH /api/clases/:id", async (request: Request, { params }: Params) => {
  await requerirUsuario(["ADMINISTRADOR"]);
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = editarClaseSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const clase = await editarClase(id, resultado.data);
  return NextResponse.json(clase);
});

export const DELETE = manejarHandler("DELETE /api/clases/:id", async (_request: Request, { params }: Params) => {
  const { id } = await params;
  await requerirUsuario(["ADMINISTRADOR"]);
  // Si tira 409 (tiene reservas), la alternativa es desactivarla:
  // PATCH { "activa": false } en vez de borrarla.
  await eliminarClase(id);
  return new NextResponse(null, { status: 204 });
}, "reservas");
