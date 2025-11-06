# 📥 How to Download RAGE:MP Server

## Step 1: Go to Official Website

Open your browser and go to:
```
https://rage.mp/
```

## Step 2: Find Downloads

On the rage.mp website:
- Look for **"Downloads"** in the menu
- Click on it

## Step 3: Download Server Package

You'll see several download options:
- ✅ **Server Package for Windows** ← Download THIS
- ❌ NOT the client
- ❌ NOT Linux version (unless you're on Linux)

The file will be named something like:
- `ragemp-srv-037.zip` 
- Or similar with version number

## Step 4: Extract Files

1. Find the downloaded ZIP file
2. Right-click → Extract All
3. Extract to: `C:\RAGEMP\server-files\`

**IMPORTANT:** Extract EVERYTHING, don't skip any files!

## Step 5: Verify Installation

Check these files exist in `C:\RAGEMP\server-files\`:

```
C:\RAGEMP\server-files\
├── ragemp-server.exe    ← Main server executable
├── node.dll             ← Node.js support (CRITICAL!)
├── libragemp-server.dll
├── bridge\              ← Folder
└── (many other DLL files)
```

**Critical Check:**
```bash
dir C:\RAGEMP\server-files\node.dll
```

If you see "File Not Found" = Download is incomplete or wrong!

## Step 6: Copy Your Code

```bash
# Copy server code
xcopy C:\RAGEMP\workspace\packages C:\RAGEMP\server-files\packages /E /I /Y

# Copy client code  
xcopy C:\RAGEMP\workspace\client_packages C:\RAGEMP\server-files\client_packages /E /I /Y

# Copy config
copy C:\RAGEMP\workspace\conf.json C:\RAGEMP\server-files\ /Y
copy C:\RAGEMP\workspace\.env C:\RAGEMP\server-files\ /Y
```

## Step 7: Install Dependencies

```bash
cd C:\RAGEMP\server-files\packages\rp-server
npm install
```

## Step 8: Start Server

```bash
cd C:\RAGEMP\server-files
ragemp-server.exe
```

## What You Should See

If successful:
```
RAGE Multiplayer Server
Build: 1.1 (or similar)
Started!

[Server] Environment variables loaded
[Server] Initializing modules...
[Database] Connected to MySQL database successfully!
...
Server Initialization Complete!
```

---

## Still Getting "mp is not defined"?

This means:
1. You downloaded the wrong thing (client instead of server)
2. Download is incomplete
3. You're missing `node.dll`

**Solution:** Delete everything and download again from rage.mp

---

## Can't Find the Download Link?

As of 2025, the direct download link format is usually:
```
https://cdn.rage.mp/public/files/RAGEMultiplayer_Setup.exe (for client)
https://cdn.rage.mp/public/files/server-files.zip (for server)
```

But always use the official website links to get the latest version!

---

## Need Help?

If you still can't download it, tell me:
1. What do you see on the rage.mp website?
2. Can you access rage.mp at all?
3. What country are you in? (Some countries block it)

---

## Alternative: Use GitHub Mirror

If rage.mp is blocked in your country, RAGE:MP server files are sometimes mirrored on GitHub. Search for:
```
"RAGE:MP server files" on GitHub
```

But official source is always best!
