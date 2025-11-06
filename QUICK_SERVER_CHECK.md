# 🚨 Server Won't Start - Quick Check

## Run This Diagnostic NOW

1. **Copy `check-server.bat` to your server-files folder:**
   ```bash
   copy C:\RAGEMP\workspace\check-server.bat C:\RAGEMP\server-files\
   ```

2. **Navigate to server-files:**
   ```bash
   cd C:\RAGEMP\server-files
   ```

3. **Run the diagnostic:**
   ```bash
   check-server.bat
   ```

4. **Tell me what failed!**

---

## Most Common Issues

### ❌ "server.exe NOT FOUND"

**You don't have RAGE:MP server!**

**Fix:**
1. Go to: https://rage.mp/
2. Click "Downloads"
3. Download "Server Package for Windows"
4. Extract **everything** to `C:\RAGEMP\server-files\`

---

### ❌ "packages\ folder NOT FOUND"

**Your server code is missing!**

**Fix:**
```bash
# Copy from workspace to server-files
xcopy C:\RAGEMP\workspace\packages C:\RAGEMP\server-files\packages /E /I
xcopy C:\RAGEMP\workspace\client_packages C:\RAGEMP\server-files\client_packages /E /I
```

---

### ❌ "MySQL does not appear to be running"

**Database is not started!**

**Fix:**
1. Open Windows Services (Win+R, type `services.msc`)
2. Find "MySQL" or "MySQL80" service
3. Right-click → Start

Or use command:
```bash
net start MySQL80
```

---

### ❌ "node_modules\ folder NOT FOUND"

**Dependencies not installed!**

**Fix:**
```bash
cd C:\RAGEMP\server-files

# If package.json doesn't exist, copy it
copy C:\RAGEMP\workspace\package.json .

# Install dependencies
npm install
```

---

## After Running Diagnostic

### If All OK:
```bash
cd C:\RAGEMP\server-files
server.exe
```

### If server.exe Closes Immediately:
1. Install Visual C++ Redistributables:
   - https://aka.ms/vs/17/release/vc_redist.x64.exe
2. Try running as Administrator:
   - Right-click server.exe → Run as Administrator

### If You See Errors:
**Copy the EXACT error message and tell me!**

---

## Expected Successful Output

When server starts correctly, you should see:

```
=================================
RAGE:MP Roleplay Server Starting
=================================
[Server] Environment variables loaded
[Server] ✅ RAGE:MP environment detected
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
Started!
```

---

## Tell Me EXACTLY What You See

To help you, I need to know:

1. ✅ What checks PASSED in the diagnostic?
2. ❌ What checks FAILED in the diagnostic?
3. 💬 What error message do you see when you try `server.exe`?
4. 📁 Where are your files located?

**Run the diagnostic and tell me the results!**
