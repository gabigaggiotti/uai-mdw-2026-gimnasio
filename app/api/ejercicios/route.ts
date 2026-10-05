import { NextResponse } from "next/server";
import { crearEjercicioSchema } from "@/lib/schemas/ejercicio";
import { crearEjercicio, listarEjercicios } from "@/lib/db/ejercicios";
import { requerirUsuario } from "@/lib/auth";
import { manejarHandler } from "@/lib/http";

export const GET = manejarHandler("GET /api/ejercicios", async () => {
  await requerirUsuario();
  const ejercicios = await listarEjercicios();
  return NextResponse.json(ejercicios);
});

export const POST = manejarHandler("POST /api/ejercicios", async (request: Request) => {
  await requerirUsuario(["ADMINISTRADOR"]);
  const body: unknown = await request.json();
  const resultado = crearEjercicioSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const ejercicio = await crearEjercicio(resultado.data);
  return NextResponse.json(ejercicio, { status: 201 });
});
