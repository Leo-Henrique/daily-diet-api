import { Knex } from "knex";

declare module "knex/types/tables" {
  interface Food {
    id: string;
    session_id: string;
    name: string;
    description: string;
    in_diet: boolean;
    created_at: string;
  }

  interface Tables {
    foods: Knex.CompositeTableType<
      Food,
      Omit<Food, "id" | "created_at">,
      Partial<Omit<Food, "id" | "session_id">>
    >;
  }
}
