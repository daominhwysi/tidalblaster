import { WSEvent } from "../../lib/events";
import Elysia, { Cookie, HTTPHeaders, StatusMap, TSchema } from "elysia";
import { ElysiaWS } from "elysia/dist/ws";
import { ElysiaCookie } from "elysia/dist/cookies";
import { TypeCheck } from "elysia/dist/type-system";
import { Server } from "elysia/dist/universal/server";
import { ServerWebSocket, ServerWebSocketSendStatus } from "elysia/dist/ws/bun";
import { redis_client } from "../../lib/redis";
// This interfance uses to ensure that Typescript can just shut the fuck up
export interface PlayerWS {
  raw: ServerWebSocket<{
    id?: string;
    validator?: TypeCheck<TSchema>;
  }>;

  data: {
    path: string;
    readonly user: any;
    query: { role: string; ticket: string };
    headers: Record<string, string | undefined>;
    params: {};
    cookie: Record<string, Cookie<unknown>>;
    server: Server | null;

    set: {
      headers: HTTPHeaders;
      status?: number | keyof StatusMap;
      redirect?: string;
      cookie?: Record<string, any>;
    };

    route: string;
    request: Request;
    store: {};
  };

  body: unknown;

  send: (data: unknown, compress?: boolean) => ServerWebSocketSendStatus;
  ping: (data?: unknown) => ServerWebSocketSendStatus;
  pong: (data?: unknown) => ServerWebSocketSendStatus;

  publish: (
    topic: string,
    data: unknown,
    compress?: boolean
  ) => ServerWebSocketSendStatus;

  sendText: ServerWebSocket["sendText"];
  sendBinary: ServerWebSocket["sendBinary"];
  close: ServerWebSocket["close"];
  terminate: ServerWebSocket["terminate"];

  publishText: ServerWebSocket["publishText"];
  publishBinary: ServerWebSocket["publishBinary"];
  subscribe: ServerWebSocket["subscribe"];
  unsubscribe: ServerWebSocket["unsubscribe"];
  isSubscribed: ServerWebSocket["isSubscribed"];
  cork: ServerWebSocket["cork"];

  remoteAddress: ServerWebSocket["remoteAddress"];
  binaryType: ServerWebSocket["binaryType"];

  readonly readyState: ServerWebSocket["readyState"];

  validator?: TypeCheck<TSchema>;

  "~types"?: {
    validator: {
      response: unknown;
      query: { role: string; ticket: string };
      headers: unknown;
      params: {};
      cookie: unknown;
      body: unknown;
    };
  };

  readonly id: string;
}
const ACTIVE_TOPICS_KEY = "active_user_index";
export const playerHandler = {
  async handlePong(ws: PlayerWS) {
    if (!ws.data.user) {
      ws.send("Invalid or expired ticket");
      ws.close();
      return;
    }
    const user = ws.data.user;

    await redis_client.zadd(
      `active_players:${user.id}`,
      Date.now(),
      user.clientId
    );
  },
  async handleConnection(ws: PlayerWS) {
    if (!ws.data.user) {
      ws.send("Invalid or expired ticket");
      ws.close();
      return;
    }
    const user = ws.data.user;

    const userTopic = `user:${user.id}`;
    ws.subscribe(userTopic);
    await redis_client.incr(userTopic, user.id);

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
  },

  handlePlayMusic(ws: PlayerWS, payload: { songId: string }) {
    console.log(`User ${ws.data.user.id} wants to play ${payload.songId}`);
  },
};
