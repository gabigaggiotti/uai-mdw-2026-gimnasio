// Layout de las pantallas sin sesión: un encabezado y nada más. No hay
// barra ni "Salir" porque acá no hay nadie logueado.
export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b bg-card">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <span className="text-lg font-bold">Gimnasio</span>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </>
  );
}
