import { NextResponse } from "next/server";
import { crearRutinaSchema } from "@/lib/schemas/rutina";
import { crearRutina, listarRutinasDeCliente } from "@/lib/db/rutinas";
import { requerirUsuario } from "@/lib/auth";
import { manejarHandler } from "@/lib/http";

export const GET = manejarHandler("GET /api/rutinas", async (request: Request) => {
  const usuario = await requerirUsuario(["CLIENTE", "PROFESOR", "ADMINISTRADOR"]);
  const { searchParams } = new URL(request.url);
  const clienteId = usuario.rol === "CLIENTE"
    ? usuario.id
    : searchParams.get("clienteId") ?? undefined;

  const rutinas = await listarRutinasDeCliente(clienteId);
  return NextResponse.json(rutinas);
});

export const POST = manejarHandler("POST /api/rutinas", async (request: Request) => {
  await requerirUsuario(["PROFESOR", "ADMINISTRADOR"]);
  const body: unknown = await request.json();
  const resultado = crearRutinaSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const rutina = await crearRutina(resultado.data);
  return NextResponse.json(rutina, { status: 201 });
});
