# 🚀 How to Start the Server (CORRECT WAY)

## ❌ Common Mistake

**DON'T DO THIS:**
```bash
cd C:\RAGEMP\server-files
node index.js          # ❌ WRONG!
npm start              # ❌ WRONG!
```

These use Node.js, which doesn't have the `mp` global object!

---

## ✅ Correct Way

### You Need TWO Different Programs:

1. **Admin Panel** → Uses Node.js
2. **Game Server** → Uses RAGE:MP executable

---

## 📋 Step-by-Step Instructions

### Terminal 1: Start Admin Panel

```bash
cd C:\RAGEMP\workspace
npm run admin
```

**This is correct** - Admin panel uses Node.js

---

### Terminal 2: Start RAGE:MP Game Server

**Option A: Double-click**
1. Open File Explorer
2. Navigate to `C:\RAGEMP\server-files\`
3. Find `server.exe` (or `ragemp-server.exe`)
4. **Double-click it**

**Option B: Command line**
```bash
cd C:\RAGEMP\server-files
server.exe
```

**NOT** `node index.js`!  
**NOT** `npm start`!  
Just the executable: `server.exe`

---

## 🔍 Finding the RAGE:MP Executable

Look in `C:\RAGEMP\server-files\` for:
- `server.exe`
- `ragemp-server.exe`
- `rage-mp-server.exe`

It's usually 50-100 MB in size.

---

## ⚠️ Don't Have server.exe?

If you don't see any `.exe` file:

1. **Download RAGE:MP Server:**
   - Go to https://rage.mp/
   - Click "Download" → "Server Files"
   - Choose "Windows Server"
   - Download the ZIP file

2. **Extract Everything:**
   - Extract ALL files to `C:\RAGEMP\server-files\`
   - You should now have `server.exe`

3. **Add Your Code:**
   - Copy `packages\rp-server\` from workspace to server-files
   - Copy `client_packages\` from workspace to server-files
   - Copy `conf.json` from workspace to server-files
   - Copy `.env` from workspace to server-files

---

## ✅ Expected Output

### When server.exe Starts Correctly:

```
RAGE Multiplayer Server
=======================
[INFO] Starting RAGE:MP server...
[INFO] Loading packages...
[INFO] Package "rp-server" loaded successfully

=================================
RAGE:MP Roleplay Server Starting
=================================
[Database] Connected to MySQL database successfully!
[Database] All tables created/verified successfully!
[Player] Module loaded
[Registration] Module loaded
[Character] Module loaded
[Banking] Module loaded
[Inventory] Module loaded
[Shops] Module loaded
[Jobs] Module loaded
[Vehicles] Module loaded
[Admin] Module loaded
[Spawn] Module loaded
[Admin Bridge] Module loaded
[Admin Bridge] Connected to admin panel!
=================================
Server Initialization Complete!
=================================
```

**No "mp is not defined" error!**

---

## 🎯 Verify You're Doing It Right

### ❌ You're Doing It WRONG If:
- Command prompt title says "Node.js"
- You typed `node` before the command
- Error says "mp is not defined"
- You used `npm start` in server-files folder

### ✅ You're Doing It RIGHT If:
- You ran `server.exe` or double-clicked it
- Output shows "RAGE Multiplayer Server"
- Output shows "Loading packages"
- All modules load successfully

---

## 📁 Folder Structure Check

Before starting, verify:

```
C:\RAGEMP\server-files\
├── server.exe              ← Must exist! (RAGE:MP executable)
├── .env                    ← Database config
├── conf.json               ← RAGE:MP config
├── packages\
│   └── rp-server\          ← Your game code
│       ├── index.js
│       └── modules\
└── client_packages\        ← Your client code
    ├── index.js
    ├── modules\
    └── CEF\
```

---

## 🔧 Pre-Flight Checklist

Before starting server.exe:

- [ ] MySQL is running
- [ ] Database `ragemp_server` created
- [ ] `.env` file copied to server-files
- [ ] server.exe exists
- [ ] packages\rp-server\ exists
- [ ] client_packages\ exists
- [ ] conf.json configured

---

## 🚀 Complete Startup Sequence

### 1. Start MySQL
```bash
# Windows: Start MySQL service
net start MySQL
```

### 2. Start Admin Panel
```bash
cd C:\RAGEMP\workspace
npm run admin
```
**Wait for:** "Admin Panel running on http://localhost:3000"

### 3. Start RAGE:MP Server
```bash
cd C:\RAGEMP\server-files
server.exe
```
**Wait for:** "Server Initialization Complete!"

### 4. Connect with Client
```bash
# Open RAGE:MP Client
# Press F8
connect localhost:22005
```

---

## 💡 Understanding the Difference

### Admin Panel (Node.js):
- **What:** Web-based management interface
- **Location:** `workspace\`
- **Start:** `npm run admin`
- **Uses:** Express, Socket.IO, HTTP
- **Port:** 3000
- **Has:** Database access, no `mp` object

### Game Server (RAGE:MP):
- **What:** Multiplayer game server
- **Location:** `server-files\`
- **Start:** `server.exe`
- **Uses:** RAGE:MP engine, Node.js modules
- **Port:** 22005 (default)
- **Has:** `mp` global object, game functions

**Both are needed, but they're completely different!**

---

## 🎮 After Both Start

1. **Admin Panel:** http://localhost:3000
   - Login: admin / admin123
   - See dashboard, manage server

2. **Game Server:** Running in terminal
   - Accepts player connections
   - Port 22005

3. **Connect & Play:**
   - Open RAGE:MP client
   - Connect to localhost:22005
   - Register and create character
   - Press I for inventory!

---

## 🔍 Troubleshooting

### Problem: "server.exe not found"
**Solution:** Download RAGE:MP server from https://rage.mp/

### Problem: "mp is not defined"
**Solution:** You're using Node.js instead of server.exe

### Problem: "Port 22005 already in use"
**Solution:** 
- Close other RAGE:MP servers
- Or change port in conf.json

### Problem: "MySQL connection failed"
**Solution:**
- Start MySQL service
- Check .env file credentials
- Create database: `CREATE DATABASE ragemp_server;`

### Problem: "Package not found"
**Solution:**
- Make sure packages\rp-server\ exists in server-files
- Copy from workspace if missing

---

## 📊 Quick Reference

| Component | Location | Command | Port |
|-----------|----------|---------|------|
| Admin Panel | workspace | `npm run admin` | 3000 |
| Game Server | server-files | `server.exe` | 22005 |
| WebSocket Bridge | (auto) | (auto-starts) | 3001 |
| MySQL | - | (must be running) | 3306 |

---

## ✅ Success Checklist

When everything is working:

- [ ] Admin panel loads at http://localhost:3000
- [ ] No errors in admin panel console
- [ ] Game server shows "Initialization Complete"
- [ ] No "mp is not defined" error
- [ ] Can connect with RAGE:MP client
- [ ] Registration works
- [ ] Character creation works
- [ ] Inventory opens with I key

---

**Remember: Use server.exe, NOT node or npm!** 🚀

---

*Last Updated: November 6, 2025*
