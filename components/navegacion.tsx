import Link from "next/link";
import { signOut, type Rol, type UsuarioSesion } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const NOMBRE_ROL: Record<Rol, string> = {
  CLIENTE: "Cliente",
  PROFESOR: "Profesor",
  ADMINISTRADOR: "Administrador",
};

/**
 * La barra de la parte con sesión. Contesta las tres preguntas de la
 * clase 10: dónde estoy (el nombre del sistema, que lleva a la home),
 * quién soy acá (nombre y rol) y cómo me voy (Salir, siempre acá).
 *
 * Los links según el rol son cortesía, no seguridad: cada página y cada
 * acción vuelve a verificar el rol en el servidor.
 */
export function Navegacion({ usuario }: { usuario: UsuarioSesion }) {
  async function salir() {
    "use server";
    await signOut({ redirectTo: "/ingresar" });
  }

  return (
    <header className="border-b bg-card">
      <nav
        aria-label="Principal"
        className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/" className="text-lg font-bold">
            Gimnasio
          </Link>
          <Link href="/" className="text-sm underline-offset-4 hover:underline">
            Grilla
          </Link>
          {usuario.rol === "CLIENTE" ? (
            <Link href="/reservas" className="text-sm underline-offset-4 hover:underline">
              Mis reservas
            </Link>
          ) : null}
          {usuario.rol === "ADMINISTRADOR" ? (
            <Link href="/admin/clases/nueva" className="text-sm underline-offset-4 hover:underline">
              Nueva clase
            </Link>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm">
            <span className="sr-only">Sesión iniciada como </span>
            {usuario.nombre}
          </span>
          <Badge variant="outline">{NOMBRE_ROL[usuario.rol]}</Badge>
          <form action={salir}>
            <Button type="submit" variant="outline" size="sm">
              Salir
            </Button>
          </form>
        </div>
      </nav>
    </header>
  );
}
