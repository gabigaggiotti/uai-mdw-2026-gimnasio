import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El build falla si hay errores de tipos o de lint. Es a propósito:
  // preferimos enterarnos en el Pull Request y no en producción.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  // Las pruebas e2e compilan en .next-e2e para no pisar el .next de
  // `npm run dev` (ver playwright.config.ts).
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
