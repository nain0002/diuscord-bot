# 🔧 Quick Fix for V3.0 Database Error

## ❌ Error You're Seeing:
```
Table 'ragemp_server.admin_permissions' doesn't exist
```

## ✅ What I Just Fixed:

The admin permissions module was trying to load before the database tables were created.

### Files Updated:
1. `packages/rp-server/modules/admin-permissions.js` - Removed auto-load
2. `packages/rp-server/modules/database.js` - Load permissions after tables created
3. `packages/rp-server/index.js` - Updated comment

---

## 🚀 How to Apply Fix:

### Option 1: Simple Restart (Recommended)
```bash
1. Stop your server
2. Just restart it
3. Tables will be created automatically
4. Permissions will load after tables are ready
```

### Option 2: Manual Table Creation (If restart doesn't work)
Run this SQL in your database:

```sql
-- Create admin_permissions table
CREATE TABLE IF NOT EXISTS admin_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_level INT NOT NULL UNIQUE,
    level_name VARCHAR(50) NOT NULL,
    can_kick BOOLEAN DEFAULT FALSE,
    can_ban BOOLEAN DEFAULT FALSE,
    can_mute BOOLEAN DEFAULT FALSE,
    can_freeze BOOLEAN DEFAULT FALSE,
    can_teleport BOOLEAN DEFAULT FALSE,
    can_spawn_vehicle BOOLEAN DEFAULT FALSE,
    can_spawn_item BOOLEAN DEFAULT FALSE,
    can_give_money BOOLEAN DEFAULT FALSE,
    can_manage_whitelist BOOLEAN DEFAULT FALSE,
    can_view_logs BOOLEAN DEFAULT FALSE,
    can_manage_admins BOOLEAN DEFAULT FALSE,
    can_edit_database BOOLEAN DEFAULT FALSE,
    can_restart_server BOOLEAN DEFAULT FALSE,
    INDEX idx_admin_level (admin_level)
);

-- Insert default permission levels
INSERT IGNORE INTO admin_permissions (
    admin_level, level_name, can_kick, can_ban, can_mute, can_freeze,
    can_teleport, can_spawn_vehicle, can_spawn_item, can_give_money,
    can_manage_whitelist, can_view_logs, can_manage_admins, can_edit_database,
    can_restart_server
) VALUES 
(0, 'Player', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
(1, 'Helper', 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0),
(2, 'Moderator', 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0),
(3, 'Admin', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0),
(4, 'Head Admin', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
(5, 'Owner', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);

-- Create player_stats table
CREATE TABLE IF NOT EXISTS player_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL UNIQUE,
    distance_walked FLOAT DEFAULT 0,
    distance_driven FLOAT DEFAULT 0,
    distance_flown FLOAT DEFAULT 0,
    vehicles_owned INT DEFAULT 0,
    properties_owned INT DEFAULT 0,
    businesses_owned INT DEFAULT 0,
    jobs_completed INT DEFAULT 0,
    money_earned BIGINT DEFAULT 0,
    money_spent BIGINT DEFAULT 0,
    items_crafted INT DEFAULT 0,
    fish_caught INT DEFAULT 0,
    drugs_sold INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_character_id (character_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    points INT DEFAULT 10,
    icon VARCHAR(255),
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);

-- Create player_achievements table
CREATE TABLE IF NOT EXISTS player_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INT DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_achievement (character_id, achievement_id),
    INDEX idx_character_id (character_id)
);

-- Create player_sessions table
CREATE TABLE IF NOT EXISTS player_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    character_id INT,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP NULL,
    duration_minutes INT DEFAULT 0,
    ip_address VARCHAR(45),
    disconnect_reason VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_session_start (session_start)
);

-- Create economy_logs table
CREATE TABLE IF NOT EXISTS economy_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    transaction_type ENUM('earn', 'spend', 'transfer', 'bank_deposit', 'bank_withdraw') NOT NULL,
    amount INT NOT NULL,
    balance_before INT NOT NULL,
    balance_after INT NOT NULL,
    source VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_character_id (character_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_created_at (created_at)
);

-- Insert default achievements
INSERT IGNORE INTO achievements (name, description, category, points, icon, requirement_type, requirement_value) 
VALUES 
('First Steps', 'Complete your first job', 'Jobs', 10, '🎯', 'jobs_completed', 1),
('Money Maker', 'Earn $100,000', 'Economy', 25, '💰', 'money_earned', 100000),
('Road Warrior', 'Drive 100 km', 'Driving', 15, '🚗', 'distance_driven', 100000),
('Sky High', 'Fly 50 km', 'Flying', 20, '✈️', 'distance_flown', 50000),
('Survivor', 'Play for 10 hours', 'Playtime', 30, '⏰', 'playtime', 600),
('Level Up', 'Reach level 10', 'Progression', 20, '⭐', 'level', 10),
('Entrepreneur', 'Own 3 businesses', 'Business', 50, '🏢', 'businesses_owned', 3),
('Vehicle Collector', 'Own 10 vehicles', 'Vehicles', 30, '🏎️', 'vehicles_owned', 10);

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_playtime INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip VARCHAR(45);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_whitelisted BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id VARCHAR(100);

-- Add new columns to characters table
ALTER TABLE characters ADD COLUMN IF NOT EXISTS dirty_money INT DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS experience INT DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_strength INT DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_flying INT DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS kills INT DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS deaths INT DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS arrests INT DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS robberies_completed INT DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS missions_completed INT DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS last_online TIMESTAMP NULL;
```

Then restart your server.

---

## ✅ Verification

After restart, you should see:
```
[Database] Connected to MySQL database successfully!
[Database] All tables created/verified successfully!
[Database] Admin permission levels initialized!
[Database] Default achievements created!
[Admin Permissions] Loaded 6 permission levels
```

---

## 🎯 Quick Test

1. Set yourself as owner:
```sql
UPDATE users SET admin_level = 5, is_admin = 1 WHERE username = 'YourName';
```

2. Relog to server

3. Press F6 - Admin menu should open!

---

## 📞 If Still Not Working

Check:
1. ✅ MySQL is running
2. ✅ Database name is correct in `.env`
3. ✅ All files are in correct location
4. ✅ No syntax errors in console

---

*Quick Fix Applied: 2025-11-06*  
*Status: ✅ Ready to Test*
