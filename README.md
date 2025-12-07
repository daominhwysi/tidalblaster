
# TidalBlaster 

> _Uncle Kien nguyen told me to do this to save his lazyass feet from being frozen by hanoi winter btw._

[![TypeScript](https://img.shields.io/badge/typescript-93.1%25-blue?logo=typescript)](https://github.com/daominhwysi/tidalblaster)
[![Python](https://img.shields.io/badge/python-4.5%25-yellow?logo=python)](https://github.com/daominhwysi/tidalblaster)
[![Bun](https://img.shields.io/badge/Bun-Runtime-black?logo=bun)](https://bun.sh)
[![Platform](https://img.shields.io/badge/platform-Windows-blue?logo=windows)](https://www.microsoft.com/windows)
[![License](https://img.shields.io/github/license/daominhwysi/tidalblaster?color=success)](LICENSE)

## Overview

**TidalBlaster** is a remote control infrastructure for your PC's music applications. It allows you to control media playback on your desktop computer (Windows) from any device with a web browser (like your phone lying next to you in bed).

Unlike standard "Connect" features, this works by simulating native keyboard media events on the host machine, making it compatible with **Spotify**, **Tidal**, and **Apple Music** desktop apps.

## 🏗 Architecture

1.  **Frontend (Web)**: A React/Vite dashboard where users issue commands (Play, Pause, Next).
2.  **Backend (Elysia/Bun)**: Handles authentication, WebSocket connections, and routes commands via Redis Pub/Sub. It includes a "Zombie Handler" to clean up stale connections.
3.  **Desktop Client (Python)**: A lightweight CLI tool running on the Windows host. It maintains a WebSocket connection to the backend and uses `pywin32`/`pywinauto` to send keystrokes to specific music applications.

##  Features

- ⏯ **Real-time Control**: Play, Pause, Next Track, Previous Track.
- 🔄 **Multi-Client Sync**: See active desktop players immediately on the web interface.
- 🎹 **Native Integration**: Works by sending native keyboard shortcuts to specific window processes.
- 🔐 **Secure**: JWT Authentication and Ticket-based WebSocket upgrading.

## 🛠 Tech Stack

**Backend**
- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [ElysiaJS](https://elysiajs.com)
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache/PubSub**: Redis (ioredis)

**Frontend**
- **Framework**: React + Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **State**: React Context API

**Desktop Client**
- **Language**: Python
- **Libraries**: `typer` (CLI), `websockets`, `pywin32`, `pywinauto` (Automation)

## 🚀 Getting Started

### Prerequisites
- **Node.js** & **Bun** installed.
- **Python 3.10+**.
- **PostgreSQL** database running.
- **Redis** server running.
- **Windows OS** (required for the desktop client).

### 1. Backend Setup (`app/`)

```bash
cd app

# Install dependencies
bun install

# Configure Environment
# Create a .env file and add:
# DATABASE_URL="postgresql://user:password@localhost:5432/tidalblaster"
# REDIS_URL="redis://localhost:6379"
# JWT_SECRET="your-secret-key"

# Run Migrations
bun run prisma migrate dev --name init

# Start Server
bun run dev
```

### 2. Frontend Setup (`frontend/`)

```bash
cd frontend

# Install dependencies
npm install

# Configure Environment
# Create a .env file and add:
# VITE_BASE_API_URL="http://localhost:3000"

# Start Web Server
npm run dev
```

### 3. Desktop Client Setup (`desktop/`)

*Note: Must be run on the Windows machine where the music is playing.*

```bash
cd desktop

# Install dependencies
pip install -r requirements.txt

# Usage via CLI
# 1. Register a user (if you haven't via web)
python src/app.py signup "username" "Name" "password"

# 2. Login to cache the token
python src/app.py login "username" "password"

# 3. Start the listener
python src/app.py run
```

## 🎮 Usage Guide

1.  **Start the Music App**: Open Spotify, Tidal, or Apple Music on your Windows PC.
2.  **Run Desktop Client**: Execute `python src/app.py run` in your terminal. You should see "Connected to server".
3.  **Open Web Dashboard**: Navigate to your frontend URL (e.g., `http://localhost:5173`) on your phone or laptop.
4.  **Login**: Use the same credentials.
5.  **Control**:
    - Select your Desktop Client ID from the dropdown.
    - Select the target app (e.g., "Spotify").
    - Hit the Big Play Button!

