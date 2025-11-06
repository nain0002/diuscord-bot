# 🎮 Complete Installation Guide - New Features

## 📋 Quick Start Checklist

- [ ] RAGE:MP Server installed at `C:\RAGEMP\server-files\`
- [ ] MySQL/MariaDB running
- [ ] Node.js dependencies installed (`npm install` in `packages/rp-server/`)
- [ ] All workspace files copied to server-files
- [ ] Database `.env` configured
- [ ] Admin status set in database

---

## 🚀 Step-by-Step Installation

### Step 1: Prerequisites

**Required:**
- RAGE:MP Server (from https://rage.mp/)
- MySQL or MariaDB
- Node.js 14+ (with `npm`)
- RAGE:MP Client (for testing)

### Step 2: Copy Files

**From workspace to your RAGE:MP server:**

```bash
# Client files
workspace/client_packages/
  → C:\RAGEMP\server-files\client_packages\

# Server files
workspace/packages/rp-server/
  → C:\RAGEMP\server-files\packages\rp-server\

# Configuration
workspace/.env
  → C:\RAGEMP\server-files\.env
```

**New client files to copy:**
- ✅ `client_packages/hud-handler.js`
- ✅ `client_packages/admin-menu-handler.js`
- ✅ `client_packages/user-menu-handler.js`
- ✅ `client_packages/bot-cars.js`
- ✅ `client_packages/character-creation-handler.js`
- ✅ `client_packages/inventory.js`
- ✅ `client_packages/auth.js`

**New CEF files to copy:**
- ✅ `client_packages/CEF/modern-hud.html`
- ✅ `client_packages/CEF/enhanced-inventory.html`
- ✅ `client_packages/CEF/admin-menu.html`
- ✅ `client_packages/CEF/user-menu.html`
- ✅ `client_packages/CEF/character-creation.html`
- ✅ `client_packages/CEF/modern-auth.html`

**New server modules to copy:**
- ✅ `packages/rp-server/modules/admin-commands.js`
- ✅ `packages/rp-server/modules/user-menu.js`
- ✅ `packages/rp-server/modules/character-creator.js`
- ✅ `packages/rp-server/modules/database.js` (UPDATED)
- ✅ `packages/rp-server/index.js` (UPDATED)

### Step 3: Install Dependencies

Open command prompt in `C:\RAGEMP\server-files\packages\rp-server\`:

```bash
cd C:\RAGEMP\server-files\packages\rp-server
npm install
```

**Required packages:**
- mysql2
- dotenv
- bcrypt
- (all others already in package.json)

### Step 4: Configure Database

Edit `C:\RAGEMP\server-files\.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ragemp_server
DB_PORT=3306

# Server Configuration
SERVER_PORT=22005
MAX_PLAYERS=100
```

### Step 5: Start MySQL

Make sure MySQL/MariaDB is running:

```bash
# Windows Service
net start MySQL80

# Or start via XAMPP/WAMP control panel
```

### Step 6: Start RAGE:MP Server

```bash
cd C:\RAGEMP\server-files
ragemp-server.exe
```

**Important:**
- ✅ Use `ragemp-server.exe` (NOT `node index.js`)
- ✅ Wait for "Server Initialization Complete!" message
- ✅ Database tables will be created automatically

### Step 7: Set Admin Permissions

Connect to MySQL and run:

```sql
USE ragemp_server;

