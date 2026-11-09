/**
 * El tipo que viaja entre una Server Action y su formulario (clase 12).
 *
 * - `errores`: errores de validación (400 en la API). Van DEBAJO de cada campo.
 * - `mensaje`: rechazo de una regla de negocio (409 en la API). Va ARRIBA
 *   del formulario, porque no se arregla corrigiendo un campo.
 * - `valores`: lo que la persona había escrito, para que el formulario no
 *   se vacíe cuando falla.
 */
export type EstadoFormulario<Campos extends string = string> = {
  mensaje?: string;
  errores?: Partial<Record<Campos, string[]>>;
  valores?: Partial<Record<Campos, string>>;
};

/** Estado inicial: todavía no se envió nada, el formulario se dibuja limpio. */
export const SIN_ENVIAR: EstadoFormulario = {};

/** Los valores de texto de un FormData, para devolverlos si algo falla. */
export function valoresDe<Campos extends string>(
  formData: FormData,
  campos: readonly Campos[],
): Partial<Record<Campos, string>> {
  const valores: Partial<Record<Campos, string>> = {};
  for (const campo of campos) {
    const valor = formData.get(campo);
    if (typeof valor === "string") valores[campo] = valor;
  }
  return valores;
}
