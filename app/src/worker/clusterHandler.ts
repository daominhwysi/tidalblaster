import { redis_client } from "../lib/redis";
import { connectedClients } from "../route/ws/playerHandler";

export class ClusterHandler {
  private subClient: typeof redis_client;
  private channel = "SERVER_COMMANDS";

  constructor() {
    this.subClient = redis_client.duplicate();
  }

  public async start() {
    console.log("Cluster Listener started...");

    await this.subClient.subscribe(this.channel);

    this.subClient.on("message", (channel, message) => {
      if (channel === this.channel) {
        this.handleMessage(message);
      }
    });
  }

  private handleMessage(rawMessage: string) {
    try {
      const command = JSON.parse(rawMessage);

      if (command.type === "KICK_CLIENT") {
        const clientId = command.clientId;

        const clientWS = connectedClients.get(clientId);

        if (clientWS) {
          console.log(`🎯 [Cluster Action] Kicking local client: ${clientId}`);

          clientWS.send(
            JSON.stringify({
              event: "FORCE_DISCONNECT",
              data: "You have been kicked remotely.",
            })
          );

          clientWS.close();
          connectedClients.delete(clientId);
        }
      }
    } catch (e) {
      console.error("Error parsing cluster message", e);
    }
  }
}
