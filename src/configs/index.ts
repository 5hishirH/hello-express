import "dotenv/config";
import { z } from "zod";

const cfgSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("production"),
  PORT: z.string(),
  DATABASE_URL: z.string(),
  CORS_ORIGINS: z.string().transform((val) =>
    val
      .split(" ")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
});

const _cfg = cfgSchema.safeParse(process.env);

if (!_cfg.success) {
  console.error("Invalid environment variables:", _cfg.error.format());
  throw new Error("Invalid environment variables");
}

export const cfg = Object.freeze(_cfg.data);
