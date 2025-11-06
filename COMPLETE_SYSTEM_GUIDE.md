# 🎮 RAGE:MP Complete System Guide v3.0

## 🌟 What's New in v3.0

### ✅ Major Updates
1. **6-Level Admin Permission System** (0-5)
2. **8 New Database Tables** 
3. **Enhanced Player Statistics Tracking**
4. **Achievement System** with 8 default achievements
5. **Economy Logging System**
6. **Session Tracking**
7. **Permission-Based Commands**
8. **UI/UX Improvements**

---

## 👑 Admin Levels & Permissions

### Level 0: Player (Default)
**Permissions**: None  
**Description**: Regular player with no admin access

### Level 1: Helper
**Permissions**:
- ❌ Kick/Ban
- ✅ Mute players
- ✅ Freeze players  
- ✅ Teleport
- ❌ Spawn vehicles/items
- ❌ Give money
- ❌ Manage whitelist
- ✅ View logs
- ❌ Manage admins

**Typical Use**: Support staff who can assist players

### Level 2: Moderator
**Permissions**:
- ✅ **Kick** players (not ban)
- ✅ Mute players
- ✅ Freeze players
- ✅ Teleport
- ✅ **Spawn vehicles**
- ❌ Spawn items
- ❌ Give money
- ✅ **Manage whitelist**
- ✅ View logs
- ❌ Manage admins

**Typical Use**: Moderators who enforce rules

### Level 3: Admin
**Permissions**:
- ✅ Kick players
- ✅ **Ban** players
- ✅ Mute players
- ✅ Freeze players
- ✅ Teleport
- ✅ Spawn vehicles
- ✅ **Spawn items**
- ✅ **Give money**
- ✅ Manage whitelist
- ✅ View logs
- ❌ Manage admins

**Typical Use**: Full admin powers for server management

### Level 4: Head Admin
**Permissions**:
- ✅ **All Level 3 permissions**
- ✅ **Manage admins** (promote/demote up to level 3)
- ✅ **Edit database**
- ❌ Restart server

**Typical Use**: Senior admins who manage the admin team

### Level 5: Owner
**Permissions**:
- ✅ **ALL PERMISSIONS**
- ✅ **Restart server**
- ✅ Manage admins (any level)
- ✅ Full database access

**Typical Use**: Server owner with complete control

---

## 📊 Database Structure

### New Tables (8 Total)

#### 1. `player_stats` - Player Statistics
Tracks detailed player statistics:
- Distance walked/driven/flown
- Vehicles/properties/businesses owned
- Jobs completed
- Money earned/spent
- Items crafted
- Fish caught
- Drugs sold

#### 2. `achievements` - Achievement Definitions
Default achievements:
- 🎯 **First Steps** - Complete first job (10 points)
- 💰 **Money Maker** - Earn $100,000 (25 points)
- 🚗 **Road Warrior** - Drive 100 km (15 points)
- ✈️ **Sky High** - Fly 50 km (20 points)
- ⏰ **Survivor** - Play 10 hours (30 points)
- ⭐ **Level Up** - Reach level 10 (20 points)
- 🏢 **Entrepreneur** - Own 3 businesses (50 points)
- 🏎️ **Vehicle Collector** - Own 10 vehicles (30 points)

#### 3. `player_achievements` - Player Progress
Tracks which achievements players have unlocked and their progress

#### 4. `admin_permissions` - Permission Definitions
Defines what each admin level can do

#### 5. `player_sessions` - Session Tracking
Records:
- Login/logout times
- Session duration
- IP address
- Disconnect reason

#### 6. `economy_logs` - Transaction History
Logs all money transactions:
- Type: earn, spend, transfer, deposit, withdraw
- Amount
- Balance before/after
- Source (job, shop, player, etc.)

