import knex, { Knex } from "knex";
import { env } from "./env";

const connection = (): Knex.Config["connection"] => {
  if (env.DATABASE_CLIENT === "sqlite3") return { filename: env.DATABASE_URL };

  return env.DATABASE_URL;
};

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: connection(),
  migrations: {
    extension: "ts",
    directory: "./database/migrations",
  },
  useNullAsDefault: true,
};

export const database = knex(config);
