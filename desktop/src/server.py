import asyncio
import json
import websockets
from pydantic import ValidationError
from pydantic import BaseModel
from typing import Optional, Dict, Literal
from enum import Enum
from src.controller import MusicAppController


class EventMessage(BaseModel):
    event: str


class ActionEnum(str, Enum):
    play = "play"
    pause = "pause"
    forward = "forward"
    backward = "backward"
    next_track = "next track"
    previous_track = "previous track"


class TargetEnum(str, Enum):
    spotify = "spotify"
    apple_music = "apple music"
    tidal = "tidal"


class CommandData(BaseModel):
    action: ActionEnum
    target: TargetEnum


event_handlers = {}


def on(event_name):
    """Decorator to register an event handler"""

    def decorator(func):
        event_handlers[event_name] = func
        return func

    return decorator


class AppManager:
    def __init__(self):
        self.controller = {}

    def get_controller(self, target: str):
        if target not in self.controller:
            print(f"Initializing controller for {target}")
            self.controller[target] = MusicAppController(target)
        return self.controller[target]

    def execute(self, cmd: CommandData):
        ctrl = self.get_controller(cmd.target.value)
        action_map = {
            ActionEnum.play: ctrl.play_pause,
            ActionEnum.pause: ctrl.play_pause,
            ActionEnum.next_track: ctrl.next_track,
            ActionEnum.previous_track: ctrl.prev_track,
            ActionEnum.forward: ctrl.skip_forward,
            ActionEnum.backward: ctrl.skip_backward,
        }
        func = action_map.get(cmd.action)
        func = action_map.get(cmd.action)
        if func:
            success, msg = func()
            return success, msg
        return False, "Unknown action mapping"


manager = AppManager()


@on("command")
async def handle_command(data, websocket):
    try:
        cmd = CommandData(**data)
        success, message = manager.execute(cmd)
        result = {
            "status": success,
            "executed_action": cmd.action.value,
            "target": cmd.target.value,
            "message": message,
        }
        await websocket.send(json.dumps(result))
    except ValidationError as e:
        await websocket.send(
            json.dumps({"event": "error", "data": {"message": str(e)}})
        )
    except Exception as e:
        print(f"Internal Error: {e}")
        await websocket.send(
            json.dumps({"event": "error", "data": {"message": "Internal Server Error"}})
        )


@on("ping")
async def handle_ping(_, websocket):
    await websocket.send(json.dumps({"event": "pong", "data": {}}))


async def ws_client(uri):
    async with websockets.connect(uri) as websocket:
        print("Connected to server")

        while True:
            message = await websocket.recv()
            try:
                payload = json.loads(message)
                event_msg = EventMessage(**payload)
                handler = event_handlers.get(event_msg.event)
                if handler:
                    await handler(event_msg.data, websocket)
                else:
                    print("No handler for event:", event_msg.event)
            except (json.JSONDecodeError, ValidationError) as e:
                print("Invalid message:", e)


asyncio.run(ws_client("ws://localhost:8765"))
