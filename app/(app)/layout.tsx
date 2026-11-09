import { redirect } from "next/navigation";
import { obtenerUsuario } from "@/lib/auth";
import { Navegacion } from "@/components/navegacion";

/**
 * Layout de todo lo que requiere sesión.
 *
 * La redirección de acá es EXPERIENCIA DE USO, no seguridad: un layout no
 * se vuelve a ejecutar en cada navegación del cliente. Por eso cada página
 * vuelve a pedir el usuario (requerirUsuario) y cada consulta de lib/db/
 * sigue llevando el id de la sesión (clase 10).
 */
export default async function LayoutConSesion({ children }: { children: React.ReactNode }) {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/ingresar");

  return (
    <>
      <Navegacion usuario={usuario} />
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </>
  );
}
