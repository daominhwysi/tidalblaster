import typer
import keyring
import httpx
from src.client import ws_client
import asyncio

app = typer.Typer()

PASSWORD_SERVICE = "my_twinky_sissy_cli_app"
BASE_URL = "http://localhost:3000"
BASE_WS_URL = "ws://localhost:3000"


@app.command()
def signup(username: str, name: str, password: str):
    try:
        with httpx.Client() as client:
            r = client.post(
                url=BASE_URL + "/auth/register",
                json={"username": username, "password": password, "name": name},
            )
        if r.is_success:
            typer.echo("Signup successful")
        else:
            typer.echo(f"Signup failed: {r.text}")
    except Exception as e:
        typer.echo(f"Error: {e}")


@app.command()
def login(username: str, password: str):
    try:
        with httpx.Client() as client:
            r = client.post(
                url=BASE_URL + "/auth/login",
                json={"username": username, "password": password},
            )
        if not r.is_success:
            typer.echo(f"Login failed: {r.text}")
            return

        access_token = r.json().get("access_token")
        if not access_token:
            typer.echo("Login failed: no token returned")
            return

        keyring.set_password(PASSWORD_SERVICE, "access_token", access_token)
        typer.echo("Logged in")
    except Exception as e:
        typer.echo(f"Error: {e}")


@app.command()
def logout():
    try:
        keyring.delete_password(PASSWORD_SERVICE, "access_token")
        typer.echo("Logged out")
    except Exception as e:
        typer.echo(f"Error: {e}")


def get_user():
    access_token = keyring.get_password(PASSWORD_SERVICE, "access_token")
    if access_token:
        return access_token
    else:
        raise Exception("No user token found")


@app.command()
def status():
    user = keyring.get_password(PASSWORD_SERVICE, "token")
    typer.echo("Logged in" if user else "Not logged in")


@app.command()
def run():
    token = keyring.get_password(PASSWORD_SERVICE, "access_token")
    if token:
        with httpx.Client() as client:
            header = {"Authorization": f"Bearer {token}"}
            r = client.get(
                url=BASE_URL + "/auth/ticket",
                headers=header,
            )
            ticketId = r.json()["ticketId"]
            ws_url = BASE_WS_URL + f"/ws/?ticket={ticketId}&role=music_player"
            asyncio.run(ws_client(ws_url))

    else:
        typer.echo("Not logged in. Please log in first.")


if __name__ == "__main__":
    app()
