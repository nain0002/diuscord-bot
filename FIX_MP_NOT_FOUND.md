# 🔴 FIX: "mp is not defined" Error (Server is Starting)

## The Situation

Your `ragemp-server.exe` IS starting, but you're getting an error that `mp` is not defined.

This means the RAGE:MP server is running but Node.js isn't being initialized properly.

---

## ✅ SOLUTION 1: Check conf.json (Most Common)

### Step 1: Open conf.json

Open this file: `C:\RAGEMP\server-files\conf.json`

### Step 2: Verify enable-nodejs is true

Your conf.json should look like this:

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
  "enable-nodejs": true,     ← MUST BE TRUE!
  "csharp": false
}
```

### Step 3: If it says false or is missing

1. Change `"enable-nodejs": false` to `"enable-nodejs": true`
2. OR add the line if it's missing
3. Save the file
4. Restart the server

**IMPORTANT:** Make sure the JSON is valid:
- No trailing commas
- Proper quotes
- All brackets closed

---

## ✅ SOLUTION 2: Verify Package Structure

The packages folder must be structured correctly:

```
C:\RAGEMP\server-files\
├── ragemp-server.exe
├── conf.json
├── packages\
│   └── rp-server\          ← Must be this exact name!
│       ├── index.js
│       └── modules\
│           ├── player.js
│           ├── database.js
│           └── ...
└── client_packages\
    ├── index.js
    └── modules\
```

**Check:**
1. Is your folder named `packages` (not `package`)?
2. Is there a subfolder inside packages? (e.g., `rp-server`)
3. Does `packages/rp-server/index.js` exist?

---

## ✅ SOLUTION 3: Update RAGE:MP Server

Your RAGE:MP server version might be too old.

### Step 1: Check Your Version

When you start ragemp-server.exe, look for:
```
RAGE Multiplayer Server
Build: X.X
```

### Step 2: Download Latest Version

1. Go to: https://rage.mp/
2. Click "Downloads"
3. Download "Server Package for Windows"
4. **Backup your code first:**
   ```bash
   xcopy C:\RAGEMP\server-files\packages C:\RAGEMP\backup\packages /E /I
   xcopy C:\RAGEMP\server-files\client_packages C:\RAGEMP\backup\client_packages /E /I
   ```
5. Extract new server files
6. Copy your packages and client_packages back

---

## ✅ SOLUTION 4: Fix conf.json Syntax

Sometimes conf.json has syntax errors that prevent it from loading.

### Test Your JSON

1. Copy all content from your conf.json
2. Go to: https://jsonlint.com/
3. Paste and validate
4. Fix any errors shown

### Common JSON Errors:

**Wrong (trailing comma):**
```json
{
  "port": 22005,
  "enable-nodejs": true,   ← Extra comma!
}
```

**Correct:**
```json
{
  "port": 22005,
  "enable-nodejs": true
}
```

---

## ✅ SOLUTION 5: Fresh conf.json

Replace your conf.json with this tested version:

**Copy this to `C:\RAGEMP\server-files\conf.json`:**

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

Save the file and restart the server.

---

## ✅ SOLUTION 6: Check Package Name

RAGE:MP loads packages from the `packages/` folder.

### Required Structure:

```
packages\
  └── [package-name]\
      └── index.js
```

### Your current structure should be:

```
packages\
  └── rp-server\
      └── index.js
```

**Check:** Does `C:\RAGEMP\server-files\packages\rp-server\index.js` exist?

If not, you might have:
- `packages\index.js` (wrong - missing subfolder)
- `packages\modules\index.js` (wrong - wrong structure)

**Fix:**
```bash
# If files are in wrong location, create proper structure
mkdir C:\RAGEMP\server-files\packages\rp-server
move C:\RAGEMP\server-files\packages\*.js C:\RAGEMP\server-files\packages\rp-server\
move C:\RAGEMP\server-files\packages\modules C:\RAGEMP\server-files\packages\rp-server\
```

---

## ✅ SOLUTION 7: Reinstall Dependencies in Correct Location

Node modules must be in the packages subfolder:

```bash
cd C:\RAGEMP\server-files\packages\rp-server
npm install dotenv mysql2 bcrypt ws
```

---

## 🔍 Diagnostic: Check What RAGE:MP Says

When the server starts, look for these messages:

**Good signs:**
```
Started!
Loading packages...
"rp-server" package loaded
```

**Bad signs:**
```
[WARN] RAGE:MP 'mp' global not available
[ERROR] Package loading failed
Node.js disabled
```

If you see warnings about Node.js, check conf.json!

---

## 📊 Quick Checklist

- [ ] `conf.json` has `"enable-nodejs": true`
- [ ] `conf.json` is valid JSON (test at jsonlint.com)
- [ ] Folder structure is: `packages/rp-server/index.js`
- [ ] RAGE:MP server is latest version
- [ ] Running `ragemp-server.exe` (not node)
- [ ] `.env` file exists in server-files
- [ ] `node_modules` exists (run `npm install`)

---

## 🆘 Still Not Working?

### Run This and Tell Me the Output:

```bash
cd C:\RAGEMP\server-files

echo === Checking conf.json ===
type conf.json

echo === Checking folder structure ===
dir packages
dir packages\rp-server

echo === Checking if index.js exists ===
dir packages\rp-server\index.js

echo === Starting server ===
ragemp-server.exe
```

Copy the full output and tell me what you see!

---

## Most Common Fix

**99% of the time it's:**

```json
"enable-nodejs": false   ← Change to true!
```

1. Open conf.json
2. Change to `"enable-nodejs": true`
3. Save
4. Restart server
5. Should work! ✅

---

*After trying these solutions, let me know what happens!*
