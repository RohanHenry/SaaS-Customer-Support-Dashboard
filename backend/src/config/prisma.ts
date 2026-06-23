import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

/**
 * A single shared PrismaClient instance for the whole app.
 *
 * Why a singleton? Each PrismaClient opens its own database connection pool.
 * During development the dev server reloads on every file save, so without this
 * guard we'd leak a brand-new pool on each reload and eventually exhaust MySQL's
 * connection limit. We stash the instance on `globalThis` so reloads reuse it.
 *
 * Prisma 7 connects through a "driver adapter" — here PrismaMariaDb, which speaks
 * the MySQL protocol. We build it from the single DATABASE_URL env var.
 */
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

const url = new URL(databaseUrl);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  connectionLimit: 5,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
