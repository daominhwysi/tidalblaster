import { Elysia, t } from "elysia";
import { tickets } from "../auth/ticket";
import { playerHandler } from "./playerHandler";
import { WSEvent, WSMessage } from "../../lib/events";

export const wsRoute = new Elysia()
  // Use derive method to inject user var into the context
  .derive(({ query }) => {
    const ticketId = query.ticket;
    const role = query.role;
    const user = tickets.get(ticketId || "");
    if (user && ticketId) tickets.delete(ticketId);

    return {
      user: user ? { ...user, role, clientId: ticketId } : null,
    };
  })
  .ws("/ws/", {
    query: t.Object({
      ticket: t.String(),
      role: t.String(),
    }),
    async open(ws) {
      await playerHandler.handleConnection(ws);
    },

    async message(ws, rawMessage) {
      try {
        const message = (
          typeof rawMessage === "string" ? JSON.parse(rawMessage) : rawMessage
        ) as WSMessage;
        switch (message.event) {
          case WSEvent.SONG_CONTROL:
            playerHandler.handleSongEvent(ws, message.data);
            break;

          case WSEvent.PING:
            ws.send(JSON.stringify({ event: "PONG", data: null }));
            playerHandler.handlePong(ws);
            break;

          default:
            console.warn("Unknown Event:", message.event);
        }
      } catch (err) {
        console.error("Invalid JSON format");
      }
    },

    async close(ws) {
      await playerHandler.handleDisconnect(ws);
    },
    async pong(ws) {
      playerHandler.handlePong(ws);
    },
  });
