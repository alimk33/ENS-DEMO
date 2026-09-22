import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().positive().default(3000),

  MONGODB_URI: z.string().min(1),

  MONGODB_DB_NAME: z.string().min(1),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables:", result.error.format());
  process.exit(1);
}

export const env = result.data;