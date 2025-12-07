import { WSEvent, WSMessage } from "../../lib/events";
import { redis_client } from "../../lib/redis";
import { PlayerWS } from "../../types";
import { z } from "zod";

export const connectedClients = new Map<string, PlayerWS>();

const CONTROL_SONG = z.object({
  targetPlayer: z.string(),
  appTarget: z.enum(["spotify", "tidal", "apple music"]).default("spotify"),
  actionType: z.enum(["PLAY", "STOP", "PREVIOUS_TRACK", "NEXT_TRACK"]),
});

export const playerHandler = {
  async handlePong(ws: PlayerWS) {
    if (!ws.data.user) {
      ws.send("Invalid or expired ticket");
      ws.close();
      return;
    }
    const user = ws.data.user;
    if (user.role == "music_player") {
      await redis_client.zadd(
        `active_players:${user.id}`,
        Date.now(),
        user.clientId
      );
    }
  },
  async handleConnection(ws: PlayerWS) {
    if (!ws.data.user) {
      ws.send("Invalid or expired ticket");
      ws.close();
      return;
    }
    const user = ws.data.user;
    connectedClients.set(user.clientId, ws);

    const userTopic = `user:${user.id}`;
    ws.subscribe(userTopic);
    await redis_client.sadd(`active_user_ids`, user.id);

    if (user.role === "music_player") {
      await redis_client.zadd(
        `active_players:${user.id}`,
        Date.now(),
        user.clientId
      );

      // Sending player id to every client in that account
      ws.publish(
        userTopic,
        JSON.stringify({
          event: WSEvent.PLAYER_CONNECTED,
          data: { clientId: user.clientId },
        })
      );
    }

    if (user.role === "user") {
      // Get all the active players client
      const players = await redis_client.zrange(
        `active_players:${user.id}`,
        0,
        -1
      );
      // Sending players list to user client connected
      ws.send(
        JSON.stringify({
          event: WSEvent.SYNC_PLAYERS,
          data: { players },
        })
      );
    }
  },

  async handleDisconnect(ws: PlayerWS) {
    const user = ws.data.user;
    const userId = user.id;
    const userTopic = `user:${user.id}`;
    if (ws.data.user?.clientId) {
      connectedClients.delete(ws.data.user.clientId);
    }

    if (!user) return;
    if (user.role == "music_player") {
      await redis_client.zrem(`active_players:${userId}`, user.clientId);
      ws.publish(
        userTopic,
        JSON.stringify({
          event: WSEvent.PLAYER_DISCONNECTED,
          data: { clientId: user.clientId },
        })
      );
    }
    // Note: Evaluate lua script here in the future to avoid race condition
    const count = await redis_client.zcard(`active_players:${userId}`);
    if (count === 0) await redis_client.srem("active_user_ids", userId);
  },
  async closeWsConnection(clientId: string) {
    const ws = connectedClients.get(clientId);

    if (ws) {
      ws.send(
        JSON.stringify({
          event: "KICKED",
          data: "You have been disconnected by server.",
        })
      );

      ws.close();
      connectedClients.delete(clientId);

      return true;
    }
    return false;
  },
  handleSongEvent(ws: PlayerWS, message: object) {
    const result = CONTROL_SONG.safeParse(message);

    if (!result.success) {
      console.log("Invalid command format:", result.error.format());
      return;
    }

    const { targetPlayer, actionType, appTarget } = result.data;
    const targetWs = connectedClients.get(targetPlayer);

    if (targetWs) {
      console.log(`Forwarding ${actionType} to ${targetPlayer}`);

      const payload = {
        event: "command",
        data: {
          action: actionType,
          target: appTarget,
        },
      };

      targetWs.send(JSON.stringify(payload));
    } else {
      console.warn(`Target player ${targetPlayer} not found.`);
    }
  },
};
