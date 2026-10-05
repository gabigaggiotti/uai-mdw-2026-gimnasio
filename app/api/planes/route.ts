import { NextResponse } from "next/server";
import { crearPlanSchema } from "@/lib/schemas/plan";
import { crearPlan, listarPlanes } from "@/lib/db/planes";
import { requerirUsuario } from "@/lib/auth";
import { manejarHandler } from "@/lib/http";

export const GET = manejarHandler("GET /api/planes", async () => {
  await requerirUsuario();
  const planes = await listarPlanes();
  return NextResponse.json(planes);
});

export const POST = manejarHandler("POST /api/planes", async (request: Request) => {
  await requerirUsuario(["ADMINISTRADOR"]);
  const body: unknown = await request.json();
  const resultado = crearPlanSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const plan = await crearPlan(resultado.data);
  return NextResponse.json(plan, { status: 201 });
});
