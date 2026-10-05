import { NextResponse } from "next/server";
import { crearProfesorSchema } from "@/lib/schemas/profesor";
import { crearProfesor, listarProfesores } from "@/lib/db/profesores";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

export const GET = manejarHandler("GET /api/profesores", async () => {
  await requerirUsuario(["ADMINISTRADOR"]);
  const profesores = await listarProfesores();
  return NextResponse.json(profesores);
});

export const POST = manejarHandler("POST /api/profesores", async (request: Request) => {
  await requerirUsuario(["ADMINISTRADOR"]);
  const body: unknown = await request.json();
  const resultado = crearProfesorSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const profesor = await crearProfesor(resultado.data);
  return NextResponse.json(profesor, { status: 201 });
});
