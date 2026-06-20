import path from "node:path";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load .env.local for local development, fallback to default .env
dotenv.config({ path: path.join(__dirname, ".env.local") });
dotenv.config();

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),

  datasource: {
    url: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL,
  },
});