#### 7. Enhanced `users` Table
**New Fields**:
- `total_playtime` - Total minutes played
- `last_ip` - Last IP address
- `is_whitelisted` - Whitelist status
- `discord_id` - Discord integration
- `two_factor_enabled` - 2FA support
- `two_factor_secret` - 2FA secret key

#### 8. Enhanced `characters` Table
**New Fields**:
- `dirty_money` - Illegal money
- `experience` - XP points
- `skill_strength` - Strength skill
- `skill_flying` - Flying skill
- `kills/deaths/arrests` - Combat stats
- `robberies_completed` - Robbery count
- `missions_completed` - Mission count
- `last_online` - Last online timestamp

---

## 🚀 How to Set Up Admin

### Method 1: Database (Recommended)
```sql
-- Make someone owner (level 5)
UPDATE users SET admin_level = 5, is_admin = 1 WHERE username = 'YourUsername';

-- Make someone admin (level 3)
UPDATE users SET admin_level = 3, is_admin = 1 WHERE username = 'AdminName';

-- Make someone moderator (level 2)
UPDATE users SET admin_level = 2, is_admin = 1 WHERE username = 'ModName';

-- Make someone helper (level 1)
UPDATE users SET admin_level = 1, is_admin = 1 WHERE username = 'HelperName';

-- Remove admin rights
UPDATE users SET admin_level = 0, is_admin = 0 WHERE username = 'PlayerName';
```

### Method 2: In-Game (Head Admin+ Only)
```
/setadmin [playerID] [level]
```

Examples:
```
/setadmin 5 3    // Make player 5 an admin
/setadmin 10 2   // Make player 10 a moderator
/setadmin 3 0    // Remove admin from player 3
```

---

## 🎯 Admin Commands by Level

### All Admins (Level 1+)
- F6 - Open admin menu
- Spectate players
- View player info
- Heal players
- View chat logs
- View reports

### Moderator+ (Level 2+)
- **Kick** players
- Spawn vehicles
- Manage whitelist
- Accept/reject reports
- Mute players

### Admin+ (Level 3+)
- **Ban** players (permanent)
- Spawn items
- Give money to players
- Modify player stats
- Manage inventory

### Head Admin+ (Level 4+)
- Promote/demote admins (up to level 3)
- Edit database
- View economy logs
- Manage achievements

### Owner (Level 5)
- **Restart server**
- Promote/demote any admin
- Full database control
- System configuration

---

## 💡 Using the Admin Menu (F6)

### Dashboard Tab
**Available to**: All admins  
**Features**:
- Live server stats
- Quick actions (heal all, repair all, etc.)
- Server announcements

### Players Tab
**Available to**: All admins  
**Features**:
- View online players
- Search players
- Click player to see actions based on your level

**Actions shown based on level**:
- Level 1: Heal, Spectate
- Level 2+: + Freeze, Kick
- Level 3+: + Ban, Give Money
- Level 4+: + Set Admin Level

### Vehicles Tab
**Available to**: Level 2+ (Moderators)  
**Features**:
- Spawn custom vehicles with RGB colors
- Quick spawn favorites
- Manage your vehicle (repair, refuel, tune, delete)

### Teleport Tab
**Available to**: All admins  
**Features**:
- 6 quick locations
- Custom coordinates
- Teleport to players

### Weather & Time Tab
**Available to**: Level 2+ (Moderators)  
**Features**:
- 6 weather types
- Set time (0-23 hours)

### Punishments Tab
**Available to**: Level 2+ (Kick), Level 3+ (Ban)  
**Features**:
- Warn system (3 warnings = auto-kick)
- Mute (5 minutes)
- Jail (10 minutes)
- Kick (Level 2+)
- Ban (Level 3+)

### Whitelist Tab
**Available to**: Level 2+ (Moderators)  
**Features**:
- Add players to whitelist
- Remove from whitelist

### Personal Tools Tab
**Available to**: All admins  
**Features**:
- NoClip mode (fly with WASD/QE/Shift)
- God mode
- Invisible mode
- Super abilities

