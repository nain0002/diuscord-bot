# 🔍 Server Won't Start - Diagnostic Guide

## Step-by-Step Troubleshooting

### Step 1: Verify server.exe Exists

Open Command Prompt and run:
```bash
cd C:\RAGEMP\server-files
dir server.exe
```

**What do you see?**

#### Option A: "File Not Found" or "Cannot find the path"
❌ **Problem:** You don't have the RAGE:MP server executable!

**Solution:**
1. Go to https://rage.mp/
2. Click "Downloads"
3. Download "Server Package for Windows"
4. Extract **ALL** files to `C:\RAGEMP\server-files\`
5. Verify these files exist:
   - server.exe
   - ragemp-server.exe (or similar)
   - libragemp-server.dll (or similar DLL files)

#### Option B: You see "server.exe" listed
✅ Good! Continue to Step 2.

---

### Step 2: Try to Run server.exe

In Command Prompt:
```bash
cd C:\RAGEMP\server-files
server.exe
```

**What happens?**

#### Option A: Nothing happens / Window closes immediately
**Possible causes:**
1. Missing Visual C++ Redistributables
2. Missing DLL files
3. Corrupted server.exe

**Solutions:**
1. Install Visual C++ Redistributables:
   - Download from: https://aka.ms/vs/17/release/vc_redist.x64.exe
   - Run the installer
   - Restart your computer

2. Re-download RAGE:MP server:
   - Delete current server-files folder
   - Download fresh from https://rage.mp/
   - Extract again

#### Option B: Error message appears
**Tell me the EXACT error message!** Different errors have different solutions:

- "Missing DLL" → Install Visual C++ Redistributables
- "Access denied" → Run as Administrator
- "Port already in use" → Close other RAGE:MP servers or change port
- "Cannot bind to address" → Check firewall settings

#### Option C: Server starts but shows errors
**Go to Step 3**

---

### Step 3: Check What Errors Appear

When server.exe runs, what do you see?

#### Common Error 1: "Cannot find module 'dotenv'"
```
[ERROR] "rp-server" package loading failed
Cannot find module 'dotenv'
```

**Solution:**
```bash
# The node_modules need to be in server-files
cd C:\RAGEMP\server-files
npm install

# If no package.json, copy it from workspace
copy C:\RAGEMP\workspace\package.json C:\RAGEMP\server-files\
npm install
```

#### Common Error 2: "mp is not defined"
```
ReferenceError: mp is not defined
```

**Solution:** You're running with Node.js instead of server.exe!
- Make sure you run `server.exe`, NOT `node index.js`
- See CRITICAL_ERROR_FIX.md

#### Common Error 3: Database connection failed
```
[Database] Error connecting to database: ECONNREFUSED
```

**Solution:**
1. Make sure MySQL is running:
   ```bash
   # Check if MySQL is running
   tasklist | findstr mysql
   ```

2. If MySQL not running:
   - Start MySQL service:
   - Windows: Services → MySQL → Start
   - Or: `net start MySQL80` (or your MySQL version)

3. Check .env file exists in server-files:
   ```bash
   cd C:\RAGEMP\server-files
   type .env
   ```

4. Verify database credentials in .env:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=ragemp_server
   DB_PORT=3306
   ```

#### Common Error 4: "Port already in use"
```
Error: listen EADDRINUSE: address already in use :::22005
```

**Solution:**
1. Check if another RAGE:MP server is running:
   ```bash
   tasklist | findstr server.exe
   ```

2. Kill old server:
   ```bash
   taskkill /F /IM server.exe
   ```

3. Or change port in conf.json:
   ```json
   {
     "port": 22006
   }
   ```

---

### Step 4: Verify Required Files

