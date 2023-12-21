import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { database } from "../database";
import { session } from "../middlewares/session";
import { validate } from "../middlewares/validate";

export async function authRoutes(app: FastifyInstance) {
  const signUpBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(3),
  });

  app.post<{ Body: z.infer<typeof signUpBodySchema> }>(
    "/sign-up",
    { preHandler: [validate(signUpBodySchema)] },
    async (req, res) => {
      const { name, email, password } = req.body;

      const existingUser = await database("users").where({ email }).first();

      if (existingUser)
        return res.code(409).send({ error: "Email already exists." });

      const passwordHash = await bcrypt.hash(password, 12);

      await database("users").insert({ name, email, passwordHash });

      res.code(201).send();
    },
  );

  const signInBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(3),
  });

  app.post<{ Body: z.infer<typeof signInBodySchema> }>(
    "/sign-in",
    { preHandler: [validate(signInBodySchema)] },
    async (req, res) => {
      const { email, password } = req.body;

      const user = await database("users").where({ email }).first();

      if (!user) return res.code(404).send({ error: "Email not register." });

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword)
        return res.code(401).send({ error: "Invalid password." });

      const sessionId = randomUUID();
      const sessionIdDuration = 1000 * 60 * 60 * 24; // 24 hours

      const [userWithSession] = await database("users")
        .where({ id: user.id })
        .update({
          sessionId,
          sessionIdExpiration: Date.now() + sessionIdDuration,
        })
        .returning("*");

      delete (
        userWithSession as Omit<typeof userWithSession, "passwordHash"> &
          Partial<Pick<typeof userWithSession, "passwordHash">>
      ).passwordHash;

      res
        .setCookie("sessionId", sessionId, {
          maxAge: sessionIdDuration,
          path: "/",
        })
        .code(200)
        .send({ user: userWithSession });
    },
  );

  app.post("/sign-out", { preHandler: [session] }, async (req, res) => {
    const { sessionId } = req.cookies;

    await database("users")
      .where({ sessionId })
      .update({ sessionId: null, sessionIdExpiration: null });

    res.clearCookie("sessionId", { path: "/" }).code(204).send();
  });
}
