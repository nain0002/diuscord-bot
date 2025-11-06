# 🔐 Admin Levels & Features Guide

## Current Implementation

### Admin System Type
**Binary Admin System** - Currently uses `is_admin` boolean (admin or not admin)

### Database Structure
```sql
users table:
- is_admin BOOLEAN DEFAULT FALSE    -- Quick admin check
- admin_level INT DEFAULT 0         -- Reserved for future tiered system
```

---

## 📊 Current Admin Features (All Levels)

Currently, if `is_admin = 1`, the user has access to **ALL 33 admin features**:

### 🎮 In-Game Admin Menu (F6)

#### 1️⃣ **Dashboard & Monitoring** (5 features)
- Real-time server statistics
- Player count monitoring
- Vehicle count tracking
- Server uptime display
- Memory usage display

#### 2️⃣ **Player Management** (6 features)
- View all online players
- Search players by name/ID
- Heal players (restore HP + armor)
- Freeze/unfreeze players
- Teleport to player location
- Spectate players

#### 3️⃣ **Server Control** (6 features)
- Heal all players
- Repair all vehicles
- Refuel all vehicles
- Clear all spawned vehicles
- Clear all spawned objects
- Server announcements

#### 4️⃣ **Moderation Tools** (5 features)
- Warn players (auto-kick at 3 warnings)
- Mute players (5 minute timeout)
- Jail players (10 minutes at prison)
- Kick players (with reason)
- Ban players (permanent with database log)

#### 5️⃣ **Spawn System** (3 features)
- Spawn vehicles (custom model + RGB color)
- Spawn objects (by model hash)
- Give weapons (any weapon type)

#### 6️⃣ **World Control** (4 features)
- Weather control (6 types: clear, clouds, rain, thunder, fog, snow)
- Time control (set hour 0-23)
- Toggle traffic
- Toggle peds
- Toggle police

#### 7️⃣ **Teleportation** (2 features)
- Quick locations (6 preset spots)
- Custom coordinates (X, Y, Z)

#### 8️⃣ **Whitelist Management** (2 features)
- Add players to whitelist
- Remove players from whitelist

#### 9️⃣ **Personal Tools** (6 features)
- NoClip mode (fly through walls)
- God mode (invincibility)
- Invisible mode
- Super jump
- Super speed
- Infinite ammo

#### 🔟 **Advanced Tools** (3 features)
- Screenshot tool (request player screenshots)
- Chat logs viewer (last 100 messages)
- Player reports viewer

### 🌐 Web Admin Panel Features

#### **Management APIs** (4 systems)
- Admin logs (view all actions)
- Whitelist management (CRUD operations)
- Ban management (CRUD operations)
- Report system (view, accept, reject)

---

## 🎯 Recommended Admin Level System

### Suggested Tiered Levels

```
Level 0: Regular Player (Not Admin)
Level 1: Moderator
Level 2: Administrator
Level 3: Senior Admin
Level 4: Server Owner
```

---

## 📋 Feature Distribution by Level (Recommended)

### **Level 0: Regular Player**
```
Access: None
Features: 0
```

---

### **Level 1: Moderator** 👮
**Focus**: Basic moderation and player help

#### Allowed Features (12):
✅ View online players  
✅ Heal specific player  
✅ Teleport to player  
✅ Warn players  
✅ Mute players (temporary)  
✅ View chat logs  
✅ View reports  
✅ Spectate players  
✅ Take screenshots  
✅ Teleport (quick locations only)  
✅ View server stats  
✅ Search players  

#### Restricted:
❌ Kick/Ban  
❌ Spawn vehicles/weapons  
❌ Weather/time control  
❌ NoClip/God mode  
❌ Server-wide actions  

---

### **Level 2: Administrator** 🛡️
**Focus**: Full player management + limited server control

