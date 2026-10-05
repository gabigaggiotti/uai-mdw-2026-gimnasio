import { NextResponse } from "next/server";
import { agregarEjercicioARutinaSchema } from "@/lib/schemas/rutinaEjercicio";
import { obtenerRutinaConEjercicios, agregarEjercicioARutina } from "@/lib/db/rutinas";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export const GET = manejarHandler("GET /api/rutinas/:id/ejercicios", async (_request: Request, { params }: Params) => {
  const usuario = await requerirUsuario(["CLIENTE", "PROFESOR", "ADMINISTRADOR"]);
  const { id } = await params;
  const rutina = await obtenerRutinaConEjercicios(
    id,
    usuario.rol === "CLIENTE" ? usuario.id : undefined,
  );

  if (!rutina) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(rutina.ejercicios);
});

export const POST = manejarHandler("POST /api/rutinas/:id/ejercicios", async (request: Request, { params }: Params) => {
  await requerirUsuario(["PROFESOR", "ADMINISTRADOR"]);
  const { id } = await params;
  const body: unknown = await request.json();
  const resultado = agregarEjercicioARutinaSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const itemDeRutina = await agregarEjercicioARutina(id, resultado.data);
  return NextResponse.json(itemDeRutina, { status: 201 });
});