---

## 📈 Player Statistics System

### Automatic Tracking
The system automatically tracks:
- **Distance**: Walking, driving, flying
- **Economy**: Money earned, spent
- **Ownership**: Vehicles, properties, businesses
- **Activities**: Jobs completed, items crafted
- **Combat**: Kills, deaths
- **Progression**: Level, experience

### Viewing Stats
Players can view their stats in:
- User Menu (M key)
- Web admin panel (admins only)

### Stats Usage
Stats are used for:
- Achievement progress
- Leaderboards
- Player profiles
- Analytics

---

## 🏆 Achievement System

### Categories
- **Jobs** - Job-related achievements
- **Economy** - Money achievements
- **Driving** - Driving achievements
- **Flying** - Flying achievements
- **Playtime** - Time-based achievements
- **Progression** - Level achievements
- **Business** - Business achievements
- **Vehicles** - Vehicle achievements

### How It Works
1. Player performs action (e.g., earns money)
2. System updates player_stats
3. System checks achievement requirements
4. If met, achievement unlocks
5. Player gets points and notification

### Adding New Achievements
```sql
INSERT INTO achievements (name, description, category, points, icon, requirement_type, requirement_value) 
VALUES ('Master Thief', 'Complete 100 robberies', 'Crime', 100, '🔒', 'robberies_completed', 100);
```

---

## 💰 Economy Logging

### What's Logged
Every money transaction is recorded:
- Player earns from job
- Player buys from shop
- Player transfers to another player
- Bank deposits/withdrawals
- Admin money gifts

### Log Entry Includes
- Transaction type
- Amount
- Balance before
- Balance after
- Source/destination
- Timestamp

### Admin Access
Level 4+ (Head Admin) can view economy logs to:
- Track suspicious activity
- Investigate exploits
- Analyze economy health
- Audit money transfers

---

## 🔒 Security Features

### Permission System
- Every command checks permissions
- Clear error messages
- Admin actions logged

### Session Tracking
- IP logging
- Session duration
- Disconnect reasons

### Anti-Abuse
- Confirmation dialogs for bans/kicks
- Action logging to database
- Admin level requirements

### Whitelist Support
- Restrict server access
- Manage via admin menu (Level 2+)

---

## 🎨 UI/UX Improvements

### Admin Menu
- ✅ Smooth animations
- ✅ Loading states
- ✅ Error messages
- ✅ Success feedback
- ✅ Glassmorphism design
- ✅ Permission-based visibility

### In-Game
- ✅ Color-coded messages
- ✅ Admin level badges
- ✅ Notification system
- ✅ Progress indicators

### Web Panel
- ✅ Real-time updates
- ✅ Modern dashboard
- ✅ Data visualization
- ✅ Responsive design

---

## 📝 Common Tasks

### Promote Player to Moderator
```sql
UPDATE users SET admin_level = 2, is_admin = 1 WHERE username = 'PlayerName';
```
Then tell them to relog.

### View Player Stats
```sql
SELECT * FROM player_stats WHERE character_id = [CHARACTER_ID];
```

### Check Achievement Progress
```sql
SELECT a.name, pa.progress, a.requirement_value
FROM player_achievements pa
JOIN achievements a ON pa.achievement_id = a.id
WHERE pa.character_id = [CHARACTER_ID];
```

### View Economy Logs
```sql
SELECT * FROM economy_logs 
WHERE character_id = [CHARACTER_ID] 
ORDER BY created_at DESC 
LIMIT 100;
```

### Find All Admins
```sql
SELECT username, admin_level, last_login 
FROM users 
WHERE admin_level > 0 
ORDER BY admin_level DESC;
```

---

## 🐛 Troubleshooting

### Admin Menu Won't Open (F6)
1. Check admin_level in database
2. Verify is_admin = 1
3. Relog after database change
4. Check console for errors

