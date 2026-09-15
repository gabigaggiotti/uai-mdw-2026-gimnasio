import { NextResponse } from "next/server";
import { editarPlanSchema } from "@/lib/schemas/plan";
import { obtenerPlan, editarPlan, eliminarPlan } from "@/lib/db/planes";
import { manejarError } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const plan = await obtenerPlan(id);

  if (!plan) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(plan);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = editarPlanSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  try {
    const plan = await editarPlan(id, resultado.data);
    return NextResponse.json(plan);
  } catch (error) {
    return manejarError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  try {
    await eliminarPlan(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return manejarError(error, "suscripciones");
  }
}
