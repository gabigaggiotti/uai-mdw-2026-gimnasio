/**
 * Único módulo del proyecto que sabe hablar con el proveedor de correo
 * (Resend). Ver docs/spec.md, sección 8.
 *
 * Las cuatro reglas de la clase 7:
 *  1. Timeout siempre: ninguna llamada a un tercero sin AbortSignal.timeout.
 *  2. Devuelve, no lanza: que el servicio falle es un caso previsto. La
 *     función devuelve true/false y quien llama decide qué hacer.
 *  3. La credencial vive acá y solo acá: se lee de process.env adentro de
 *     este archivo, nunca con prefijo NEXT_PUBLIC_ y nunca por parámetro.
 *  4. Loguea la falla: si nadie se entera de que el correo se cayó, nadie
 *     lo va a arreglar.
 *
 * El mail de confirmación es ACCESORIO: la reserva ya está confirmada
 * cuando se llama a esta función, con mail o sin mail.
 */

const TIMEOUT_MS = 5_000;
const URL_POR_DEFECTO = "https://api.resend.com/emails";

type Configuracion = { url: string; clave: string; remitente: string };

// Se lee al llamar y no a nivel de módulo: sin credenciales el servicio
// simplemente "no está disponible", y eso no debe impedir importar el
// archivo (ni caer el handler que lo usa).
function obtenerConfiguracion(): Configuracion | null {
  const clave = process.env.RESEND_API_KEY;
  const remitente = process.env.CORREO_REMITENTE;
  if (!clave || !remitente) return null;

  return { url: process.env.CORREO_API_URL ?? URL_POR_DEFECTO, clave, remitente };
}

export type ConfirmacionDeReserva = {
  para: string;
  nombre: string;
  clase: string;
  /** Ya formateada en el servidor, por ejemplo "lunes 16 de noviembre". */
  fecha: string;
  horaInicio: string;
  horaFin: string;
};

/**
 * Manda el mail de confirmación de una reserva. Devuelve true si el
 * proveedor lo aceptó y false si no hay configuración, si respondió con
 * error o si no respondió dentro del timeout. Nunca lanza.
 */
export async function enviarConfirmacionDeReserva(datos: ConfirmacionDeReserva): Promise<boolean> {
  const configuracion = obtenerConfiguracion();
  if (!configuracion) {
    console.error("correo: falta RESEND_API_KEY o CORREO_REMITENTE, no se envía la confirmación");
    return false;
  }

  try {
    const respuesta = await fetch(configuracion.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${configuracion.clave}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: configuracion.remitente,
        to: [datos.para],
        subject: `Reserva confirmada: ${datos.clase}`,
        text: [
          `Hola ${datos.nombre},`,
          "",
          `Tu lugar en ${datos.clase} está confirmado para el ${datos.fecha}, de ${datos.horaInicio} a ${datos.horaFin}.`,
          "Si no podés ir, cancelala desde \"Mis reservas\" hasta 2 horas antes del inicio.",
        ].join("\n"),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!respuesta.ok) {
      console.error("correo: el proveedor rechazó el envío", respuesta.status, await respuesta.text());
      return false;
    }

    return true;
  } catch (error) {
    // Incluye el TimeoutError de AbortSignal.timeout y los errores de red.
    console.error("correo: no se pudo enviar la confirmación", error);
    return false;
  }
}
