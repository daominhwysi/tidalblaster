import Elysia from "elysia";
import { loginRoute } from "./login";
import { registerRoute } from "./register";
import { userRoute } from "./profille";
import { ticket } from "./ticket";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(loginRoute)
  .use(registerRoute)
  .use(userRoute)
  .use(ticket);
