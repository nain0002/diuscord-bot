# 🔧 Quick Fix: "mp is not defined" Error

## Problem

Getting error: `ReferenceError: mp is not defined`

**Real Cause:** `.env` file is in the wrong location!

---

## ✅ Solution (2 Simple Steps)

### Step 1: Copy .env File

```bash
copy C:\RAGEMP\workspace\.env C:\RAGEMP\server-files\.env
```

This copies the database configuration to where the game server can find it.

### Step 2: Start RAGE:MP Server

```bash
cd C:\RAGEMP\server-files
server.exe
```

**Done!** The server should now start without errors.

---

## 📁 Why This Fixes It

**The Problem:**
- RAGE:MP server needs `.env` file to connect to database
- `.env` was only in `workspace\` folder
- Game server couldn't find it and failed to load

**The Fix:**
- Copy `.env` to `server-files\` folder
- Now both servers have access to configuration
- Both use the same database settings

---

## 📝 Correct File Structure

```
C:\RAGEMP\
├── workspace\
│   ├── .env                    ← For admin panel
│   ├── package.json
│   └── admin-panel\
│
└── server-files\
    ├── .env                    ← For game server (COPY HERE!)
    ├── packages\rp-server\
    ├── client_packages\
    ├── conf.json
    └── server.exe
```

**Both folders need `.env` file!**

---

## 🚀 Starting Both Servers

After copying .env:

### Terminal 1: Admin Panel
```bash
cd C:\RAGEMP\workspace
npm run admin
```

### Terminal 2: RAGE:MP Server
```bash
cd C:\RAGEMP\server-files
server.exe
```

---

## ✅ Success Indicators

**Game Server Output:**
```
[Database] Connected to MySQL database successfully!
[Database] All tables created/verified successfully!
[Player] Module loaded
[Admin Bridge] Connected to admin panel!
Server Initialization Complete!
```

**No Errors!** ✅

---

## 🔍 Verify .env Contents

Make sure both .env files contain:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ragemp_server
DB_PORT=3306

SERVER_PORT=22005
MAX_PLAYERS=100

ADMIN_PORT=3000
ADMIN_WS_URL=ws://localhost:3001/gameserver
SESSION_SECRET=your-secret-key
NODE_ENV=development
```

---

## 💡 Pro Tip

If you update `.env` in workspace, remember to copy it again:

```bash
copy C:\RAGEMP\workspace\.env C:\RAGEMP\server-files\.env
```

Or edit both files to keep them in sync.

---

## 🎮 Next Steps

After both servers start:

1. **Open browser:** http://localhost:3000
2. **Login:** admin / admin123
3. **Open RAGE:MP client**
4. **Connect:** localhost:22005
5. **Register and play!**

---

**That's it! Server should be working now.** 🎉

---

*Last Updated: November 6, 2025*
