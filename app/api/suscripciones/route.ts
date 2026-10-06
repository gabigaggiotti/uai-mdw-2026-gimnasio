import { NextResponse } from "next/server";
import { crearSuscripcionSchema } from "@/lib/schemas/suscripcion";
import { crearSuscripcion, listarSuscripcionesDeCliente } from "@/lib/db/suscripciones";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

export const GET = manejarHandler("GET /api/suscripciones", async () => {
  const { id: clienteId } = await requerirUsuario(["CLIENTE"]);
  const suscripciones = await listarSuscripcionesDeCliente(clienteId);
  return NextResponse.json(suscripciones);
});

export const POST = manejarHandler("POST /api/suscripciones", async (request: Request) => {
  await requerirUsuario(["ADMINISTRADOR"]);
  const body: unknown = await request.json();
  const resultado = crearSuscripcionSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  const suscripcion = await crearSuscripcion(resultado.data);
  return NextResponse.json(suscripcion, { status: 201 });
});
