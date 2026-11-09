"use server";

/**
 * Server Action de alta de clase. Mismo schema que POST /api/clases
 * (lib/schemas/clase.ts): la validación no se duplica.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirUsuario } from "@/lib/auth";
import { crearClase } from "@/lib/db/clases";
import { crearClaseSchema } from "@/lib/schemas/clase";
import { valoresDe, type EstadoFormulario } from "@/lib/formularios";

const CAMPOS = ["nombre", "disciplina", "profesorId", "diaSemana", "horaInicio", "horaFin", "cupoMaximo", "salon"] as const;
export type CampoClase = (typeof CAMPOS)[number];

export async function crearClaseAction(
  _estadoAnterior: EstadoFormulario<CampoClase>,
  formData: FormData,
): Promise<EstadoFormulario<CampoClase>> {
  await requerirUsuario(["ADMINISTRADOR"]);
  const valores = valoresDe(formData, CAMPOS);

  const datos = crearClaseSchema.safeParse({
    ...valores,
    // El formulario manda texto; el schema espera un número entero.
    cupoMaximo: valores.cupoMaximo ? Number(valores.cupoMaximo) : undefined,
    salon: valores.salon?.trim() ? valores.salon : undefined,
  });

  if (!datos.success) {
    return { errores: datos.error.flatten().fieldErrors, valores };
  }

  const clase = await crearClase(datos.data);

  // La grilla de la home quedó vieja: ahora tiene una clase más.
  revalidatePath("/");
  redirect(`/clases/${clase.id}`);
}
