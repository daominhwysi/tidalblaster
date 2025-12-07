// export const userRoute = new Elysia()
//   .use(setup)
//   .use(authPlugin)
//   .get(
//     "/me",
//     async ({ db, user, status }) => {
//       if (!user) {
//         return status(401, "Unauthorized");
//       }
//       let dbUser = await db.user.findUnique({
//         where: { id: Number(user.id) },
//       });
//       if (dbUser) {
//         dbUser.password = "";
//       }
//       return dbUser;
//     },
//     {
//       isSignIn: true,
//     }
//   );
import { Elysia } from "elysia";
import { authPlugin, setup } from "./plugin";

export const userRoute = new Elysia()
  .use(setup)
  .use(authPlugin)
  .get(
    "/me",
    async ({ db, user, status }) => {
      if (!user) {
        return status(401, "Unauthorized");
      }

      return {
        username: user.username,
        name: user.name,
        id: user.id,
      };
    },
    {
      isSignIn: true,
    }
  );
