import { app } from "./app";
import { env } from "./env";

(async () => {
  await app.listen({ host: "0.0.0.0", port: env.PORT });

  console.log(`HTTP server running in port ${env.PORT}!`);
})();
