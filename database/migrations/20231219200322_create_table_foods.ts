import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("foods", table => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("session_id").index().notNullable();
    table.string("name").notNullable();
    table.text("description").notNullable();
    table.boolean("in_diet").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("foods");
}
