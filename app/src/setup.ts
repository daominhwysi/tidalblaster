import { Elysia, status, t } from "elysia";
import { prisma } from "./lib/prismaClient";
import jwt from "@elysiajs/jwt";
export const setup = new Elysia({ name: "setup" }).decorate("db", prisma);

export const authPlugin = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET ?? "a-very-secret-key",
    })
  )
  .derive({ as: "scoped" }, async ({ jwt, headers, status }) => {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return status(401, "Unauthorized");
    }
    const token = authHeader.slice(7);
    const profile = await jwt.verify(token);
    if (!profile) return status(401, "Unauthorized");
    return {
      user: {
        username: profile.username,
        name: profile.name,
        id: profile.id,
      },
    };
  })
  .macro({
    isSignIn: {
      resolve({ user, status }) {
        if (!user) return status(401, "Unauthorized");
      },
    },
  });
