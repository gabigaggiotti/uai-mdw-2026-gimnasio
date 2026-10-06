import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import type { Rol as RolPrisma } from "@prisma/client";
import { obtenerOCrearUsuarioDeProveedor } from "@/lib/db/usuarios";

export type Rol = RolPrisma;

export type UsuarioSesion = {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
};

export class NoAutenticado extends Error {
  constructor() {
    super("No autenticado");
    this.name = "NoAutenticado";
  }
}

export class NoAutorizado extends Error {
  constructor() {
    super("No autorizado");
    this.name = "NoAutorizado";
  }
}

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      nombre: string;
      rol: Rol;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    usuarioId?: string;
    nombre?: string;
    rol?: Rol;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        const usuario = await obtenerOCrearUsuarioDeProveedor(
          user.email,
          user.name ?? user.email,
        );

        token.usuarioId = usuario.id;
        token.nombre = usuario.nombre;
        token.rol = usuario.rol;
      }

      return token;
    },
    session({ session, token }) {
      if (token.usuarioId && token.nombre && token.rol) {
        session.user.id = token.usuarioId;
        session.user.nombre = token.nombre;
        session.user.rol = token.rol;
      }
      return session;
    },
  },
});

/**
 * Devuelve el usuario de la sesión, o null si no hay sesión.
 * Se usa cuando la página funciona con y sin usuario logueado.
 */
export async function obtenerUsuario(): Promise<UsuarioSesion | null> {
  const sesion = await auth();
  const usuario = sesion?.user;

  if (!usuario?.id || !usuario.email || !usuario.nombre || !usuario.rol) {
    return null;
  }

  return {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
  };
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
    throw new NoAutenticado();
  }

  if (roles && !roles.includes(usuario.rol)) {
    throw new NoAutorizado();
  }

  return usuario;
}
