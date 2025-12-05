import { redis_client } from "../lib/redis";
import { WSEvent } from "../lib/events";
import { Server } from "elysia/dist/universal/server";

const HEARTBEAT_TIMEOUT = 30000;
const CHECK_INTERVAL = 10000;

export class ZombieHandler {
  private server: Server;
  private timer: Timer | null = null;

  constructor(server: Server) {
    this.server = server;
  }

  public start() {
    console.log("🧟 Zombie Worker started...");
    this.timer = setInterval(() => this.cleanup(), CHECK_INTERVAL);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async cleanup() {
    try {
      const userIds = await redis_client.smembers("active_user_ids");
      const now = Date.now();
      const deathThreshold = now - HEARTBEAT_TIMEOUT;

      for (const userId of userIds) {
        const key = `active_players:${userId}`;

        // 1. Identify who the Zombies are
        const deadClientIds = await redis_client.zrangebyscore(
          key,
          "-inf",
          deathThreshold
        );

        if (deadClientIds.length > 0) {
          console.log(
            `🧟 Cleaning up ${deadClientIds.length} zombies for user ${userId}`
          );

          // 2. Remove them from Redis (Database cleanup)
          await redis_client.zremrangebyscore(key, "-inf", deathThreshold);

          const userTopic = `user:${userId}`;

          for (const clientId of deadClientIds) {
            // 3. Notify Frontend (UI Update)
            this.server.publish(
              userTopic,
              JSON.stringify({
                event: WSEvent.PLAYER_DISCONNECTED,
                data: { clientId },
              })
            );

            // Broadcast to Cluster to kill the Physical Socket
            await redis_client.publish(
              "SERVER_COMMANDS",
              JSON.stringify({
                type: "KICK_CLIENT",
                clientId: clientId,
                reason: "Zombie Timeout",
              })
            );
          }
        }

        const remainingPlayers = await redis_client.zcard(key);
        if (remainingPlayers === 0) {
          await redis_client.srem("active_user_ids", userId);
        }
      }
    } catch (error) {
      console.error("Error in ZombieHandler:", error);
    }
  }
}
