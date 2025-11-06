# 🚀 RAGE:MP Server Installation Guide

**IMPORTANT:** This guide shows the correct way to install the server with proper file structure.

---

## ⚠️ Common Error: "mp is not defined"

If you see this error, it means files are in the wrong location!

**Why it happens:**
- RAGE:MP has a specific folder structure
- Some files belong IN the RAGE:MP server
- Some files belong OUTSIDE (for Node.js/admin panel)

---

## 📁 Correct File Structure

You need **TWO separate locations**:

### 1. RAGE:MP Server (Game Server)
```
C:\RAGEMP\server-files\              ← RAGE:MP installation
├── packages\
│   └── rp-server\                   ← Game server code (from workspace)
│       ├── index.js
│       └── modules\
│           ├── database.js
│           ├── player.js
│           ├── registration.js
│           ├── character.js
│           ├── banking.js
│           ├── inventory.js
│           ├── shops.js
│           ├── jobs.js
│           ├── vehicles.js
│           ├── admin.js
│           ├── spawn.js
│           └── admin-bridge.js
├── client_packages\                 ← Game client code (from workspace)
│   ├── index.js
│   ├── modules\
│   │   ├── auth.js
│   │   ├── hud.js
│   │   ├── banking.js
│   │   ├── inventory.js
│   │   ├── shops.js
│   │   ├── jobs.js
│   │   ├── vehicles.js
│   │   ├── animations.js
│   │   ├── markers.js
│   │   └── interactions.js
│   └── CEF\
│       ├── *.html files
│       ├── css\
│       └── js\
├── conf.json                        ← RAGE:MP config (already exists)
└── server.exe                       ← RAGE:MP executable (already exists)
```

### 2. Workspace (Node.js Dependencies & Admin Panel)
```
C:\RAGEMP\workspace\                 ← NEW folder for Node.js stuff
├── package.json                     ← Node.js dependencies
├── .env                             ← Database config
├── .env.example
├── database.sql                     ← Database schema
├── node_modules\                    ← Created by npm install
├── admin-panel\                     ← Web admin panel
│   ├── server.js
│   ├── routes\
│   ├── middleware\
│   ├── public\
│   └── websocket-bridge.js
└── *.md files                       ← Documentation
```

---

## 🔧 Installation Steps

### Prerequisites

1. **Download RAGE:MP Server:**
   - Go to https://rage.mp/
   - Download server files
   - Extract to `C:\RAGEMP\server-files\`

2. **Install Node.js:**
   - Download from https://nodejs.org (LTS version)
   - Install with default options
   - Verify: `node --version` and `npm --version`

3. **Install MySQL:**
   - Download from https://dev.mysql.com/downloads/mysql/
   - Install and remember your root password
   - Start MySQL service

---

### Step 1: Setup Workspace Folder

```bash
# Create workspace directory
mkdir C:\RAGEMP\workspace
cd C:\RAGEMP\workspace
```

---

### Step 2: Copy Workspace Files

Copy these files from `/workspace` to `C:\RAGEMP\workspace\`:

**Files to copy:**
- ✅ `package.json`
- ✅ `.env.example`
- ✅ `database.sql`
- ✅ `admin-panel\` (entire folder)
- ✅ All `*.md` documentation files

**DO NOT COPY to workspace:**
- ❌ `packages\` folder
- ❌ `client_packages\` folder
- ❌ `conf.json`

---

### Step 3: Copy Game Files to RAGE:MP

Copy these to your RAGE:MP installation:

#### A. Server-Side Code
```bash
# Copy from workspace to RAGE:MP
Copy: /workspace/packages/rp-server
To:   C:\RAGEMP\server-files\packages\rp-server
```

#### B. Client-Side Code
```bash
# Copy from workspace to RAGE:MP
Copy: /workspace/client_packages
To:   C:\RAGEMP\server-files\client_packages
```

#### C. Server Config
```bash
# Copy from workspace to RAGE:MP root
Copy: /workspace/conf.json
To:   C:\RAGEMP\server-files\conf.json
```

---

### Step 4: Configure Environment

```bash
cd C:\RAGEMP\workspace

# Copy example env file
copy .env.example .env

# Edit with your settings
notepad .env
```

**Update these values:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=ragemp_server
DB_PORT=3306

ADMIN_PORT=3000
ADMIN_WS_URL=ws://localhost:3001/gameserver
SESSION_SECRET=change-this-to-random-string
```

