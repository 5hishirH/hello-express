import "dotenv/config";
import * as z from "zod";
import ms from "ms";

const msStringSchema = z
  .string()
  .refine((val) => ms(val as ms.StringValue) !== undefined, {
    message: "Invalid duration format (e.g., '5m', '1d', '10s')",
  })
  .transform((val) => ms(val as ms.StringValue)!); // safely convert to milliseconds

const cfgSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "code_server"]).default("production"),
  PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
  CORS_ORIGINS: z.string().transform((val) =>
    val
      .split(" ")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
  // general cookie option
  COOKIE_SAMESITE: z.enum(["none", "lax", "strict"]).default("lax"),
  // session
  SESSION_SECRET: z.string(),
  SESSION_EXPIRY: msStringSchema,
  //refresh cookie
  REFRESH_COOKIE_NAME: z.string().default("refresh_cookie"),
  REFRESH_EXPIRY: msStringSchema,
  // supabase storage
  STORAGE_ENDPOINT: z.string(),
  STORAGE_ACCESS_KEY: z.string(),
  STORAGE_SECRET_KEY: z.string(),
  STORAGE_BUCKET: z.string(),
  STORAGE_REGION: z.string(),
});

const _cfg = cfgSchema.safeParse(process.env);

if (!_cfg.success) {
  console.error("Invalid environment variables:", _cfg.error.format());
  throw new Error("Invalid environment variables");
}

export const cfg = Object.freeze(_cfg.data);
