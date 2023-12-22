import "knex";

declare module "knex/types/tables" {
  interface Tables {
    users: {
      id: string;
      sessionId: string | null;
      sessionIdExpiration: Date | null;
      email: string;
      passwordHash: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    };

    foods: {
      id: string;
      userId: string;
      name: string;
      description: string;
      inDiet: boolean;
      createdAt: Date;
    };
  }
}
