// types.ts
import Elysia, { Cookie, HTTPHeaders, StatusMap, TSchema } from "elysia";
import { ElysiaWS } from "elysia/dist/ws";
import { ElysiaCookie } from "elysia/dist/cookies";
import { TypeCheck } from "elysia/dist/type-system";
import { Server } from "elysia/dist/universal/server";
import { ServerWebSocket, ServerWebSocketSendStatus } from "elysia/dist/ws/bun";
// Define your User type clearly
export type UserData = {
  id: string;
  clientId: string; // Unique ID for this specific tab/device
  role: "music_player" | "user";
};
export interface WSContext {
  user: {
    id: number | string;
    username: string;
    name: string;
    role: string;
    clientId: string;
  };
}
// Simplified WS Type
export interface PlayerWS {
  raw: ServerWebSocket<{ id?: string; validator?: TypeCheck<TSchema> }>;
  data: {
    readonly user: any;
    path: string;
    query: { role: string; ticket: string };
    headers: Record<string, string | undefined>;
    params: {};
    cookie: Record<string, Cookie<unknown>>;
    server: Server | null;
    set: {
      headers: HTTPHeaders;
      status?: number | keyof StatusMap;
      redirect?: string;
      cookie?: Record<string, ElysiaCookie>;
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
  readonly readyState: import("elysia/dist/ws/bun").WebSocketReadyState;
  validator?: TypeCheck<TSchema> | undefined;
  "~types"?: { validator: {} } | undefined;
  readonly id: string;
}
