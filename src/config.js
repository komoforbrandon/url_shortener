import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  CORS_ORIGIN: z.string().default("*"),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.log("\nInvalid configuration. Check your .env file:\n");
  for (let issue of result.error.issues) {
    console.error(`- ${issue.path.join(",")}: ${issue.message}`);
  }
  console.error("");
  process.exit(1);
}

export const config = Object.freeze(result.data);
