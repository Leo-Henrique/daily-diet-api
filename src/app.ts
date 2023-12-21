import fastifyCookie from "@fastify/cookie";
import fastify from "fastify";
import { authRoutes } from "./routes/auth";
import { foodRoutes } from "./routes/foods";

export const app = fastify();

app.register(fastifyCookie);
app.register(authRoutes, { prefix: "auth" });
app.register(foodRoutes, { prefix: "foods" });
