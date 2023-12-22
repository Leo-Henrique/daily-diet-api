import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") config({ path: "./.env.test" });
else config();

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3333),
  DATABASE_CLIENT: z.enum(["sqlite3", "pg"]),
  DATABASE_URL: z.string(),
});

const _env = schema.safeParse(process.env);

if (!_env.success) {
  console.error(_env.error.format());

  throw new Error("Invalid environment variables.");
}

export const env = _env.data;
