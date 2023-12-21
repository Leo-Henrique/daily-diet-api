import fastifyCookie from "@fastify/cookie";
import fastify from "fastify";
import { authRoutes } from "./routes/auth";

export const app = fastify();

app.register(fastifyCookie);
app.register(authRoutes, { prefix: "auth" });