Check if these files exist in `C:\RAGEMP\server-files\`:

```bash
cd C:\RAGEMP\server-files
dir
```

**Required files:**
- [ ] `server.exe` - RAGE:MP executable
- [ ] `conf.json` - Server configuration
- [ ] `.env` - Database credentials
- [ ] `packages\` folder - Your server code
- [ ] `client_packages\` folder - Your client code
- [ ] `node_modules\` folder - Dependencies

**If missing:**

**Missing `packages/` or `client_packages/`:**
```bash
# Copy from workspace
xcopy C:\RAGEMP\workspace\packages C:\RAGEMP\server-files\packages /E /I
xcopy C:\RAGEMP\workspace\client_packages C:\RAGEMP\server-files\client_packages /E /I
```

**Missing `conf.json`:**
```bash
copy C:\RAGEMP\workspace\conf.json C:\RAGEMP\server-files\
```

**Missing `.env`:**
```bash
copy C:\RAGEMP\workspace\.env C:\RAGEMP\server-files\
```

**Missing `node_modules/`:**
```bash
cd C:\RAGEMP\server-files
copy C:\RAGEMP\workspace\package.json .
npm install
```

---

### Step 5: Check conf.json

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
  "enable-nodejs": true,    ← MUST BE TRUE!
  "csharp": false
}
```

**If `"enable-nodejs"` is false or missing:**
1. Open conf.json in Notepad
2. Change to `"enable-nodejs": true`
3. Save file
4. Try starting server again

---

### Step 6: Test Database Connection

Before starting the server, test if MySQL is accessible:

```bash
# Try to connect to MySQL
mysql -u root -p

# If this works, your MySQL is running
# Type your password when prompted
# Then type: exit
```

**If MySQL command not found:**
- MySQL is not installed or not in PATH
- Install MySQL from: https://dev.mysql.com/downloads/mysql/

**If "Access denied":**
- Wrong password in .env file
- Update .env with correct password

---

## 🆘 Still Not Working? Provide This Info:

To help you further, I need to know:

1. **What happens when you run server.exe?**
   - Nothing?
   - Error message? (paste the FULL error)
   - Window closes immediately?
   - Server starts but crashes?

2. **What's in your server-files folder?**
   ```bash
   cd C:\RAGEMP\server-files
   dir
   ```
   Paste the output.

3. **Does server.exe exist?**
   ```bash
   cd C:\RAGEMP\server-files
   dir server.exe
   ```

4. **Is MySQL running?**
   ```bash
   tasklist | findstr mysql
   ```

5. **What's the EXACT error message?**
   Copy and paste the full error from the console.

---

## Quick Diagnostic Commands

Run these and tell me the results:

```bash
# 1. Check if in correct directory
cd C:\RAGEMP\server-files
echo Current directory: %CD%

# 2. Check if server.exe exists
dir server.exe

# 3. Check if conf.json exists
type conf.json

# 4. Check if packages folder exists
dir packages

# 5. Check if MySQL is running
tasklist | findstr mysql

# 6. Try to start server
server.exe
```

Paste the output of these commands!

---

## Common Solutions Summary

| Problem | Solution |
|---------|----------|
| server.exe not found | Download RAGE:MP from rage.mp |
| Missing DLL errors | Install Visual C++ Redistributables |
| Server closes immediately | Run as Administrator |
| Cannot find module 'dotenv' | Run `npm install` in server-files |
| mp is not defined | Use `server.exe`, not `node` |
| Database connection failed | Start MySQL, check .env credentials |
| Port already in use | Kill old server or change port |
| enable-nodejs: false | Change to true in conf.json |

---

## The Nuclear Option (Fresh Start)

If nothing works, start completely fresh:

### 1. Clean Install
```bash
# Delete everything
rmdir /S /Q C:\RAGEMP

# Create fresh directories
mkdir C:\RAGEMP\server-files
mkdir C:\RAGEMP\workspace
```

### 2. Download RAGE:MP
- Go to https://rage.mp/
- Download "Server Package for Windows"
- Extract to `C:\RAGEMP\server-files\`

### 3. Copy Your Code
```bash
# Copy from your workspace
xcopy C:\path\to\your\code\packages C:\RAGEMP\server-files\packages /E /I
xcopy C:\path\to\your\code\client_packages C:\RAGEMP\server-files\client_packages /E /I
copy C:\path\to\your\code\conf.json C:\RAGEMP\server-files\
copy C:\path\to\your\code\.env C:\RAGEMP\server-files\
```

### 4. Install Dependencies
```bash
cd C:\RAGEMP\server-files
npm install dotenv mysql2 bcrypt ws
```

### 5. Start Server
```bash
server.exe
```

---

**Let me know which step fails and what error you see!**
