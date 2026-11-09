import { defineConfig } from "vitest/config";

// Las pruebas de dominio (lib/**/*.test.ts) corren con vitest, sin base ni
// red. Las de e2e/ son de Playwright y se corren con `npm run test:e2e`:
// sin este include, vitest intentaría correr los *.spec.ts de Playwright.
//
// .mts y no .ts: el proyecto no es "type": "module", y vitest/config es ESM.
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
  },
});
