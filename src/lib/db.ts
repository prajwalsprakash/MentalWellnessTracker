import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Set up Neon serverless driver to use WebSockets in Node.js environments
if (typeof globalThis.WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

// Route WebSocket traffic through port 443 instead of 5432 to bypass local network protocol drops
neonConfig.wsProxy = (host) => `${host}:443/v2`;
neonConfig.useSecureWebSocket = true;

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_PRISMA_URL ||
  "";

// Extend the global type so TypeScript knows about our cached client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * The shared Prisma client instance utilizing Neon serverless adapter over WebSockets.
 *
 * Usage:
 * ```ts
 * import { db } from "@/lib/db";
 *
 * const user = await db.user.findUnique({ where: { clerkId } });
 * ```
 */
export const db: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaNeon({
      connectionString,
      connectionTimeoutMillis: 10000, // 10 seconds timeout
    }),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// In development, persist the client across hot-reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
