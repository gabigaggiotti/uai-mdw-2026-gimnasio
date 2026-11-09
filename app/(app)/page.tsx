import { requerirUsuario } from "@/lib/auth";
import { listarClases } from "@/lib/db/clases";
import { NOMBRE_DIA } from "@/lib/clases";
import { BuscadorClases, type FilaClase } from "@/components/buscador-clases";
import { SinDatos } from "@/components/sin-datos";

export const metadata = { title: "Grilla semanal — Gimnasio" };

/**
 * La home: la grilla semanal (paso 2 del flujo, docs/spec.md sección 5).
 *
 * Server Component: lee la base directo por lib/db/, sin fetch a la API
 * propia. Si la consulta falla, el error sube hasta app/(app)/error.tsx;
 * mientras carga, se ve app/(app)/loading.tsx.
 */
export default async function Grilla() {
  const usuario = await requerirUsuario();
  const clases = await listarClases();

  if (clases.length === 0) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Grilla semanal</h1>
        <SinDatos
          titulo="Todavía no hay clases en la grilla"
          descripcion={
            usuario.rol === "ADMINISTRADOR"
              ? "Cargá la primera clase para que los clientes puedan reservar."
              : "El gimnasio todavía no publicó clases. Volvé a mirar en unos días."
          }
          accion={
            usuario.rol === "ADMINISTRADOR" ? { href: "/admin/clases/nueva", texto: "Cargar una clase" } : undefined
          }
        />
      </section>
    );
  }

  const filas: FilaClase[] = clases.map((clase) => ({
    id: clase.id,
    nombre: clase.nombre,
    disciplina: clase.disciplina,
    profesor: clase.profesor.usuario.nombre,
    dia: NOMBRE_DIA[clase.diaSemana],
    horario: `${clase.horaInicio} a ${clase.horaFin}`,
    cupo: `cupo ${clase.cupoMaximo}`,
  }));

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Grilla semanal</h1>
        <p className="text-muted-foreground">
          {usuario.rol === "CLIENTE"
            ? "Elegí una clase para ver sus próximas fechas y reservar tu lugar."
            : "Las clases activas de la semana."}
        </p>
      </div>
      <BuscadorClases clases={filas} />
    </section>
  );
}
