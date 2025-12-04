// index.ts
import { Elysia, t } from "elysia";
import { prisma } from "./lib/prismaClient";
import { authRoutes } from "./route/auth";
import { wsRoute } from "./route/ws";
import { ZombieHandler } from "./worker/zombieHandler";

const app = new Elysia()
  .decorate("prisma", prisma)
  .use(authRoutes)
  .use(wsRoute)
  .listen(Bun.env.PORT || 3000);

if (app.server) {
  const zombieHandler = new ZombieHandler(app.server);
  zombieHandler.start();
  console.log(
    `🦊 Server running at ${app.server?.hostname}:${app.server?.port}`
  );
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down gracefully...");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Shutting down gracefully...");
    process.exit(0);
  });
}