#### Additional Features (10):
✅ **All Level 1 features**  
✅ Freeze/unfreeze players  
✅ Kick players  
✅ Jail players  
✅ Spawn vehicles  
✅ Spawn objects  
✅ Give weapons  
✅ Repair all vehicles  
✅ Refuel all vehicles  
✅ Custom coordinate teleport  
✅ Handle reports  

#### Restricted:
❌ Ban players (permanent)  
❌ Weather/time control  
❌ World toggles  
❌ Clear all vehicles/objects  
❌ Whitelist management  
❌ NoClip/God mode  

---

### **Level 3: Senior Admin** 👑
**Focus**: Advanced server control

#### Additional Features (8):
✅ **All Level 2 features**  
✅ Ban players  
✅ Weather control  
✅ Time control  
✅ World toggles (traffic, peds, police)  
✅ Clear all vehicles/objects  
✅ Server announcements  
✅ NoClip mode  
✅ God mode  

#### Restricted:
❌ Whitelist management (owner only)  
❌ Admin management (owner only)  

---

### **Level 4: Server Owner** 👨‍💼
**Focus**: Complete server control

#### All Features (33):
✅ **All Level 3 features**  
✅ Whitelist management  
✅ Admin management (promote/demote)  
✅ Invisible mode  
✅ Super abilities  
✅ Access to all web panel features  
✅ Database management  
✅ Server configuration  

---

## 🔧 How to Set Admin Levels

### Method 1: Direct Database Update (Recommended)

```sql
-- Make someone a Moderator (Level 1)
UPDATE users SET is_admin = 1, admin_level = 1 WHERE username = 'moderator1';

-- Make someone an Administrator (Level 2)
UPDATE users SET is_admin = 1, admin_level = 2 WHERE username = 'admin1';

-- Make someone a Senior Admin (Level 3)
UPDATE users SET is_admin = 1, admin_level = 3 WHERE username = 'senioradmin1';

-- Make someone a Server Owner (Level 4)
UPDATE users SET is_admin = 1, admin_level = 4 WHERE username = 'owner';

-- Remove admin privileges
UPDATE users SET is_admin = 0, admin_level = 0 WHERE username = 'username';
```

### Method 2: Via Admin Panel (If Implemented)

1. Login to web admin panel: `http://localhost:3001`
2. Navigate to "Admin Management"
3. Find user
4. Click "Edit"
5. Set admin level (1-4)
6. Save

---

## 💻 Implementing Tiered Admin Levels

### To implement the tiered system, follow these steps:

### Step 1: Update Permission Check Function

Create `/workspace/packages/rp-server/modules/admin-permissions.js`:

```javascript
// Admin Permission System
const adminPermissions = {
    // Moderator permissions (Level 1)
    moderator: [
        'viewPlayers',
        'healPlayer',
        'teleportToPlayer',
        'warnPlayer',
        'mutePlayer',
        'viewChatLogs',
        'viewReports',
        'spectatePlayer',
        'screenshot',
        'teleportQuick',
        'viewStats',
        'searchPlayers'
    ],
    
    // Administrator permissions (Level 2)
    administrator: [
        'freezePlayer',
        'kickPlayer',
        'jailPlayer',
        'spawnVehicle',
        'spawnObject',
        'giveWeapon',
        'repairAll',
        'refuelAll',
        'teleportCustom',
        'handleReports'
    ],
    
    // Senior Admin permissions (Level 3)
    seniorAdmin: [
        'banPlayer',
        'weatherControl',
        'timeControl',
        'worldToggles',
        'clearAll',
        'announce',
        'noclip',
        'godmode'
    ],
    
    // Server Owner permissions (Level 4)
    owner: [
        'whitelistManage',
        'adminManage',
        'invisible',
        'superAbilities',
        'databaseAccess',
        'serverConfig'
    ]
};

// Check if player has permission
function hasPermission(player, permission) {
    const adminLevel = player.getVariable('admin_level') || 0;
    
    // Level 0: No permissions
    if (adminLevel === 0) return false;
    
    // Level 4: All permissions
    if (adminLevel >= 4) return true;
    
    // Check level-specific permissions
    if (adminLevel >= 1 && adminPermissions.moderator.includes(permission)) return true;
    if (adminLevel >= 2 && adminPermissions.administrator.includes(permission)) return true;
    if (adminLevel >= 3 && adminPermissions.seniorAdmin.includes(permission)) return true;
    
    return false;
}

// Check minimum admin level
function hasMinLevel(player, minLevel) {
    const adminLevel = player.getVariable('admin_level') || 0;
    return adminLevel >= minLevel;
}

module.exports = {
    hasPermission,
    hasMinLevel,
    permissions: adminPermissions
};
```

