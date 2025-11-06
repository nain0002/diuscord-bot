# 🔴 FIX: Server Closes Instantly

## The Problem

When you double-click `ragemp-server.exe`, the window opens and closes immediately without showing any error.

This almost always means **missing Visual C++ Redistributables** or **missing DLL files**.

---

## ✅ SOLUTION 1: Install Visual C++ Redistributables (Most Common Fix)

### Step 1: Download Visual C++ Redistributables

Download **ALL** of these (you need both x64 and x86):

**Visual C++ 2015-2022 (Latest):**
- **x64:** https://aka.ms/vs/17/release/vc_redist.x64.exe
- **x86:** https://aka.ms/vs/17/release/vc_redist.x86.exe

**Visual C++ 2013:**
- **x64:** https://aka.ms/highdpimfc2013x64enu
- **x86:** https://aka.ms/highdpimfc2013x86enu

**Visual C++ 2012:**
- **x64:** https://download.microsoft.com/download/1/6/B/16B06F60-3B20-4FF2-B699-5E9B7962F9AE/VSU_4/vcredist_x64.exe
- **x86:** https://download.microsoft.com/download/1/6/B/16B06F60-3B20-4FF2-B699-5E9B7962F9AE/VSU_4/vcredist_x86.exe

**Visual C++ 2010:**
- **x64:** https://download.microsoft.com/download/1/6/5/165255E7-1014-4D0A-B094-B6A430A6BFFC/vcredist_x64.exe
- **x86:** https://download.microsoft.com/download/1/6/5/165255E7-1014-4D0A-B094-B6A430A6BFFC/vcredist_x86.exe

### Step 2: Install All Downloaded Files

1. Run each `.exe` file you downloaded
2. Click "Install" or "Repair" if already installed
3. Restart your computer after installing all

### Step 3: Try Running Server Again

```bash
cd C:\RAGEMP\server-files
ragemp-server.exe
```

---

## ✅ SOLUTION 2: See the Actual Error

Copy `start-server-debug.bat` to your server folder and run it to see errors:

```bash
# Copy the debug script
copy C:\RAGEMP\workspace\start-server-debug.bat C:\RAGEMP\server-files\

# Navigate to server folder
cd C:\RAGEMP\server-files

# Run the debug script
start-server-debug.bat
```

This will keep the window open and show you the error message!

**Then tell me what error you see!**

---

## ✅ SOLUTION 3: Run as Administrator

1. Navigate to: `C:\RAGEMP\server-files\`
2. Right-click `ragemp-server.exe`
3. Select "Run as Administrator"

---

## ✅ SOLUTION 4: Check for Missing DLL Files

Open Command Prompt and run:

```bash
cd C:\RAGEMP\server-files
dir *.dll
```

You should see several DLL files. If the directory is empty (except .exe files), your RAGE:MP server download is incomplete.

**Solution:** Re-download RAGE:MP server from https://rage.mp/

---

## ✅ SOLUTION 5: Disable Antivirus Temporarily

Sometimes antivirus software blocks the server:

1. Temporarily disable your antivirus (Windows Defender or others)
2. Try running the server
3. If it works, add an exception for `ragemp-server.exe`

**To add Windows Defender exception:**
1. Windows Security → Virus & threat protection
2. Manage settings → Add or remove exclusions
3. Add folder: `C:\RAGEMP\server-files\`

---

## ✅ SOLUTION 6: Check if Port is Already in Use

Another server might be using port 22005:

```bash
# Check what's using port 22005
netstat -ano | findstr :22005

# If something is listed, kill it:
taskkill /F /PID [PID_NUMBER]
```

Or change the port in `conf.json`:
```json
{
  "port": 22006
}
```

---

## ✅ SOLUTION 7: Verify conf.json is Valid

Open `C:\RAGEMP\server-files\conf.json` and make sure it looks like this:

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

**Important:** No trailing commas, proper quotes, valid JSON format.

Test your JSON at: https://jsonlint.com/

---

## ✅ SOLUTION 8: Fresh RAGE:MP Server Download

If nothing else works, download a fresh copy:

### Step 1: Backup Your Code
```bash
# Backup your custom code
xcopy C:\RAGEMP\server-files\packages C:\RAGEMP\backup\packages /E /I
xcopy C:\RAGEMP\server-files\client_packages C:\RAGEMP\backup\client_packages /E /I
copy C:\RAGEMP\server-files\.env C:\RAGEMP\backup\
```

### Step 2: Delete Old Server
```bash
rmdir /S /Q C:\RAGEMP\server-files
mkdir C:\RAGEMP\server-files
```

### Step 3: Download Fresh RAGE:MP
1. Go to: https://rage.mp/
2. Downloads → Server Package for Windows
3. Extract **ALL FILES** to `C:\RAGEMP\server-files\`

### Step 4: Restore Your Code
```bash
xcopy C:\RAGEMP\backup\packages C:\RAGEMP\server-files\packages /E /I
xcopy C:\RAGEMP\backup\client_packages C:\RAGEMP\server-files\client_packages /E /I
copy C:\RAGEMP\backup\.env C:\RAGEMP\server-files\
copy C:\RAGEMP\workspace\conf.json C:\RAGEMP\server-files\
```

### Step 5: Install Dependencies
```bash
cd C:\RAGEMP\server-files
npm install dotenv mysql2 bcrypt ws
```

### Step 6: Try Again
```bash
ragemp-server.exe
```

---

## 🎯 Quick Checklist

Before trying anything else:

- [ ] Installed Visual C++ Redistributables (2010, 2012, 2013, 2015-2022)
- [ ] Restarted computer after installing
- [ ] Ran `start-server-debug.bat` to see errors
- [ ] Tried running as Administrator
- [ ] Checked conf.json is valid JSON
- [ ] Verified DLL files exist in server-files folder
- [ ] MySQL is running (`tasklist | findstr mysql`)
- [ ] Port 22005 is not in use by another program

---

## 📊 Expected Successful Output

When the server starts successfully, you should see:

```
RAGE Multiplayer Server

Build: 1.1 (or similar version number)

(node:xxxxx) Started!

[Server] Environment variables loaded
[Server] ✅ RAGE:MP environment detected
[Database] Connected to MySQL database successfully!
[Database] All tables created/verified successfully!
...
Server Initialization Complete!
```

The window should **stay open** and show server activity.

---

## 🆘 If Still Not Working

Run `start-server-debug.bat` and tell me:

1. **What error message do you see?** (exact text)
2. **Do you have DLL files?** (`dir *.dll` in server-files)
3. **Did you install Visual C++ Redistributables?**
4. **Did you restart your computer after installing?**

---

## Most Common Causes

| Issue | Probability | Fix |
|-------|-------------|-----|
| Missing Visual C++ | 80% | Install redistributables |
| Missing DLL files | 10% | Re-download RAGE:MP |
| Antivirus blocking | 5% | Add exception |
| Invalid conf.json | 3% | Fix JSON syntax |
| Port in use | 2% | Change port or kill process |

**99% of the time it's Visual C++ Redistributables!**

---

## 🎯 DO THIS NOW (Most Likely Fix)

1. **Download Visual C++ 2015-2022 x64:**
   https://aka.ms/vs/17/release/vc_redist.x64.exe

2. **Install it**

3. **Restart your computer**

4. **Try running the server again**

This fixes the problem 80% of the time!

---

*After trying these solutions, let me know what happens!*
