"use server";

/**
 * Server Action de reservar. "use server" NO quiere decir privado: Next.js
 * publica esta función como un endpoint HTTP, y cualquiera puede llamarla
 * sin pasar por el formulario. Por eso adentro se verifica todo de nuevo,
 * igual que en POST /api/reservas (clase 12).
 *
 * - El cliente sale de la SESIÓN, nunca del formulario.
 * - La clase sale de la URL (llega por .bind), no de un campo oculto.
 * - Las reglas son las mismas de la API: lib/casos/reservar-clase.ts.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirUsuario } from "@/lib/auth";
import { crearReservaSchema } from "@/lib/schemas/reserva";
import { MENSAJE_RECHAZO_RESERVA, reservarClase } from "@/lib/casos/reservar-clase";
import { valoresDe, type EstadoFormulario } from "@/lib/formularios";

const CAMPOS = ["fecha"] as const;
export type CampoReserva = (typeof CAMPOS)[number];

export async function reservarAction(
  claseId: string,
  _estadoAnterior: EstadoFormulario<CampoReserva>,
  formData: FormData,
): Promise<EstadoFormulario<CampoReserva>> {
  // 1. ¿Quién sos? Primera línea, siempre.
  const cliente = await requerirUsuario(["CLIENTE"]);
  const valores = valoresDe(formData, CAMPOS);

  // 2. ¿Los datos tienen la forma correcta? → error debajo del campo.
  const datos = crearReservaSchema.safeParse({ claseId, fecha: valores.fecha });
  if (!datos.success) {
    const { fieldErrors } = datos.error.flatten();
    if (fieldErrors.claseId) return { mensaje: "Esta clase no existe.", valores };
    return { errores: { fecha: fieldErrors.fecha }, valores };
  }

  // 3. ¿Se cumplen las reglas del negocio? → mensaje arriba del formulario.
  const resultado = await reservarClase(datos.data, cliente);
  if (!resultado.ok) {
    return { mensaje: MENSAJE_RECHAZO_RESERVA[resultado.motivo], valores };
  }

  // 4. Las pantallas que quedaron viejas: el cupo de la clase y "Mis reservas".
  revalidatePath(`/clases/${claseId}`);
  revalidatePath("/reservas");

  // redirect lanza una excepción que Next.js atrapa: va siempre al final.
  const mail = resultado.confirmacionEnviada ? "enviado" : "pendiente";
  redirect(`/reservas/${resultado.reserva.id}?mail=${mail}`);
}
