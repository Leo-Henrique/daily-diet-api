import { execSync } from "node:child_process";
import { afterAll, beforeAll, beforeEach } from "vitest";
import { app } from "../src/app";

beforeAll(() => app.ready());
afterAll(() => app.close());

beforeEach(() => {
  execSync("yarn knex migrate:rollback --all");
  execSync("yarn knex migrate:latest");
});
