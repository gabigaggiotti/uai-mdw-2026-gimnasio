/**
 * Sesiones de prueba. El login de Google pide una persona, así que las
 * pruebas no pasan por ahí: fabrican la cookie de sesión con la MISMA
 * función de Auth.js (encode) y el AUTH_SECRET de .env.e2e, que solo
 * existe en las pruebas.
 *
 * La app no se entera: no hay usuario mágico ni "modo prueba" en el
 * código. Para la app es una sesión como cualquier otra (clase 13).
 */
import { encode } from "next-auth/jwt";
import type { BrowserContext } from "@playwright/test";
import { USUARIOS, type ClaveUsuario } from "./datos";

// Sin HTTPS, Auth.js usa el nombre de cookie sin el prefijo __Secure-.
export const NOMBRE_COOKIE = "authjs.session-token";

export async function tokenDe(clave: ClaveUsuario): Promise<string> {
  const secreto = process.env.AUTH_SECRET;
  if (!secreto) throw new Error("Falta AUTH_SECRET: las pruebas se corren con .env.e2e");

  const usuario = USUARIOS[clave];
  return encode({
    secret: secreto,
    salt: NOMBRE_COOKIE,
    token: {
      sub: usuario.id,
      email: usuario.email,
      name: usuario.nombre,
      // Los mismos campos que escribe el callback jwt de lib/auth.ts.
      usuarioId: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
    },
  });
}

/** El header Cookie para pegarle a la API como ese usuario. */
export async function cookieDe(clave: ClaveUsuario): Promise<string> {
  return `${NOMBRE_COOKIE}=${await tokenDe(clave)}`;
}

/** Inicia sesión en un contexto de navegador. */
export async function iniciarSesion(contexto: BrowserContext, clave: ClaveUsuario, baseURL: string) {
  await contexto.addCookies([
    {
      name: NOMBRE_COOKIE,
      value: await tokenDe(clave),
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
