import { Elysia, t } from "elysia";
import { setup } from "../../setup";
import { jwt } from "@elysiajs/jwt";
export const loginRoute = new Elysia()
  .use(setup)
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET || "a-very-secret-key",
    })
  )
  .post(
    "/login",
    async ({ db, body, status, jwt }) => {
      const user = await db.user.findFirst({
        where: { username: body.username },
      });
      if (!user) {
        return status(401, "Unauthorized");
      }
      const isValid = await Bun.password.verify(body.password, user.password);
      if (!isValid) {
        return status(401, "Unauthorized");
      }

      const access_token = await jwt.sign({
        username: user.username,
        name: user.name,
        id: user.id,
      });
      return { access_token };
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    }
  );
