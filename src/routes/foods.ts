import { FastifyInstance } from "fastify";
import { z } from "zod";
import { database } from "../database";
import { session } from "../middlewares/session";
import { validate } from "../middlewares/validate";

export async function foodRoutes(app: FastifyInstance) {
  const postFoodBodySchema = z.object({
    name: z.string(),
    inDiet: z.boolean(),
    description: z.string().optional(),
    createdAt: z.coerce.date().optional(),
  });

  app.post<{ Body: z.infer<typeof postFoodBodySchema> }>(
    "/",
    { preHandler: [session, validate(postFoodBodySchema)] },
    async (req, res) => {
      const { authUserId, body } = req;

      await database("foods").insert({ userId: authUserId, ...body });

      res.code(201).send();
    },
  );

  app.get("/", { preHandler: [session] }, async (req, res) => {
    const { authUserId } = req;

    const foods = await database("foods").where({ userId: authUserId });

    res.send({ foods });
  });

  const getFoodParamsSchema = z.object({
    id: z.string().uuid(),
  });

  app.get<{ Params: z.infer<typeof getFoodParamsSchema> }>(
    "/:id",
    { preHandler: [session, validate(getFoodParamsSchema, "params")] },
    async (req, res) => {
      const { authUserId } = req;
      const { id } = req.params;

      const food = await database("foods")
        .where({ userId: authUserId, id })
        .first();

      if (!food) return res.code(404).send({ error: "Food not found." });

      res.send({ food });
    },
  );

  const putFoodBodySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    inDiet: z.boolean().optional(),
    createdAt: z.coerce.date().optional(),
  });

  app.put<{
    Params: z.infer<typeof getFoodParamsSchema>;
    Body: z.infer<typeof putFoodBodySchema>;
  }>(
    "/:id",
    {
      preHandler: [
        session,
        validate(getFoodParamsSchema, "params"),
        validate(putFoodBodySchema),
      ],
    },
    async (req, res) => {
      const { authUserId } = req;
      const { id } = req.params;

      const food = database("foods").where({ userId: authUserId, id });

      if (!(await food.first()))
        return res.code(404).send({ error: "Food not found." });

      await food.update(req.body);

      res.code(204).send();
    },
  );

  app.delete<{ Params: z.infer<typeof getFoodParamsSchema> }>(
    "/:id",
    { preHandler: [session, validate(getFoodParamsSchema, "params")] },
    async (req, res) => {
      const { authUserId } = req;
      const { id } = req.params;

      const food = database("foods").where({ userId: authUserId, id });

      if (!(await food.first()))
        return res.code(404).send({ error: "Food not found." });

      await food.del();

      res.code(204).send();
    },
  );

  app.get("/metrics", { preHandler: [session] }, async (req, res) => {
    const { authUserId } = req;

    const foods = await database("foods")
      .where({ userId: authUserId })
      .orderBy("createdAt");

    const foodsInDiet = await database("foods")
      .where({ userId: authUserId, inDiet: true })
      .count("*", { as: "total" })
      .first();

    const foodsNotInDiet = await database("foods")
      .where({ userId: authUserId, inDiet: false })
      .count("*", { as: "total" })
      .first();

    const { bestInDietSequence } = foods.reduce(
      (acc, { inDiet }) => {
        if (inDiet) acc.currentSequence += 1;
        else acc.currentSequence = 0;

        if (acc.currentSequence > acc.bestInDietSequence)
          acc.bestInDietSequence = acc.currentSequence;

        return acc;
      },
      { bestInDietSequence: 0, currentSequence: 0 },
    );

    res.send({
      totalFoods: foods.length,
      totalFoodsInDiet: Number(foodsInDiet?.total),
      totalFoodsNotInDiet: Number(foodsNotInDiet?.total),
      bestInDietSequence,
    });
  });
}
