import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

try {
  process.loadEnvFile(path.join(rootDir, ".env"));
} catch {
  // No .env file: defaults below apply.
}

const env = process.env;
const dataDir = path.resolve(rootDir, env.DATA_DIR ?? "./data");
const httpPort = Number(env.HTTP_PORT ?? 3001);

export const config = {
  wsPort: Number(env.WS_PORT ?? 1234),
  httpPort,
  host: env.HOST ?? "localhost",
  /** Optional shared secret. Empty = no auth. */
  authToken: env.AUTH_TOKEN?.trim() || undefined,
  dataDir,
  uploadsDir: path.join(dataDir, "uploads"),
  databaseFile: path.join(dataDir, "canvas.sqlite"),
  publicUrl: (env.PUBLIC_URL ?? `http://localhost:${httpPort}`).replace(/\/$/, ""),
  corsOrigin: env.CORS_ORIGIN ?? "*",
} as const;
