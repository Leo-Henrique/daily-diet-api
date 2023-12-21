import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", table => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("sessionId");
    table.integer("sessionIdExpiration");
    table.string("email").unique().notNullable();
    table.string("passwordHash").notNullable();
    table.string("name").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users");
}
