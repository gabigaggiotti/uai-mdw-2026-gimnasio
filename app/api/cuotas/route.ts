import { NextResponse } from "next/server";
import { crearCuotaSchema } from "@/lib/schemas/cuota";
import { registrarCuota, listarCuotasDeSuscripcion } from "@/lib/db/cuotas";
import { manejarError } from "@/lib/http";

export async function GET(request: Request) {
  // TODO (clase 6): requerirUsuario(["CLIENTE", "ADMINISTRADOR"]) +
  // si es CLIENTE, verificar que la suscripción sea la suya.
  const { searchParams } = new URL(request.url);
  const suscripcionId = searchParams.get("suscripcionId");

  if (!suscripcionId) {
    return NextResponse.json({ error: "Falta el parámetro 'suscripcionId'" }, { status: 400 });
  }

  const cuotas = await listarCuotasDeSuscripcion(suscripcionId);
  return NextResponse.json(cuotas);
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const resultado = crearCuotaSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: resultado.error.flatten() },
      { status: 400 },
    );
  }

  // TODO (clase 6): requerirUsuario(["ADMINISTRADOR"]).
  try {
    const cuota = await registrarCuota(resultado.data);
    return NextResponse.json(cuota, { status: 201 });
  } catch (error) {
    return manejarError(error);
  }
}
