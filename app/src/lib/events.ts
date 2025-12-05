export enum WSEvent {
  SYNC_PLAYERS = "SYNC_PLAYERS",
  PLAYER_CONNECTED = "PLAYER_CONNECTED",
  PLAYER_DISCONNECTED = "PLAYER_DISCONNECTED",
  SONG_CONTROL = "SONG_CONTROL",

  ERROR = "ERROR",
  PING = "PING",
  PONG = "PONG",
}

export type WSMessage<T = any> = {
  event: WSEvent;
  data: T;
};
export const SERVER_TOPIC = "server_commands";
export type KickMessage = {
  type: "KICK_CLIENT";
  clientId: string;
};
