import { listarClases } from "@/lib/db/clases";
import { listarProfesores } from "@/lib/db/profesores";

export default async function Page() {
  const [clases, profesores] = await Promise.all([
    listarClases(),
    listarProfesores(),
  ]);

  return (
    <main className="container mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Panel General - Gimnasio</h1>
        <p className="text-gray-600">Bienvenido al sistema de gestión.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resumen de Clases */}
        <div className="p-6 border rounded-xl shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4">Clases Disponibles</h2>
          <p className="text-3xl font-bold text-blue-600">{clases.length}</p>
          <ul className="mt-4 space-y-2">
            {clases.slice(0, 5).map((clase) => (
              <li key={clase.id} className="text-sm text-gray-700">
                • {clase.nombre}
              </li>
            ))}
          </ul>
        </div>

        {/* Resumen de Profesores */}
        <div className="p-6 border rounded-xl shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4">Profesores Registrados</h2>
          <p className="text-3xl font-bold text-green-600">{profesores.length}</p>
          <ul className="mt-4 space-y-2">
            {profesores.slice(0, 5).map((profesor) => (
              <li key={profesor.id} className="text-sm text-gray-700">
                • {profesor.usuario.nombre} {profesor.usuario.apellido}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}