### Step 2: Update Admin Commands to Use Levels

Example for `admin-commands-enhanced.js`:

```javascript
const adminPerms = require('./admin-permissions');

// Example: Kick command (requires Level 2)
mp.events.add('adminKick', async (player, targetId, reason) => {
    // Check minimum level
    if (!adminPerms.hasMinLevel(player, 2)) {
        player.outputChatBox('!{#FF0000}Insufficient permissions. Requires: Administrator (Level 2)');
        return;
    }
    
    // Or check specific permission
    if (!adminPerms.hasPermission(player, 'kickPlayer')) {
        player.outputChatBox('!{#FF0000}You do not have permission to kick players.');
        return;
    }
    
    // Proceed with command...
});

// Example: Ban command (requires Level 3)
mp.events.add('adminBan', async (player, targetId, reason) => {
    if (!adminPerms.hasMinLevel(player, 3)) {
        player.outputChatBox('!{#FF0000}Insufficient permissions. Requires: Senior Admin (Level 3)');
        return;
    }
    
    // Proceed with ban...
});
```

### Step 3: Update Client-Side Menu

Modify `admin-menu-handler-enhanced.js` to store admin level:

```javascript
// When menu opens, get admin level
mp.keys.bind(0x75, false, function() {
    const player = mp.players.local;
    const isAdmin = player.getVariable('is_admin');
    const adminLevel = player.getVariable('admin_level') || 0;
    
    if (!isAdmin || adminLevel === 0) {
        mp.gui.chat.push('!{#FF0000}You must be an admin to use this menu!');
        return;
    }
    
    // Send admin level to CEF
    if (adminMenuBrowser) {
        adminMenuBrowser.execute(`setAdminLevel(${adminLevel})`);
    }
    
    // ... rest of code
});
```

### Step 4: Update CEF to Hide/Show Features

Modify `admin-menu-enhanced.js`:

```javascript
let userAdminLevel = 0;

function setAdminLevel(level) {
    userAdminLevel = level;
    updateMenuVisibility();
}

function updateMenuVisibility() {
    // Hide features based on level
    if (userAdminLevel < 2) {
        // Hide kick/ban buttons
        document.querySelectorAll('.kick-btn').forEach(el => el.style.display = 'none');
    }
    
    if (userAdminLevel < 3) {
        // Hide weather/time controls
        document.getElementById('weather').style.display = 'none';
    }
    
    if (userAdminLevel < 4) {
        // Hide whitelist section
        document.getElementById('whitelist').style.display = 'none';
    }
}
```

---

## 📖 Usage Examples

### Scenario 1: New Moderator
```sql
-- Give player moderator role
UPDATE users SET is_admin = 1, admin_level = 1 WHERE username = 'newmod';
```

**What they can do:**
- Help players (heal, teleport to them)
- Monitor chat
- Warn/mute troublemakers
- View reports

**What they CANNOT do:**
- Kick or ban
- Spawn items
- Change weather
- Use god mode

### Scenario 2: Promote to Administrator
```sql
-- Promote moderator to admin
UPDATE users SET admin_level = 2 WHERE username = 'newmod';
```

**New abilities:**
- Kick players
- Jail players
- Spawn vehicles/weapons
- Repair/refuel all vehicles

