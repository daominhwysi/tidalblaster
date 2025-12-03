export enum WSEvent {
  JOIN_ROOM = "JOIN_ROOM",
  PLAY_MUSIC = "PLAY_MUSIC",

  SYNC_PLAYERS = "SYNC_PLAYERS",
  PLAYER_CONNECTED = "PLAYER_CONNECTED",
  PLAYER_DISCONNECTED = "PLAYER_DISCONNECTED",
  ERROR = "ERROR",
  PING = "PING",
  PONG = "PONG",
}

export type WSMessage<T = any> = {
  event: WSEvent;
  data: T;
};
