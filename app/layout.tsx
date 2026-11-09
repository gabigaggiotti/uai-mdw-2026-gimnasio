import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gimnasio — reservas de clases",
  description: "Grilla semanal y reservas de clases del gimnasio. Metodologías de Desarrollo Web — UAI",
};

// La fuente y el <body>, nada más. La barra con sesión vive en el layout
// de (app) y el encabezado público en el de (public).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
