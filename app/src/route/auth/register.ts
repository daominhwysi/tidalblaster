import { Elysia, t } from "elysia";
import { setup } from "../../setup";
export const registerRoute = new Elysia().use(setup).post(
  "/register",
  async ({ db, body, status }) => {
    const isUsernameExisted = await db.user.findFirst({
      where: { username: body.username },
    });
    if (isUsernameExisted) {
      return status(401, "username have already been taken");
    }
    const hashedPassword = await Bun.password.hash(body.password);
    const user = await db.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        name: body.name,
      },
    });
    user.password = "";
    return { user };
  },
  {
    body: t.Object({
      username: t.String(),
      password: t.String(),
      name: t.String(),
    }),
  }
);