### Scenario 3: Trusted Senior Admin
```sql
-- Promote to senior admin
UPDATE users SET admin_level = 3 WHERE username = 'trustedadmin';
```

**New abilities:**
- Ban players (permanent)
- Control weather and time
- Make server announcements
- Use NoClip and god mode

---

## 🎨 Admin Badge System

### Display Admin Level In-Game

You can add visual indicators:

```javascript
// Client-side (HUD)
function getAdminBadge(level) {
    switch(level) {
        case 1: return '🟢 MOD';
        case 2: return '🔵 ADMIN';
        case 3: return '🟣 SENIOR';
        case 4: return '🔴 OWNER';
        default: return '';
    }
}

// Show above player name
const badge = getAdminBadge(adminLevel);
if (badge) {
    // Display badge in nameplate
}
```

---

## 📊 Current vs Recommended Comparison

| Feature | Current System | Recommended System |
|---------|---------------|-------------------|
| **Admin Check** | Binary (is_admin) | Tiered (admin_level) |
| **Permissions** | All or nothing | Granular by level |
| **New Admin Setup** | Full access immediately | Start at Level 1, earn trust |
| **Security** | Risk of abuse | Controlled escalation |
| **Flexibility** | Limited | Highly flexible |
| **Accountability** | Basic | Enhanced tracking |

---

## 🔒 Security Best Practices

### For Server Owners:

1. **Start Low**: Give new admins Level 1 first
2. **Monitor**: Watch admin logs regularly
3. **Promote Gradually**: Increase level after trust is built
4. **Document**: Keep record of who has what level
5. **Backup**: Backup database before promoting to Level 4

### Recommended Promotion Timeline:
- **Level 1 (Moderator)**: New admin, 1+ week trial
- **Level 2 (Administrator)**: 2+ weeks, proven helpful
- **Level 3 (Senior Admin)**: 1+ month, highly trusted
- **Level 4 (Owner)**: Only co-owners, never temporary

---

## 📝 Quick Reference Card

### Admin Level Quick Check
```
Level 0 = Not Admin (no access)
Level 1 = Moderator (basic help/moderation)
Level 2 = Administrator (player management)
Level 3 = Senior Admin (server control)
Level 4 = Server Owner (full control)
```

### Command Reference by Level
```
Level 1: heal, warn, mute, spectate, teleport to
Level 2: + kick, jail, spawn vehicles/weapons
Level 3: + ban, weather, time, noclip, god mode
Level 4: + whitelist, admin management, all features
```

---

## 🎯 Summary

### Current State
- **System**: Binary admin (all features or none)
- **Features**: 33 total admin features
- **Access**: `is_admin = 1` gives full access

### Recommended Improvement
- **System**: 4-tier admin levels
- **Distribution**: 
  - Level 1: 12 features
  - Level 2: 22 features
  - Level 3: 30 features
  - Level 4: 33 features
- **Benefits**: Better security, gradual trust building, less abuse

### To Enable Tiered System
1. Implement `admin-permissions.js` module
2. Update event handlers with permission checks
3. Update client menu to show/hide based on level
4. Set admin levels in database
5. Test each level thoroughly

---

## ❓ FAQ

**Q: Can I change what each level can do?**  
A: Yes! Edit the `adminPermissions` object in `admin-permissions.js`

**Q: Can I add more levels?**  
A: Yes! Add Level 5, 6, etc. with different permissions

**Q: Do I have to implement tiered levels?**  
A: No, the current binary system works fine for small servers

**Q: Will tiered levels break existing admins?**  
A: No, if `admin_level = 0`, they keep current binary system

**Q: Can I have level-specific UI colors?**  
A: Yes! Update CSS in admin menu based on level

---

*Last Updated: 2025-11-06*  
*Current Implementation: Binary (All or Nothing)*  
*Recommended: Tiered 4-Level System*
