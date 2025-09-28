import { z } from "zod";

export const serverScheme = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Discord OAuth (optional for development)
  DISCORD_ID: z.string().optional(),
  DISCORD_SECRET: z.string().optional(),
  // Auth configuration
  AUTH_SECRET: z
    .string()
    .default("development-secret-key-change-in-production"),
  AUTH_TRUST_HOST: z.string().optional(),
  AUTH_URL: z.string().optional(),
  // Database
  DATABASE_URL: z.string().default("file:./dev.db"),
});

export const clientScheme = z.object({
  MODE: z.enum(["development", "production", "test"]).default("development"),
  VITE_AUTH_PATH: z.string().optional(),
});
