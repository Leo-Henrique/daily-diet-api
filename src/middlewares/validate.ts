import { preHandlerHookHandler } from "fastify";
import { z } from "zod";

export function validate(
  schema: z.Schema,
  target: "body" | "query" | "params" = "body",
): preHandlerHookHandler {
  return (req, res, done) => {
    const validation = schema.safeParse(req[target]);

    if (!validation.success) {
      return res.code(400).send({
        error: `Invalid request ${target} data.`,
        issues: validation.error.errors,
      });
    }

    req[target] = validation.data;
    done();
  };
}