-- After you register your account, run:
UPDATE users SET is_admin = 1 WHERE username = 'YourUsername';
UPDATE users SET admin_level = 3 WHERE username = 'YourUsername';
```

**Admin levels:**
- 0 = No admin
- 1 = Moderator
- 2 = Admin
- 3 = Super Admin

### Step 8: Test Features

**Connect with RAGE:MP Client:**

1. **Login/Register**:
   - You'll see modern login screen
   - Register a new account
   - Login with credentials

2. **Character Creation**:
   - After first login, character creator appears
   - Customize your character
   - Click Finish to spawn

3. **Test HUD**:
   - HUD should appear automatically
   - Press **F5** to toggle

4. **Test Inventory**:
   - Press **I** to open
   - Should show empty inventory with weight bar

5. **Test User Menu**:
   - Press **M** to open
   - View stats, skills, actions

6. **Test Bot Cars** (if admin):
   - Walk near any parked vehicle
   - Press **F** to enter
   - Press **CTRL** to start engine
   - Press **L** to lock/unlock

7. **Test Admin Menu** (if admin):
   - Press **F6** to open
   - Try spawning a vehicle
   - Check player list
   - Test weather/time controls

---

## 🎯 Hotkeys Reference Card

```
╔═══════════════════════════════════════════╗
║           RAGE:MP HOTKEYS                 ║
╠═══════════════════════════════════════════╣
║  F       Enter nearby bot vehicle         ║
║  CTRL    Hold start engine / Toggle       ║
║  L       Lock/unlock vehicle              ║
║  I       Open inventory                   ║
║  M       Open user menu                   ║
║  F5      Toggle HUD                       ║
║  F6      Admin menu (admins only)         ║
║  ESC     Close any menu                   ║
╚═══════════════════════════════════════════╝
```

---

## 🔧 Troubleshooting

### Problem: HUD not showing
**Solutions:**
1. Check if `hud-handler.js` exists in `client_packages/`
2. Check if `CEF/modern-hud.html` exists
3. Press F5 to toggle visibility
4. Check browser console (F8 in-game)

### Problem: Admin menu not opening (F6)
**Solutions:**
1. Verify you set `is_admin = 1` in database
2. Restart server after database change
3. Check console for JavaScript errors
4. Verify `admin-menu-handler.js` is loaded

### Problem: Bot cars not spawning
**Solutions:**
1. Check if `bot-cars.js` exists and is loaded
2. Wait 2 seconds after player spawn
3. Check server console for spawn errors
4. Verify vehicle model names are correct

### Problem: Character creation not showing
**Solutions:**
1. Check database has `character_appearance` table
2. Verify `character-creator.js` module is loaded
3. Check if user already has a character
4. Look for errors in server console

### Problem: Inventory not opening (I key)
**Solutions:**
1. Check if `inventory.js` exists
2. Verify `enhanced-inventory.html` exists in CEF folder
3. Check browser console (F8) for errors
4. Test with another key binding

### Problem: Database connection failed
**Solutions:**
1. Verify MySQL is running: `net start MySQL80`
2. Check `.env` file has correct credentials
3. Verify database `ragemp_server` exists
4. Test MySQL connection manually

### Problem: Module not found errors
**Solutions:**
1. Run `npm install` in `packages/rp-server/`
2. Verify all node_modules are installed
3. Check package.json for missing dependencies
4. Delete node_modules and reinstall

---

## 📊 Verify Installation

### Checklist:

**Files:**
- [ ] All 7 client .js files copied
- [ ] All 6 CEF .html files copied
- [ ] All 3 new server modules copied
- [ ] database.js updated
- [ ] index.js updated

**Database:**
- [ ] MySQL running
- [ ] .env configured
- [ ] Database `ragemp_server` exists
- [ ] Tables created (13+ tables)
- [ ] Admin status set

**Server:**
- [ ] `ragemp-server.exe` starts without errors
- [ ] "Server Initialization Complete!" appears
- [ ] All modules loaded
- [ ] No "mp is not defined" errors

**Client:**
- [ ] Can connect to server
- [ ] Login screen appears
- [ ] Can register/login
- [ ] Character creation appears
- [ ] HUD shows after spawn
- [ ] Inventory opens with I
- [ ] User menu opens with M
- [ ] Bot cars are visible
- [ ] Admin menu works (if admin)

---

## 📁 File Structure Verification

Your `server-files` folder should look like:

```
C:\RAGEMP\server-files\
├── ragemp-server.exe
├── conf.json
├── .env
├── node_modules/
├── packages/
│   └── rp-server/
│       ├── index.js (UPDATED)
│       ├── package.json
│       └── modules/
│           ├── database.js (UPDATED)
│           ├── player.js
│           ├── admin-commands.js (NEW)
│           ├── user-menu.js (NEW)
│           ├── character-creator.js (NEW)
│           └── ... other modules
└── client_packages/
    ├── hud-handler.js (NEW)
    ├── admin-menu-handler.js (NEW)
    ├── user-menu-handler.js (NEW)
    ├── bot-cars.js (NEW)
    ├── character-creation-handler.js (NEW)
    ├── inventory.js (NEW)
    ├── auth.js (NEW)
    └── CEF/
        ├── modern-hud.html (NEW)
        ├── enhanced-inventory.html (NEW)
        ├── admin-menu.html (NEW)
        ├── user-menu.html (NEW)
        ├── character-creation.html (NEW)
        └── modern-auth.html (NEW)
```

---

## 🎨 UI Features Verification

After installation, you should see:

**1. Modern Login Screen:**
- Purple/blue gradient background
- Dual-tab interface
- Smooth animations
- Password strength indicator

**2. Live HUD:**
- Top bar: Health, Armor, Money
- Top right: Time and date
- Bottom left: Player info card
- Bottom right: Location
- Vehicle HUD when in car

**3. Enhanced Inventory:**
- Glass transparent UI
- Category tabs
- Weight progress bar
- Search functionality
- Context menu on right-click

**4. Admin Menu:**
- Sidebar navigation
- Dashboard with stats
- Player list
- Quick action cards
- Weather/time controls

**5. User Menu:**
- Split layout
- Stats on left
- Actions on right
- Skills with progress bars
- Toggle settings

**6. Character Creation:**
- 4-step wizard
- Step indicators
- Live preview
- Slider controls
- Color pickers

---

## 💡 First-Time Setup Tips

1. **Create Test Admin:**
   ```sql
   INSERT INTO users (username, password, email, is_admin, admin_level) 
   VALUES ('admin', '$2b$10$...', 'admin@test.com', 1, 3);
   ```

2. **Test Bot Cars:**
   - Spawn at spawn location
   - Look for nearest parked car
   - Walk close (see prompt)
   - Press F to enter

3. **Test All Menus:**
   - Login (modern UI)
   - Create character (4 steps)
   - Press M (user menu)
   - Press I (inventory)
   - Press F6 (admin menu if admin)

4. **Customize:**
   - Edit bot car spawns in `bot-cars.js`
   - Change HUD update rate in `hud-handler.js`
   - Modify colors in CEF files

---

## 🚀 You're Ready!

If all checks pass, your server now has:

- ✅ Modern glass UIs
- ✅ Live HUD system
- ✅ Full admin panel
- ✅ Enhanced inventory
- ✅ Bot car system
- ✅ Character creation
- ✅ User menu
- ✅ All features 100% functional

**Enjoy your enhanced RAGE:MP server!** 🎮✨

---

## 📞 Need Help?

Check these documents:
- `NEW_FEATURES.md` - Complete feature documentation
- `UPDATE_SUMMARY.md` - Summary of all changes
- `README.md` - Original setup guide

**Common Issues:**
- Server won't start → Check `CRITICAL_ERROR_FIX.md`
- Module errors → Run `npm install` again
- Database errors → Verify MySQL is running
- UI not showing → Check browser console (F8)
