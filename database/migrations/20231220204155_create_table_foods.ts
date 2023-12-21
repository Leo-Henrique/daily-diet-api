import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("foods", table => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("userId").index().notNullable();
    table.string("name").notNullable();
    table.text("description");
    table.boolean("inDiet").notNullable();
    table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable();

    table
      .foreign("userId")
      .references("id")
      .inTable("users")
      .onDelete("cascade")
      .onUpdate("cascade");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("foods");
}
