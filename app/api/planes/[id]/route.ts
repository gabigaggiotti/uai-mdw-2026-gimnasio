import { NextResponse } from "next/server";
import { editarPlanSchema } from "@/lib/schemas/plan";
import { obtenerPlan, editarPlan, eliminarPlan } from "@/lib/db/planes";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export const GET = manejarHandler("GET /api/planes/:id", async (_request: Request, { params }: Params) => {
  await requerirUsuario();
  const { id } = await params;
  const plan = await obtenerPlan(id);

  if (!plan) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(plan);
});

export const PATCH = manejarHandler("PATCH /api/planes/:id", async (request: Request, { params }: Params) => {
  await requerirUsuario(["ADMINISTRADOR"]);
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = editarPlanSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const plan = await editarPlan(id, resultado.data);
  return NextResponse.json(plan);
});

export const DELETE = manejarHandler("DELETE /api/planes/:id", async (_request: Request, { params }: Params) => {
  const { id } = await params;
  await requerirUsuario(["ADMINISTRADOR"]);
  await eliminarPlan(id);
  return new NextResponse(null, { status: 204 });
}, "suscripciones");
