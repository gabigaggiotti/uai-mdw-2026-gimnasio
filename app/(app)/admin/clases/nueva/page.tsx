import { notFound } from "next/navigation";
import { requerirUsuario } from "@/lib/auth";
import { listarProfesores } from "@/lib/db/profesores";
import { NOMBRE_DIA, type DiaSemana } from "@/lib/clases";
import { SinDatos } from "@/components/sin-datos";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { FormularioClase } from "./formulario";

export const metadata = { title: "Nueva clase — Gimnasio" };

/**
 * Alta de una clase en la grilla (paso 1 del flujo). La página prepara el
 * formulario con los profesores activos; quien decide es la acción, que
 * vuelve a verificar el rol ADMINISTRADOR.
 */
export default async function NuevaClase() {
  const usuario = await requerirUsuario();
  if (usuario.rol !== "ADMINISTRADOR") notFound();

  const profesores = (await listarProfesores()).filter((profesor) => profesor.activo);

  if (profesores.length === 0) {
    return (
      <SinDatos
        titulo="No hay profesores activos"
        descripcion="Toda clase necesita un profesor. Dá de alta uno con POST /api/profesores y volvé a esta pantalla."
      />
    );
  }

  const dias = (Object.keys(NOMBRE_DIA) as DiaSemana[]).map((dia) => ({ valor: dia, etiqueta: NOMBRE_DIA[dia] }));

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <h1 className="text-2xl font-bold">Nueva clase</h1>
        <CardDescription>La clase se repite todas las semanas en el día y horario que elijas.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormularioClase
          profesores={profesores.map((p) => ({ valor: p.id, etiqueta: `${p.usuario.nombre} (${p.especialidad})` }))}
          dias={dias}
        />
      </CardContent>
    </Card>
  );
}
