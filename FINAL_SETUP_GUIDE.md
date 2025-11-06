# 🚀 FINAL COMPLETE SETUP GUIDE

## Follow These Steps Exactly

---

## ✅ STEP 1: Verify You Have RAGE:MP Server

Check if you have the server executable:

```bash
cd C:\RAGEMP\server-files
dir ragemp-server.exe
```

**If NOT found:**
1. Download from: https://rage.mp/
2. Click "Downloads" → "Server Package for Windows"
3. Extract ALL files to `C:\RAGEMP\server-files\`

---

## ✅ STEP 2: Copy All Files to Correct Locations

Run these commands in Command Prompt:

```bash
# Create directories if they don't exist
mkdir C:\RAGEMP\server-files\packages\rp-server
mkdir C:\RAGEMP\server-files\client_packages

# Copy server code
xcopy C:\RAGEMP\workspace\packages C:\RAGEMP\server-files\packages /E /I /Y

# Copy client code
xcopy C:\RAGEMP\workspace\client_packages C:\RAGEMP\server-files\client_packages /E /I /Y

# Copy configuration
copy C:\RAGEMP\workspace\conf.json C:\RAGEMP\server-files\ /Y

# Copy environment file
copy C:\RAGEMP\workspace\.env C:\RAGEMP\server-files\ /Y
```

---

## ✅ STEP 3: Install Dependencies in Server-Files

```bash
cd C:\RAGEMP\server-files\packages\rp-server

# If package.json doesn't exist, copy it
copy C:\RAGEMP\workspace\package.json .

# Install dependencies
npm install
```

**Wait for installation to complete!**

---

## ✅ STEP 4: Configure Database

### A. Start MySQL

Make sure MySQL is running:

```bash
# Check if MySQL is running
tasklist | findstr mysql

# If not running, start it:
net start MySQL80
```

(Replace `MySQL80` with your MySQL service name)

### B. Create Database

Open MySQL and create the database:

```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE IF NOT EXISTS ragemp_server;
EXIT;
```

### C. Update .env File

Open `C:\RAGEMP\server-files\.env` and update:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=ragemp_server
DB_PORT=3306
```

**Save the file!**

---

## ✅ STEP 5: Verify conf.json

Open `C:\RAGEMP\server-files\conf.json` and verify:

```json
{
  "maxplayers": 100,
  "name": "RAGE:MP Roleplay Server",
  "gamemode": "freeroam/roleplay",
  "stream-distance": 500.0,
  "port": 22005,
  "announce": false,
  "bind": "0.0.0.0",
  "language": "en",
  "url": "http://localhost",
  "allow-cef-debugging": true,
  "enable-nodejs": true,
  "csharp": false
}
```

**Important:** `"enable-nodejs": true` must be there!

---

## ✅ STEP 6: Verify Folder Structure

Your folder structure should look like this:

```
C:\RAGEMP\server-files\
├── ragemp-server.exe          ← RAGE:MP executable
├── conf.json                  ← Server config
├── .env                       ← Database credentials
├── packages\
│   └── rp-server\            ← Your server code
│       ├── index.js
│       ├── package.json
│       ├── node_modules\     ← Dependencies
│       └── modules\
│           ├── player.js
│           ├── database.js
│           ├── character.js
│           └── ... (all other modules)
└── client_packages\
    ├── index.js
    ├── modules\
    └── CEF\
```

**Check this:**
```bash
cd C:\RAGEMP\server-files
dir
dir packages
dir packages\rp-server
dir packages\rp-server\modules
dir client_packages
```

---

## ✅ STEP 7: Start the RAGE:MP Game Server

```bash
cd C:\RAGEMP\server-files
ragemp-server.exe
```

**Wait and watch the console!**

---

## ✅ STEP 8: Expected Successful Output

You should see:

