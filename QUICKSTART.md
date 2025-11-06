# Quick Start Guide

Get your RAGE:MP Roleplay Server running in 5 minutes!

## Prerequisites Checklist
- ✅ RAGE:MP Server installed
- ✅ Node.js installed (v14+)
- ✅ MySQL installed and running

## 5-Minute Setup

### Step 1: Database Setup (1 minute)
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE ragemp_roleplay;
EXIT;

# Import schema
mysql -u root -p ragemp_roleplay < database.sql
```

### Step 2: Install Dependencies (1 minute)
```bash
npm install
```

### Step 3: Configure Environment (1 minute)
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your MySQL password
# Change: DB_PASSWORD=your_password
```

### Step 4: Configure Server (1 minute)
Edit `conf.json`:
- Change `name` to your server name
- Adjust `maxplayers` if needed
- Keep `enable-nodejs: true`

### Step 5: Start Server (1 minute)
```bash
# Windows
server.exe

# Linux
./ragemp-server
```

## Verify Installation

You should see this output:
```
========================================
  RAGE:MP Roleplay Server Starting...  
========================================
[Database] Successfully connected to MySQL database
[Shops] Loaded 6 shops
[Jobs] Loaded 8 jobs
========================================
  Server Started Successfully!         
========================================
```

## Connect & Test

1. Open RAGE:MP client
2. Add server: `127.0.0.1:22005`
3. Connect to server
4. Register an account
5. Create a character
6. Start playing!

## First Steps In-Game

### 1. Register Account
- Username: Choose a unique username
- Email: Enter your email
- Password: At least 6 characters

### 2. Create Character
- First & Last Name
- Age: 18-100
- Gender: Male/Female
- Customize appearance

### 3. Explore Features

**Get Money:**
```
Check balance: /balance
```

**Get a Job:**
1. Find job location (check map for blips)
2. Go to job marker
3. Press E to apply
4. Use `/startwork` to begin

**Visit Shops:**
1. Find shop (24/7, clothing, etc.)
2. Press E at marker
3. Buy items

**Use Banking:**
```
/deposit 1000    # Deposit cash
/withdraw 500    # Withdraw from bank
```

## Quick Configuration

### Make Yourself Admin
```sql
mysql -u root -p
USE ragemp_roleplay;
UPDATE players SET admin_level = 3 WHERE username = 'YourUsername';
EXIT;
```

### Change Starting Money
Edit `database.sql` before importing:
```sql
money INT DEFAULT 50000,        -- Starting cash
bank_balance INT DEFAULT 100000 -- Starting bank
```

### Adjust Spawn Location
Edit `packages/rp-server/modules/character/character.js`:
```javascript
position_x: -425.517,  // Change X
position_y: 1123.620,  // Change Y
position_z: 325.8544   // Change Z
```

## Common Issues & Quick Fixes

### "Cannot connect to database"
```bash
# Check MySQL is running
sudo service mysql status

# Verify credentials in .env
cat .env
```

### "Module not found"
```bash
npm install
```

### "Port already in use"
Change port in `conf.json`:
```json
"port": 22006
```

### Login screen not showing
- Verify `client_packages/` folder exists
- Check browser console for errors
- Clear RAGE:MP cache

## Testing Checklist

- ✅ Server starts without errors
- ✅ Database connection successful
- ✅ Can connect from client
- ✅ Login screen appears
- ✅ Can register account
- ✅ Can create character
- ✅ Character spawns in game
- ✅ Commands work (/balance, /help)
- ✅ Can visit shops (press E)
- ✅ Can get a job

## Next Steps

### Basic Setup ✅
- [x] Server running
- [x] Database connected
- [x] Can play

### Recommended
- [ ] Set admin account
- [ ] Configure server name/branding
- [ ] Port forward for public access
- [ ] Setup automated backups
- [ ] Customize spawn location

### Advanced
- [ ] Add custom jobs
- [ ] Add custom shops
- [ ] Modify salary rates
- [ ] Add vehicle system
- [ ] Add property system

## Important Commands Reference

```bash
# Player Commands
/balance          # Check money
/deposit [amt]    # Deposit cash
/withdraw [amt]   # Withdraw cash
/inventory        # Open inventory
/job              # Check job
/startwork        # Start working
/help             # Command list

# Admin Commands
/givemoney [id] [amt]  # Give money
/tp [x] [y] [z]        # Teleport
```

## Resources

- **Full Documentation:** See `README.md`
- **Installation Guide:** See `INSTALLATION.md`
- **Commands Reference:** See `COMMANDS.md`
- **Database Schema:** See `database.sql`

## Need Help?

1. Check server console for errors
2. Review `README.md` for detailed info
3. Check MySQL connection
4. Verify all files are present
5. Review RAGE:MP documentation

---

## That's It! 🎉

Your server is ready! Players can now:
- Register accounts
- Create characters
- Get jobs (8 types)
- Visit shops (6 locations)
- Use banking system
- Earn money and progress

**Enjoy your RAGE:MP Roleplay Server!**

---

**Pro Tip:** Keep the console window open to monitor connections and errors.