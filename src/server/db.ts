import { PrismaClient } from "@prisma/client";
import { env } from "@/env.js";
import { Logger } from "./utils/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    // Configuración optimizada para Supabase
    __internal: {
      engine: {
        connectionLimit: 50, // Aumentar significativamente
        poolTimeout: 30, // Aumentar timeout
        connectTimeout: 30, // Timeout de conexión
        socketTimeout: 30, // Timeout de socket
      },
    },
  });

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Logging de conexión a la base de datos en desarrollo
if (env.NODE_ENV === "development") {
  db.$connect()
    .then(() => {
      Logger.db("Database connected successfully.");
    })
    .catch((err) => {
      Logger.error("Database connection error:", err);
    });
}
