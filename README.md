# Advanced Rage Multiplayer Server

This repository contains an **end-to-end advanced RageMP server stack** featuring:

- Account registration & secure login (server + CEF UI)
- Persistent MySQL database (phpMyAdmin friendly) with migration + default admin
- Inventory system with stacking, admin grants and in-game UI (`I` key)
- Enhanced chat logging with command filtering and admin dashboard feeds
- Real-time admin control panel (Express + Socket.IO) with live metrics
- Extensible service/repository architecture for gameplay systems

## Folder Structure

```
server/
  conf.json                     # RageMP server configuration
  package.json                  # Node dependencies for server & admin panel
  .env.example                  # Environment template
  packages/gamemode/            # Server-side scripts (events, services, etc.)
  client_packages/              # Client-side scripts & CEF UI for login/inventory
  admin-panel/public/           # Admin control panel static site
```

## Getting Started

1. Install dependencies:

   ```bash
   cd server
   npm install
   ```

2. Configure environment:

   ```bash
   cp .env.example .env
   # adjust paths/ports as needed
   ```

3. Place this `server` folder inside your RageMP `server-files` directory (or update the RageMP `packages` path accordingly).

4. Start the RageMP server (it will bootstrap the database, register events, and run the admin HTTP service automatically).

5. Access the admin panel at `http://localhost:3001` (default credentials: `admin` / `admin123`).

> **MySQL setup**
> - Create a database user with privileges on your target schema (default name `rage_server`).
> - Import `server/database.sql` through phpMyAdmin or let the server bootstrap apply it automatically.
> - Update `.env` with the same credentials the user can use from phpMyAdmin/localhost.

## Gameplay Features

- **Registration/Login**: Players receive a polished CEF portal on connect. Credentials travel securely to the server where passwords are hashed with bcrypt.
- **Inventory**: Items persist in MySQL, support stacking rules, are manageable in-game via the `I` key, and are observable live from the admin panel.
- **Chat**: Global chat is captured, filtered from commands, and mirrored into the control center for moderation.
- **Commands**:
  - `/register [username] [password]`
  - `/login [username] [password]`
  - `/inv` to inspect personal inventory in chat
  - `/giveitem [playerId] [itemCode] [quantity]` (admin only)

## Admin Control Center

- Login + session tokens persisted in SQLite and auto-cleaned
- Live player metrics, chat feed, and activity log
- Grant inventory items to any player (online or offline)
- Socket.IO pushes for chat, inventory, and session changes

## Development Notes

- Set `MP_MOCK=true` when running `node packages/gamemode/index.js` outside RageMP to leverage a lightweight mock `mp` object for local service testing.
- All services use a dependency-injected container, making it straightforward to extend gameplay systems, plug in new repositories, or expose additional admin APIs.
- MySQL credentials are pulled from `.env`; the server will auto-create the database (if permissions allow) and execute `database.sql` on startup.

## Default Admin Account

- Username: `admin`
- Password: `admin123`
- Automatically seeded during migrations (change after first login!).

Enjoy building on top of this advanced RageMP foundation! PRs and feature extensions are welcome.