```
RAGE Multiplayer Server
Build: X.X
Started!

=================================
RAGE:MP Roleplay Server Starting
=================================
[Server] Environment variables loaded
[Server] Initializing modules...
[Database] Connected to MySQL database successfully!
[Database] All tables created/verified successfully!
[Player] Module loaded
[Character] Module loaded
[Banking] Module loaded
[Inventory] Module loaded
[Shops] Module loaded
[Jobs] Module loaded
[Vehicles] Module loaded
[Admin] Module loaded
[Spawn] Module loaded
[Admin Bridge] Initializing connection to admin panel...
=================================
Server Initialization Complete!
=================================
```

**The window should stay open!** ✅

---

## ✅ STEP 9: Start Admin Panel (Optional)

In a **NEW** Command Prompt window:

```bash
cd C:\RAGEMP\workspace
npm run admin
```

**Wait for:**
```
Admin panel running on http://localhost:3000
```

Access at: http://localhost:3000
Login: `admin` / `admin123`

---

## ✅ STEP 10: Connect with RAGE:MP Client

1. Open RAGE:MP Client
2. Direct Connect
3. Enter: `localhost:22005`
4. Connect!

You should see the registration/login screen.

---

## 🆘 Troubleshooting

### Error: "Cannot find module 'dotenv'"

```bash
cd C:\RAGEMP\server-files\packages\rp-server
npm install
```

### Error: "mp is not defined"

Check:
1. Are you running `ragemp-server.exe`? (NOT `node`)
2. Is `"enable-nodejs": true` in conf.json?
3. Is folder structure correct? (`packages/rp-server/index.js`)

### Error: "Database connection failed"

Check:
1. Is MySQL running? (`tasklist | findstr mysql`)
2. Is `.env` in server-files folder?
3. Are database credentials correct in `.env`?
4. Does database exist? (`CREATE DATABASE ragemp_server;`)

### Server closes instantly

Install Visual C++ Redistributables:
- https://aka.ms/vs/17/release/vc_redist.x64.exe
- Install and restart computer

### "Package loading failed"

Check:
1. Folder must be: `packages/rp-server/` (with subfolder!)
2. File must exist: `packages/rp-server/index.js`
3. conf.json must have: `"enable-nodejs": true`

---

## 📋 Final Checklist

Before starting, verify:

- [ ] `ragemp-server.exe` exists in server-files
- [ ] `conf.json` has `"enable-nodejs": true`
- [ ] `.env` file exists with correct credentials
- [ ] Folder structure: `packages/rp-server/index.js`
- [ ] Dependencies installed: `node_modules/` exists
- [ ] MySQL is running
- [ ] Database `ragemp_server` created
- [ ] Running `ragemp-server.exe` (NOT node)

---

## 🎯 Quick Commands Summary

```bash
# 1. Copy files
xcopy C:\RAGEMP\workspace\packages C:\RAGEMP\server-files\packages /E /I /Y
xcopy C:\RAGEMP\workspace\client_packages C:\RAGEMP\server-files\client_packages /E /I /Y
copy C:\RAGEMP\workspace\conf.json C:\RAGEMP\server-files\ /Y
copy C:\RAGEMP\workspace\.env C:\RAGEMP\server-files\ /Y

# 2. Install dependencies
cd C:\RAGEMP\server-files\packages\rp-server
npm install

# 3. Start MySQL
net start MySQL80

# 4. Start game server
cd C:\RAGEMP\server-files
ragemp-server.exe

# 5. Start admin panel (optional, new window)
cd C:\RAGEMP\workspace
npm run admin
```

---

## ✅ Success Indicators

**Game Server:**
- Window stays open
- Shows "Server Initialization Complete!"
- No error messages
- Can connect with RAGE:MP client

**Admin Panel:**
- Shows "Admin panel running on http://localhost:3000"
- Can access http://localhost:3000 in browser
- Can login with admin/admin123

---

## 🎉 You're Done!

If you see "Server Initialization Complete!" and the window stays open:

**Congratulations! Your server is running!** 🚀

Connect with RAGE:MP client to `localhost:22005` and start playing!

---

*If you encounter any errors, copy the EXACT error message and check the troubleshooting section above.*
