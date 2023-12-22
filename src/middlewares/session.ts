import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { database } from "../database";

export async function session(req: FastifyRequest, res: FastifyReply) {
  const { sessionId } = req.cookies;

  if (!sessionId)
    return res.code(401).send({ error: "Session id not provided." });

  const sessionIdSchema = z.string().uuid();

  if (!sessionIdSchema.safeParse(sessionId).success)
    return res.code(401).send({ error: "Invalid session id format." });

  const user = await database("users").where({ sessionId }).first();

  if (!user || !user.sessionIdExpiration)
    return res.code(401).send({ error: "Invalid session id." });

  const expirationTime = () => {
    // SQlite
    if (typeof user.sessionIdExpiration === "number")
      return user.sessionIdExpiration;

    // Postgres
    return user.sessionIdExpiration!.getTime();
  };

  if (Date.now() > expirationTime())
    return res.code(401).send({ error: "Session id expired." });

  req.authUserId = user.id;
}