### Permission Denied
- Your admin level is too low
- Check required level in error message
- Contact higher admin for promotion

### Stats Not Updating
- Check if player_stats row exists
- Verify foreign keys
- Check server console for errors

### Achievements Not Unlocking
- Check achievement requirements
- Verify player_stats values
- Check achievements table exists

---

## 📊 Admin Level Comparison

| Feature | Helper | Mod | Admin | Head | Owner |
|---------|:------:|:---:|:-----:|:----:|:-----:|
| Spectate | ✅ | ✅ | ✅ | ✅ | ✅ |
| Freeze | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mute | ✅ | ✅ | ✅ | ✅ | ✅ |
| Teleport | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Logs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Kick | ❌ | ✅ | ✅ | ✅ | ✅ |
| Spawn Vehicle | ❌ | ✅ | ✅ | ✅ | ✅ |
| Whitelist | ❌ | ✅ | ✅ | ✅ | ✅ |
| Ban | ❌ | ❌ | ✅ | ✅ | ✅ |
| Spawn Item | ❌ | ❌ | ✅ | ✅ | ✅ |
| Give Money | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Admins | ❌ | ❌ | ❌ | ✅ | ✅ |
| Edit Database | ❌ | ❌ | ❌ | ✅ | ✅ |
| Restart Server | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🎓 Best Practices

### For Server Owners
1. **Start small** - Don't make everyone admin
2. **Level 2 for mods** - Most staff need only moderator
3. **Level 3 for trusted** - Only trusted admins get ban power
4. **Level 4 sparingly** - Reserve for senior management
5. **Level 5 for you** - Owner should be only level 5

### For Admins
1. **Always provide reasons** - For kicks, bans, mutes
2. **Use appropriate level** - Don't escalate unnecessarily
3. **Document actions** - System logs automatically
4. **Be professional** - Actions are visible to all
5. **Ask before major actions** - Like server restart

### For Database
1. **Regular backups** - Stats and logs are valuable
2. **Monitor economy_logs** - Watch for exploits
3. **Check player_sessions** - Track activity
4. **Review admin_logs** - Audit admin actions

---

## 📞 Support

### Documentation
- `COMPLETE_SYSTEM_GUIDE.md` - This file
- `ENHANCED_ADMIN_FEATURES.md` - Admin features guide
- `ADMIN_BUGFIX_REPORT.md` - Bug fixes
- `COMPLETE_ADMIN_FIX_SUMMARY.md` - Fix summary

### Checking Logs
- **Server Console** - Real-time errors
- **admin_logs table** - Admin actions
- **economy_logs table** - Money transactions
- **player_sessions table** - Login history

---

## ✅ Quick Reference

### Make Player Owner
```sql
UPDATE users SET admin_level = 5, is_admin = 1 WHERE username = 'YourName';
```

### View All Admins
```sql
SELECT id, username, admin_level FROM users WHERE admin_level > 0;
```

### Check Player Stats
```sql
SELECT * FROM player_stats WHERE character_id = [ID];
```

### View Recent Economy
```sql
SELECT * FROM economy_logs ORDER BY created_at DESC LIMIT 50;
```

### Find Active Sessions
```sql
SELECT * FROM player_sessions WHERE session_end IS NULL;
```

---

## 🎉 Summary

**v3.0 Features**:
- ✅ 6-level admin system
- ✅ 8 new database tables
- ✅ Permission-based commands
- ✅ Achievement system
- ✅ Statistics tracking
- ✅ Economy logging
- ✅ Session tracking
- ✅ Enhanced security
- ✅ Better UI/UX
- ✅ Comprehensive documentation

**Total Features**: 50+  
**Admin Levels**: 6 (0-5)  
**Achievements**: 8 default  
**Database Tables**: 18 total  

**Status**: ✅ **Production Ready**

---

*Guide Version: 3.0*  
*Last Updated: 2025-11-06*  
*System Status: Fully Operational*
