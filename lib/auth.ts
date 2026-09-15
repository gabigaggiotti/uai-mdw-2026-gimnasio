/**
 * Configuración de autenticación y autorización.
 *
 * Se completa en la CLASE 6. Hasta entonces, este archivo documenta el
 * contrato que va a tener el resto del proyecto — los Route Handlers de
 * la clase 4 ya lo importan, pero todavía no llaman a `requerirUsuario`
 * (queda con un TODO), igual que hacía `app/api/notas/route.ts`.
 *
 * Las dos funciones de abajo son las únicas formas válidas de saber quién
 * está haciendo un request. Ningún componente ni endpoint debe leer el
 * usuario de otro lado: si el `userId` o el `rol` vienen del cliente,
 * cualquiera puede mentir.
 */

export type Rol = "CLIENTE" | "PROFESOR" | "ADMINISTRADOR";

export type UsuarioSesion = {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
};

/**
 * Devuelve el usuario de la sesión, o null si no hay sesión.
 * Se usa cuando la página funciona con y sin usuario logueado.
 */
export async function obtenerUsuario(): Promise<UsuarioSesion | null> {
  // TODO (clase 6): leer la sesión real de Auth.js.
  return null;
}

/**
 * Devuelve el usuario de la sesión o corta el request.
 * Se usa en todo lo que requiere estar logueado.
 *
 * `roles` es un array porque varios endpoints de este proyecto permiten
 * más de un rol (ej. cancelar una reserva: el Cliente dueño o un
 * Administrador). Si se omite, alcanza con estar autenticado.
 *
 * Se verifica acá y no en la UI: esconder un botón no impide que
 * alguien llame al endpoint con Postman.
 */
export async function requerirUsuario(roles?: Rol[]): Promise<UsuarioSesion> {
  const usuario = await obtenerUsuario();

  if (!usuario) {
    throw new Error("No autenticado"); // → 401
  }

  if (roles && !roles.includes(usuario.rol)) {
    throw new Error("No autorizado"); // → 403
  }

  return usuario;
}
