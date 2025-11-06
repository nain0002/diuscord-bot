# Admin Panel Database Setup Guide

## 📊 Database Structure

The admin panel now uses a **dedicated `admins` table** for better security and separation of concerns.

---

## 🗄️ Database Tables

### 1. `admins` Table (NEW)
Dedicated table for admin panel users:

```sql
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    admin_level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username)
);
```

**Admin Levels:**
- `1` - Viewer (read-only access)
- `2` - Moderator (ban/kick/warn)
- `3` - Admin (full player control)
- `4` - Super Admin (full system access)

### 2. `users` Table (Game Server)
Used by the game server for player accounts:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    social_club VARCHAR(100),
    admin_level INT DEFAULT 0,  -- For backward compatibility
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT
);
```

---

## 🚀 Automatic Setup

The admin panel **automatically creates the database structure** when you start it:

```bash
npm run admin
```

This will:
1. ✅ Create the `admins` table if it doesn't exist
2. ✅ Create default admin user if no admins exist
3. ✅ Add `admin_level` column to `users` table for backward compatibility

**Default Admin Credentials:**
```
Username: admin
Password: admin123
```
⚠️ **CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!**

---

## 🔧 Manual Database Setup

If you prefer manual setup, run these SQL commands:

### Step 1: Create Admins Table
```sql
USE ragemp_server;

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    admin_level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username)
);
```

### Step 2: Create Default Admin
```sql
-- Password is 'admin123' hashed with bcrypt
INSERT INTO admins (username, password, email, admin_level) VALUES 
('admin', '$2b$10$YourBcryptHashHere', 'admin@localhost', 4);
```

Or use the Node.js script:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

### Step 3: Add Admin Level to Users Table (Optional)
For backward compatibility:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_level INT DEFAULT 0;
```

---

## 🔐 Managing Admin Users

### Via Admin Panel API

#### Create New Admin
```bash
curl -X POST http://localhost:3000/api/admin-management/create \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newadmin",
    "password": "securepassword",
    "email": "newadmin@example.com",
    "admin_level": 3
  }'
```

#### Change Password
```bash
curl -X POST http://localhost:3000/api/admin-management/change-my-password \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "newsecurepassword"
  }'
```

#### List All Admins
```bash
curl http://localhost:3000/api/admin-management/
```

### Via MySQL Command Line

#### Create Admin
```sql
-- First, hash your password using bcrypt (strength 10)
-- Then insert:
INSERT INTO admins (username, password, email, admin_level) VALUES 
('youradmin', '$2b$10$YourHashedPasswordHere', 'your@email.com', 4);
```

#### Update Admin Password
```sql
-- First hash the new password, then:
UPDATE admins SET password = '$2b$10$NewHashedPasswordHere' WHERE username = 'admin';
```

#### Change Admin Level
```sql
UPDATE admins SET admin_level = 4 WHERE username = 'youradmin';
```

#### Deactivate Admin
```sql
UPDATE admins SET is_active = FALSE WHERE username = 'oldadmin';
```

#### List All Admins
```sql
SELECT id, username, email, admin_level, last_login, is_active FROM admins;
```

---

## 📍 Database Location

**Connection Details:**
```env
# In your .env file:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ragemp_server
DB_PORT=3306
```

**Default Database:** `ragemp_server`
**Admin Table:** `admins`
**Game Users Table:** `users`

---

## 🔄 Migration from Old System

If you're upgrading from the old admin panel:

### Option 1: Automatic (Recommended)
Just start the admin panel - it will create everything automatically:
```bash
npm run admin
```

### Option 2: Manual Migration
```sql
-- Copy admin users from users table to admins table
INSERT INTO admins (username, password, email, admin_level, created_at)
SELECT username, password, email, admin_level, created_at
FROM users
WHERE admin_level >= 3;
```

---

## 🛡️ Security Best Practices

### 1. Strong Passwords
```bash
# Generate strong password
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Change Default Admin Password
```sql
UPDATE admins SET password = '$2b$10$NewHashedPassword' WHERE username = 'admin';
```

### 3. Restrict Database Access
```sql
-- Create dedicated database user for admin panel
CREATE USER 'admin_panel'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE ON ragemp_server.* TO 'admin_panel'@'localhost';
GRANT ALL ON ragemp_server.admins TO 'admin_panel'@'localhost';
```

### 4. Regular Backups
```bash
mysqldump -u root -p ragemp_server admins > admins_backup.sql
```

---

## 🔧 Troubleshooting

### Problem: "Database connection failed"
**Solution:**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Check credentials in .env file
cat .env

# Test connection
mysql -u root -p -e "USE ragemp_server; SHOW TABLES;"
```

### Problem: "Default admin not created"
**Solution:**
```sql
-- Manually create default admin
INSERT INTO admins (username, password, admin_level) VALUES 
('admin', '$2b$10$X8JcGWzH6S5qlNzP7vQK5O8VJ6sGvqH8PJvRm5WKf5Q8F5Jf5F5F5', 4);
```

### Problem: "Can't login with admin/admin123"
**Solution:**
```sql
-- Check if admin exists
SELECT * FROM admins WHERE username = 'admin';

-- Reset password to 'admin123'
UPDATE admins SET password = '$2b$10$X8JcGWzH6S5qlNzP7vQK5O8VJ6sGvqH8PJvRm5WKf5Q8F5Jf5F5F5' 
WHERE username = 'admin';
```

### Problem: "Table admins doesn't exist"
**Solution:**
```bash
# Start admin panel - it will create the table automatically
npm run admin

# Or create manually
mysql -u root -p ragemp_server < admin-panel/setup.sql
```

---

## 📊 Database Schema Diagram

```
┌─────────────────────────────────────┐
│           admins Table              │
│  (Admin Panel Users)                │
├─────────────────────────────────────┤
│  id (PK)                            │
│  username (UNIQUE)                  │
│  password (HASHED)                  │
│  email                              │
│  admin_level (1-4)                  │
│  created_at                         │
│  last_login                         │
│  is_active                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│           users Table               │
│  (Game Server Users)                │
├─────────────────────────────────────┤
│  id (PK)                            │
│  username (UNIQUE)                  │
│  password (HASHED)                  │
│  email (UNIQUE)                     │
│  social_club                        │
│  admin_level (for backward compat)  │
│  created_at                         │
│  last_login                         │
│  is_banned                          │
│  ban_reason                         │
└─────────────────────────────────────┘
```

---

## 🎯 Quick Reference

### Environment Variables
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ragemp_server
DB_PORT=3306
```

### Default Credentials
```
URL:      http://localhost:3000
Username: admin
Password: admin123
```

### Admin Levels
```
1 = Viewer
2 = Moderator  
3 = Admin
4 = Super Admin
```

### Important Files
```
/workspace/admin-panel/database-config.js     - Database connection
/workspace/admin-panel/routes/auth.js         - Authentication
/workspace/admin-panel/routes/admin-management.js - Admin CRUD
```

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Admin panel starts without errors
- [ ] Can login with admin/admin123
- [ ] `admins` table exists in database
- [ ] Default admin user exists
- [ ] Can change password
- [ ] Can create new admin users
- [ ] Last login timestamp updates

---

## 📞 Support

If you have issues:
1. Check the console logs when starting admin panel
2. Verify database credentials in `.env`
3. Ensure MySQL is running
4. Check if `admins` table exists
5. Try manual database setup steps above

---

*Last updated: November 6, 2025*
*Admin Panel Database v2.0*
