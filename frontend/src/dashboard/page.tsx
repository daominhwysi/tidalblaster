import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../auth/context/AuthContext";
import * as api from "@/api/index";
import { Play, SkipBack, SkipForward } from "lucide-react";

interface Player {
  clientId: string;
}

type WSEvent = "SYNC_PLAYERS" | "PLAYER_CONNECTED" | "PLAYER_DISCONNECTED";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [players, setPlayers] = useState<string[]>([]); // Storing Client IDs
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [appTarget, setAppTarget] = useState<string>("spotify");
  const ws = useRef<WebSocket | null>(null);

  // 1. Initialize WebSocket
  useEffect(() => {
    const connectWs = async () => {
      try {
        const { data } = await api.getTicket();
        // Construct WS URL (assuming backend is on port 3000)
        const wsUrl = `${import.meta.env.VITE_BASE_API_URL.replace(
          "http",
          "ws"
        )}/ws/?ticket=${data.ticketId}&role=user`;

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => console.log("Connected to Control Server");

        ws.current.onmessage = (event) => {
          const message = JSON.parse(event.data);
          handleWsMessage(message);
        };

        ws.current.onclose = () => console.log("Disconnected");
      } catch (e) {
        console.error("Failed to connect WS", e);
      }
    };

    if (user) connectWs();

    return () => {
      ws.current?.close();
    };
  }, [user]);

  // 2. Handle Incoming Events
  const handleWsMessage = (msg: { event: WSEvent; data: any }) => {
    switch (msg.event) {
      case "SYNC_PLAYERS":
        // Redis returns list of strings (clientIds)
        setPlayers(msg.data.players);
        if (msg.data.players.length > 0) setSelectedPlayer(msg.data.players[0]);
        break;
      case "PLAYER_CONNECTED":
        setPlayers((prev) => [...prev, msg.data.clientId]);
        if (!selectedPlayer) setSelectedPlayer(msg.data.clientId);
        break;
      case "PLAYER_DISCONNECTED":
        setPlayers((prev) => prev.filter((id) => id !== msg.data.clientId));
        break;
    }
  };

  // 3. Send Commands
  const sendCommand = (action: "PLAY" | "PREVIOUS_TRACK" | "NEXT_TRACK") => {
    if (!ws.current || !selectedPlayer) return;

    ws.current.send(
      JSON.stringify({
        event: "SONG_CONTROL",
        data: {
          targetPlayer: selectedPlayer,
          appTarget: appTarget,
          actionType: action,
        },
      })
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-brand text-3xl font-serif">Control Center</h1>
          <div className="flex items-center gap-4">
            <span className="text-brand/80">Hi, {user?.username}</span>
            <Button
              onClick={() => logout()}
              variant="outline"
              className="text-brand border-brand/20"
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl space-y-6">
          {/* Device Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand/60">
              Target Device
            </label>
            <select
              className="w-full p-3 rounded-lg border border-brand/10 bg-brand-bg/5 text-brand"
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
            >
              {players.length === 0 && (
                <option value="">No active players found</option>
              )}
              {players.map((p) => (
                <option key={p} value={p}>
                  Desktop Client ({p.slice(0, 8)})
                </option>
              ))}
            </select>
          </div>

          {/* App Selector */}
          <div className="flex gap-4 justify-center">
            {["spotify", "tidal", "apple music"].map((app) => (
              <button
                key={app}
                onClick={() => setAppTarget(app)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  appTarget === app
                    ? "bg-brand text-white"
                    : "bg-brand/5 text-brand hover:bg-brand/10"
                }`}
              >
                {app.charAt(0).toUpperCase() + app.slice(1)}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-6 py-4">
            <Button
              onClick={() => sendCommand("PREVIOUS_TRACK")}
              className="h-12 w-12 rounded-full p-0 bg-brand/10 hover:bg-brand/20 text-brand"
            >
              <SkipBack />
            </Button>

            <Button
              onClick={() => sendCommand("PLAY")}
              className="h-16 w-16 rounded-full p-0 bg-brand hover:bg-brand/90 text-white text-2xl shadow-lg hover:scale-105 transition-transform"
            >
              <Play />
            </Button>

            <Button
              onClick={() => sendCommand("NEXT_TRACK")}
              className="h-12 w-12 rounded-full p-0 bg-brand/10 hover:bg-brand/20 text-brand"
            >
              <SkipForward />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
