// index.ts
import { Elysia, t } from "elysia";
import { prisma } from "./lib/prismaClient";
import { authRoutes } from "./route/auth";
import { wsRoute } from "./route/ws";
import { heartbeatWorker } from "./workers/heartbeatWorker";

const app = new Elysia()
  .decorate("prisma", prisma)
  .use(authRoutes)
  .use(wsRoute)
  .listen(Bun.env.PORT || 3000);

console.log(`🦊 Server running at ${app.server?.hostname}:${app.server?.port}`);

heartbeatWorker.start();

process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down gracefully...");
  heartbeatWorker.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down gracefully...");
  heartbeatWorker.stop();
  process.exit(0);
});
