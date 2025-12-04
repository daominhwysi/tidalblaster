import { Server } from "elysia/dist/universal/server";
import { redis_client } from "../lib/redis";
import { WSEvent } from "../lib/events";
const HEARTBEAT_TIMEOUT = 60_000;
const CHECK_INTERVAL = 10_000;
export class ZombieHandler {
  private server: Server;
  private timer: Timer | null = null;

  constructor(server: Server) {
    this.server = server;
  }
  public start() {
    console.log("Zombie Eliminator started...");
    this.timer = setInterval(() => this.cleanup(), CHECK_INTERVAL);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log("Zombie Eliminator stopped.");
    }
  }
  private async cleanup() {
    try {
      const userIds = await redis_client.smembers("active_user_ids");
      const now = Date.now();
      const deathThreshold = now - HEARTBEAT_TIMEOUT;
      for (const userId of userIds) {
        const key = `active_players:${userId}`;

        // 2. Find players with score (timestamp) < threshold
        // ZRANGEBYSCORE key -inf (now - timeout)
        const deadClientIds = await redis_client.zrangebyscore(
          key,
          "-inf",
          deathThreshold
        );

        if (deadClientIds.length > 0) {
          console.log(
            `Found ${deadClientIds.length} zombies for user ${userId}`
          );

          // Remove them from Redis
          await redis_client.zremrangebyscore(key, "-inf", deathThreshold);

          // Notify remaining clients on the specific user topic
          const userTopic = `user:${userId}`;

          for (const clientId of deadClientIds) {
            this.server.publish(
              userTopic,
              JSON.stringify({
                event: WSEvent.PLAYER_DISCONNECTED,
                data: { clientId },
              })
            );
          }
        }

        // If no players left for this user, remove user from active_user_ids set
        const remainingPlayers = await redis_client.zcard(key);
        if (remainingPlayers === 0) {
          await redis_client.srem("active_user_ids", userId);
        }
      }
    } catch (error) {
      console.log("Error", error);
    }
  }
}
