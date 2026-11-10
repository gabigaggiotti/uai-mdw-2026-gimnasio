import { defineConfig, devices } from "@playwright/test";
import { config as cargarEnv } from "dotenv";

/**
 * Pruebas e2e (clase 13): el flujo principal con navegador y los permisos
 * contra la API. Corren contra la app COMPILADA y una base LOCAL.
 *
 * Las variables salen de .env.e2e y pisan las del entorno, para que nadie
 * corra esto por accidente con la DATABASE_URL de producción en la terminal.
 */
cargarEnv({ path: ".env.e2e", override: true, quiet: true });

// El cinturón está en la configuración, no en la memoria de quien corre las
// pruebas: estas pruebas borran la base, así que se niegan a arrancar si no
// es local.
for (const variable of ["DATABASE_URL", "DIRECT_URL"]) {
  const valor = process.env[variable] ?? "";
  const host = valor ? new URL(valor).hostname : "";
  if (host !== "localhost" && host !== "127.0.0.1") {
    throw new Error(`${variable} no apunta a una base local (host: "${host}"). Las pruebas e2e borran la base.`);
  }
}

const PUERTO = 3100;
const baseURL = `http://localhost:${PUERTO}`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/preparar.ts",
  // Comparten una sola base: en serie, para que no se pisen.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // La app compilada, como en producción, en una carpeta aparte para no
    // pisar el .next de `npm run dev` (distDir en next.config.ts).
    command: `npm run build && npx next start -p ${PUERTO}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: { ...(process.env as Record<string, string>), NEXT_DIST_DIR: ".next-e2e" },
  },
});