---

### Step 5: Setup Database

```bash
# Open MySQL command line
mysql -u root -p

# Create database
CREATE DATABASE ragemp_server;
exit;

# Import schema (optional - auto-created by server)
mysql -u root -p ragemp_server < database.sql
```

---

### Step 6: Install Node.js Dependencies

```bash
cd C:\RAGEMP\workspace
npm install
```

**Wait for installation to complete.** You should see:
```
added XXX packages from XXX contributors
audited XXX packages in X.XXs
```

---

### Step 7: Start Servers

**Terminal 1 - Admin Panel:**
```bash
cd C:\RAGEMP\workspace
npm run admin
```

Expected output:
```
[Database] Connected to MySQL database successfully!
[Admin Panel] Database connected
[Admin Panel] Admins table ready
Admin Panel running on http://localhost:3000
Default login: admin / admin123
```

**Terminal 2 - RAGE:MP Game Server:**
```bash
cd C:\RAGEMP\server-files
server.exe
```

Expected output:
```
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
Server Initialization Complete!
```

---

## 🎮 Testing

### 1. Test Admin Panel
- Open browser: http://localhost:3000
- Login: `admin` / `admin123`
- You should see the modern dashboard

### 2. Test Game Server
- Open RAGE:MP client
- Connect to: `localhost:22005`
- Register a new account
- Create a character
- Test features (shops, jobs, inventory)

---

## 🔍 Troubleshooting

### Error: "mp is not defined"

**Cause:** Files are in wrong location

**Fix:**
1. Check that `packages\rp-server\` is in RAGE:MP folder
2. Check that `package.json` is NOT in RAGE:MP folder
3. Follow the file structure above exactly

---

### Error: "Cannot find module 'dotenv'"

**Cause:** Dependencies not installed

**Fix:**
```bash
cd C:\RAGEMP\workspace
npm install
```

---

### Error: "MySQL connection failed"

**Cause:** Database not configured correctly

**Fix:**
1. Check MySQL is running
2. Verify credentials in `.env`
3. Create database: `CREATE DATABASE ragemp_server;`
4. Test connection: `mysql -u root -p`

---

### Error: "Port 3000 already in use"

**Cause:** Another app using port 3000

**Fix:**
Change port in `.env`:
```env
ADMIN_PORT=3001
```

---

### Error: "bcrypt install failed"

**Cause:** Missing build tools

**Fix:**
```bash
npm install --global windows-build-tools
npm install
```

---

## 📊 Final Folder Structure

After correct installation:

```
C:\RAGEMP\
├── workspace\                       ← Node.js & Admin Panel
│   ├── package.json
│   ├── .env
│   ├── node_modules\
│   └── admin-panel\
│
└── server-files\                    ← RAGE:MP Game Server
    ├── packages\rp-server\
    ├── client_packages\
    ├── conf.json
    └── server.exe
```

**Two separate folders!**

---

## ✅ Verification Checklist

Before starting, verify:

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MySQL running and accessible
- [ ] Workspace folder created at `C:\RAGEMP\workspace\`
- [ ] `package.json` is in workspace (NOT in RAGE:MP folder)
- [ ] `.env` file configured with correct MySQL password
- [ ] `packages\rp-server\` copied to RAGE:MP server
- [ ] `client_packages\` copied to RAGE:MP server
- [ ] `npm install` completed successfully in workspace
- [ ] Database `ragemp_server` created

---

## 🚀 Quick Start Commands

```bash
# Install dependencies (once)
cd C:\RAGEMP\workspace
npm install

# Start admin panel (terminal 1)
cd C:\RAGEMP\workspace
npm run admin

# Start game server (terminal 2)
cd C:\RAGEMP\server-files
server.exe
```

---

## 📚 Additional Resources

- **Setup Guide:** See `SETUP_GUIDE.md`
- **Database Info:** See `DATABASE_FIXED.md`
- **Admin Panel:** See `MODERN_ADMIN_PANEL_GUIDE.md`
- **Inventory System:** See `INVENTORY_SYSTEM_COMPLETE.md`

---

## 🎉 Success!

If everything is setup correctly, you should have:

✅ RAGE:MP game server running  
✅ Admin panel accessible at http://localhost:3000  
✅ Database connected and tables created  
✅ All features working (registration, inventory, shops, jobs, etc.)

**Enjoy your RAGE:MP roleplay server!** 🚀

---

*Last Updated: November 6, 2025*
