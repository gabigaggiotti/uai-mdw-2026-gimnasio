import { NextResponse } from "next/server";
import { crearPlanSchema } from "@/lib/schemas/plan";
import { crearPlan, listarPlanes } from "@/lib/db/planes";

export async function GET() {
  // Sin restricción de rol: cualquier autenticado puede ver los planes.
  // TODO (clase 6): requerirUsuario().
  const planes = await listarPlanes();
  return NextResponse.json(planes);
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const resultado = crearPlanSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  const plan = await crearPlan(resultado.data);
  return NextResponse.json(plan, { status: 201 });
}
