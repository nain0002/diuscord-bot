# ❌ CRITICAL ERROR: `mp is not defined`

## 🔴 The Problem

You're getting this error:
```
ReferenceError: mp is not defined
[WARN] RAGE:MP 'mp' global not available after timeout
```

**This means:** The RAGE:MP server is NOT running properly. The `mp` global object is only available when code is executed BY the RAGE:MP server executable, not by Node.js directly.

## ⚠️ CRITICAL: What You're Doing Wrong

Based on your error, you are likely doing ONE of these:

### ❌ WRONG - Running with Node.js:
```bash
# DON'T DO THIS:
cd C:\RAGEMP\server-files
node packages/rp-server/index.js        # ❌ WRONG!
npm start                                # ❌ WRONG!
```

### ✅ CORRECT - Running with RAGE:MP Executable:
```bash
# DO THIS:
cd C:\RAGEMP\server-files
server.exe                               # ✅ CORRECT!
# OR
ragemp-server.exe                        # ✅ CORRECT!
```

---

## 🔧 SOLUTION: How to Fix This NOW

### Step 1: Verify Your Server Files

Check if you have these files in `C:\RAGEMP\server-files\`:

```
C:\RAGEMP\server-files\
├── server.exe          ← YOU NEED THIS FILE!
├── conf.json           ← Server config
├── packages\           ← Your game server code
│   └── rp-server\
└── client_packages\    ← Your client code
```

### Step 2: Check if server.exe Exists

Open Command Prompt and run:
```bash
cd C:\RAGEMP\server-files
dir server.exe
```

**If you see "File Not Found"**, you don't have the RAGE:MP server!

---

## 🚨 DO YOU HAVE RAGE:MP SERVER?

If `server.exe` is missing, you need to download it:

### Option A: Download RAGE:MP Server (Recommended)

1. Go to: https://rage.mp/
2. Click "Downloads"
3. Download "Server Package for Windows"
4. Extract to `C:\RAGEMP\server-files\`

### Option B: Use Official Server Files

```bash
# Create a proper server directory
mkdir C:\RAGEMP\official-server
cd C:\RAGEMP\official-server

# Download from rage.mp
# Extract server files here
# You should see server.exe after extraction
```

---

## ✅ CORRECT STARTUP PROCEDURE

### Terminal 1: Admin Panel (Optional)
```bash
cd C:\RAGEMP\workspace
npm run admin
```

### Terminal 2: RAGE:MP Game Server (REQUIRED)
```bash
cd C:\RAGEMP\server-files
server.exe
```

**IMPORTANT:** You MUST use `server.exe`, NOT `node` or `npm`!

---

## 🔍 Why This Happens

The RAGE:MP server works like this:

```
server.exe (RAGE:MP)
    ↓ provides 'mp' global
    ↓ then loads
    ↓
packages/rp-server/index.js
    ↓ now 'mp' is available
    ↓ loads modules that use 'mp'
    ↓
player.js, character.js, etc.
```

When you run with Node.js directly:
```
node index.js (Regular Node.js)
    ↓ NO 'mp' global!
    ↓ tries to load
    ↓
player.js → ERROR: mp is not defined ❌
```

---

## 🛠️ IMMEDIATE FIX

### 1. Find your RAGE:MP server executable

```bash
# Windows - Search for server.exe
dir /s C:\RAGEMP\server.exe
```

### 2. Navigate to that directory

```bash
cd C:\RAGEMP\server-files
# (or wherever server.exe is located)
```

### 3. Run ONLY the server.exe

```bash
server.exe
```

**DO NOT RUN:**
- ❌ `node index.js`
- ❌ `node packages/rp-server/index.js`
- ❌ `npm start` (in server-files folder)
- ❌ `npm run dev`

**ONLY RUN:**
- ✅ `server.exe`
- ✅ `ragemp-server.exe`
- ✅ Double-click `server.exe` in Windows Explorer

---

## 📁 Correct File Structure

```
C:\RAGEMP\
├── workspace\              ← Node.js workspace (admin panel)
│   ├── package.json
│   ├── .env
│   ├── node_modules\
│   └── admin-panel\
│
└── server-files\           ← RAGE:MP server directory
    ├── server.exe          ← MUST HAVE THIS!
    ├── conf.json
    ├── .env               ← Copy .env here too
    ├── packages\
    │   └── rp-server\
    │       ├── index.js
    │       └── modules\
    └── client_packages\
```

---

## 🎯 What to Run and Where

### Admin Panel (Node.js):
```bash
Location: C:\RAGEMP\workspace
Command:  npm run admin
Purpose:  Web admin panel
Port:     3000
```

### Game Server (RAGE:MP):
```bash
Location: C:\RAGEMP\server-files
Command:  server.exe
Purpose:  Game server
Port:     22005 (default)
```

---

## ✅ Verification Checklist

Before starting, verify:

- [ ] `server.exe` exists in server-files directory
- [ ] `conf.json` exists with `"enable-nodejs": true`
- [ ] `.env` file is in server-files directory
- [ ] packages/rp-server/ folder exists
- [ ] client_packages/ folder exists
- [ ] You're running `server.exe`, NOT `node`

---

## 🚀 CORRECT START SEQUENCE

### Step 1: Start MySQL
Make sure MySQL is running on your system.

### Step 2: Start Admin Panel (Optional)
```bash
cd C:\RAGEMP\workspace
npm run admin
```
Wait for: "Admin panel running on http://localhost:3000"

### Step 3: Start RAGE:MP Server (Required)
```bash
cd C:\RAGEMP\server-files
server.exe
```

**Look for these messages:**
```
[Database] Connected to MySQL database successfully!
[Database] All tables created/verified successfully!
[Player] Module loaded
[Character] Module loaded
[Banking] Module loaded
... (all modules load)
Server Initialization Complete!
```

**If you see:**
```
[WARN] RAGE:MP 'mp' global not available after timeout
```
**Then you're NOT running server.exe correctly!**

---

## 🆘 Still Not Working?

### Check 1: Is server.exe actually running?

Open Task Manager (Ctrl+Shift+Esc) and look for:
- `server.exe` or `ragemp-server.exe`

If you don't see it, the RAGE:MP server is not running.

### Check 2: Check your conf.json

Open `C:\RAGEMP\server-files\conf.json` and verify:
```json
{
  "enable-nodejs": true,   ← MUST BE TRUE!
  "port": 22005,
  "name": "RAGE:MP Roleplay Server"
}
```

### Check 3: Re-download RAGE:MP Server

If `server.exe` is missing or corrupted:
1. Download fresh server files from https://rage.mp/
2. Extract to a clean directory
3. Copy your packages/ and client_packages/ folders
4. Copy your .env file
5. Run server.exe

---

## 📞 Summary

**The Issue:** You're trying to run RAGE:MP server code with Node.js, but RAGE:MP code needs the RAGE:MP executable.

**The Fix:** 
1. Make sure `server.exe` exists in `C:\RAGEMP\server-files\`
2. Navigate to that directory: `cd C:\RAGEMP\server-files`
3. Run ONLY: `server.exe`
4. DO NOT use `node` or `npm start`

**Key Point:** The `mp` global object is only available when your code is executed BY the RAGE:MP server, not by Node.js.

---

*This is the most common error for RAGE:MP servers. The fix is simple: use the correct executable!*
