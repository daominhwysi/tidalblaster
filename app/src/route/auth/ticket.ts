import { Elysia } from "elysia";
import { authPlugin, setup } from "../../setup";
export const tickets = new Map<string, any>();
const TICKET_LIFETIME = 60_000;
export const ticket = new Elysia()
  .use(setup)
  .use(authPlugin)
  .get(
    "/ticket",
    async ({ db, user, status }) => {
      const ticketId = crypto.randomUUID();
      tickets.set(ticketId, user);
      setTimeout(() => {
        const exists = tickets.has(ticketId);
        if (exists) tickets.delete(ticketId);
      }, TICKET_LIFETIME);
      return { ticketId };
    },
    {
      isSignIn: true,
    }
  );
