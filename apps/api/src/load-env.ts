import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Prisma lee `DATABASE_URL` desde `process.env` al crear el cliente.
 * Ese valor vive en `packages/db/.env` (ver `.env.example` del monorepo);
 * si solo existiera `apps/api/.env`, a veces el cliente se cargaba sin URL válida.
 */
const dbPackageEnvPath = resolve(__dirname, "../../../packages/db/.env");
if (existsSync(dbPackageEnvPath)) {
  config({ path: dbPackageEnvPath, quiet: true });
}

config({ path: resolve(__dirname, "../.env"), quiet: true });
