# 🏦 Enhanced Banking & Robbery System - Installation Guide

## 📋 COMPLETE SYSTEM OVERVIEW

You now have a **production-ready**, futuristic banking and robbery system with:
- ✅ Glassmorphism UI with animated backgrounds
- ✅ Secure banking with PIN protection
- ✅ Complete robbery mechanics
- ✅ Bank Manager job system
- ✅ Credit cards and loans
- ✅ ATM network
- ✅ Full database integration

---

## 📂 FILES CREATED

### Database
```
database_banking_upgrade.sql (450+ lines)
- 8 new tables
- Stored procedures
- Views for analytics
- Default data
```

### Client-Side (CEF UI)
```
client_packages/banking/ui/
├── bank.html (550+ lines) - Main banking interface
├── bank.css (1000+ lines) - Glassmorphism styling
└── bank.js (800+ lines) - UI logic and RAGE:MP events
```

### Client Integration
```
client_packages/banking-client.js (300+ lines)
- Event handlers
- Bank/ATM interaction
- UI control
```

### Server-Side
```
packages/rp-server/modules/
├── banking/
│   └── enhanced-banking.js (700+ lines)
│       - Account management
│       - Transactions
│       - Loans
│       - Credit cards
│       - Security features
└── robbery/
    └── robbery-system.js (600+ lines)
        - Bank heists
        - ATM robberies
        - Police alerts
        - Loot system
```

### Server Integration
```
packages/rp-server/events/
└── banking-events.js (400+ lines)
    - Client-server communication
    - Event handlers
    - Manager controls
```

---

## 🚀 INSTALLATION STEPS

### Step 1: Backup Existing Data
```bash
# Backup your current database
mysqldump -u root -p ragemp_roleplay > backup_before_banking_upgrade.sql

# Backup existing banking files (if any)
cp -r packages/rp-server/modules/banking packages/rp-server/modules/banking.old
```

### Step 2: Import Database Schema
```bash
# Import the enhanced schema
mysql -u root -p ragemp_roleplay < database_banking_upgrade.sql
```

**What this does:**
- Creates 8 new tables
- Adds stored procedures for transfers
- Creates views for statistics
- Inserts 6 bank locations
- Inserts 5 ATM locations
- Adds Bank Manager job
- Sets up triggers for security

**Verify installation:**
```sql
mysql -u root -p
USE ragemp_roleplay;
SHOW TABLES;
-- Should see: bank_accounts, bank_transactions, credit_cards, bank_loans, 
-- bank_locations, atm_locations, bank_employees, robbery_logs
```

### Step 3: Install Client Files

**Create directory structure:**
```bash
mkdir -p client_packages/banking/ui
```

**Copy files:**
1. `bank.html` → `client_packages/banking/ui/bank.html`
2. `bank.css` → `client_packages/banking/ui/bank.css`
3. `bank.js` → `client_packages/banking/ui/bank.js`
4. `banking-client.js` → `client_packages/banking-client.js`

**Verify:**
```
client_packages/
├── banking/
│   └── ui/
│       ├── bank.html
│       ├── bank.css
│       └── bank.js
└── banking-client.js
```

### Step 4: Install Server Modules

**Create directory structure:**
```bash
mkdir -p packages/rp-server/modules/robbery
```

**Copy files:**
1. `enhanced-banking.js` → `packages/rp-server/modules/banking/enhanced-banking.js`
2. `robbery-system.js` → `packages/rp-server/modules/robbery/robbery-system.js`
3. `banking-events.js` → `packages/rp-server/events/banking-events.js`

**Verify:**
```
packages/rp-server/
├── modules/
│   ├── banking/
│   │   └── enhanced-banking.js
│   └── robbery/
│       └── robbery-system.js
└── events/
    └── banking-events.js
```

### Step 5: Load Event Handlers

**Edit `packages/rp-server/index.js`:**

Add this line after other event handlers are loaded:
```javascript
// Load banking and robbery events
require('./events/banking-events');
```

**Should look like:**
```javascript
// Load event handlers
require('./events/playerEvents');
require('./events/banking-events'); // Add this line

// Load commands
require('./commands/commands');
```

### Step 6: Load Client Scripts

**Edit `client_packages/index.js`:**

Add this line at the top:
```javascript
// Load banking client
require('./banking-client.js');
```

### Step 7: Create Bank Colshapes

**Add to server startup (in `packages/rp-server/index.js`):**

```javascript
// After database connection in init()
async function init() {
    // ... existing code ...
    
    // Load banks
    await loadBankLocations();
    
    // ... rest of code ...
}

async function loadBankLocations() {
    const banks = await db.query('SELECT * FROM bank_locations');
    
    banks.forEach(bank => {
        // Create colshape
        const colshape = mp.colshapes.newSphere(
            bank.position_x,
            bank.position_y,
            bank.position_z,
            5.0,
            bank.dimension
        );
        colshape.bankId = bank.id;
        colshape.bankData = bank;
        
        // Create blip
        const blip = mp.blips.new(bank.blip_sprite, 
            new mp.Vector3(bank.position_x, bank.position_y, bank.position_z),
            {
                name: bank.name,
                color: bank.blip_color,
                shortRange: true,
                dimension: bank.dimension
            }
        );
    });
    
    console.log(`[Banking] Loaded ${banks.length} bank locations`);
}

// Load ATM locations
async function loadATMLocations() {
    const atms = await db.query('SELECT * FROM atm_locations WHERE status = \'Active\'');
    
    atms.forEach(atm => {
        const colshape = mp.colshapes.newSphere(
            atm.position_x,
            atm.position_y,
            atm.position_z,
            2.0
        );
        colshape.atmId = atm.id;
        colshape.atmData = atm;
    });
    
    console.log(`[Banking] Loaded ${atms.length} ATM locations`);
}
```

### Step 8: Test the System

1. **Start the server:**
```bash
# Your normal server start command
./ragemp-server
```

2. **Check console output:**
```
[Database] Successfully connected to MySQL database
[Banking] Loaded 6 bank locations
[Banking] Loaded 5 ATM locations
[Events] Banking and robbery events loaded
[Banking Client] Banking client scripts loaded
```

3. **Connect to the server**

4. **Go to a bank location:**
   - Pacific Standard Bank: GPS location
   - Fleeca Bank Legion Square: Near Maze Bank
   - Check map for bank blips

5. **Press E to open banking interface**

6. **Test features:**
   - ✅ Deposit cash
   - ✅ Withdraw money (requires PIN)
   - ✅ Transfer to another player
   - ✅ Apply for loan
   - ✅ Request credit card
   - ✅ View transaction history

---

## ⚙️ CONFIGURATION

### Modify Default Values

**Starting Balance:**
Edit `database_banking_upgrade.sql`:
```sql
balance DECIMAL(15,2) DEFAULT 10000.00, -- Change this
```

**Transaction Fee:**
Edit `packages/rp-server/modules/banking/enhanced-banking.js`:
```javascript
const fee = Math.floor(amount * 0.01); // Change 0.01 to your percentage
```

**Robbery Cooldown:**
Edit `packages/rp-server/modules/robbery/robbery-system.js`:
```javascript
this.COOLDOWN_TIME = 30 * 60 * 1000; // Change 30 minutes
this.ROBBERY_DURATION = 5 * 60 * 1000; // Change 5 minutes
this.MIN_POLICE = 2; // Change minimum police
```

**Interest Rate:**
Edit database or per-account:
```sql
UPDATE bank_accounts SET interest_rate = 0.10 WHERE account_type = 'Savings';
```

---

## 🎮 PLAYER GUIDE

### Basic Banking

**Opening the Bank:**
1. Go to any bank (marked on map with 💵 icon)
2. Enter the building
3. Press `E` when prompted
4. Banking interface opens

**Making Deposits:**
1. Click "Deposit" tab
2. Enter amount or use slider
3. Click quick amount buttons for fast deposit
4. Click "Deposit" button
5. Money transferred instantly

**Withdrawing Money:**
1. Click "Withdraw" tab
2. Enter amount
3. Click "Withdraw"
4. Enter your 4-digit PIN
5. Confirm

**Transferring Money:**
1. Click "Transfer" tab
2. Enter recipient account number (ACC-XXXXXX) or player ID
3. Click 🔍 to verify recipient
4. Enter amount and optional note
5. Review fee (1%)
6. Enter PIN
7. Confirm

### Advanced Features

**Applying for Loans:**
1. Click "Loans" tab
2. Enter desired amount ($1,000 - $100,000)
3. Select term (6, 12, 24, or 36 months)
4. Review monthly payment and total repayment
5. Click "Apply for Loan"
6. Wait for manager approval

**Requesting Credit Cards:**
1. Click "Cards" tab
2. Click "Request New Card"
3. Card issued instantly
4. Note your default PIN (1234)
5. Change PIN at any ATM
6. Maximum 3 cards per account

**Viewing History:**
1. Click "History" tab
2. See all transactions
3. Filter by type (deposits, withdrawals, transfers)
4. Filter by date
5. Navigate pages

### Security Tips

1. **Change your PIN immediately:**
   - Default PIN is 1234
   - Use `/changepin` command or ATM

2. **Never share your account number with untrusted players**

3. **Check transaction history regularly**

4. **Report suspicious activity to bank managers**

---

## 👔 BANK MANAGER GUIDE

### Becoming a Manager

**Get the job:**
```sql
-- Admin can set via database
UPDATE characters SET job = 'Bank Manager', job_rank = 0 WHERE id = YOUR_CHARACTER_ID;
```

Or use in-game job application system at bank locations.

### Manager Dashboard

**Access:**
1. Open bank interface
2. "Manager" tab appears in navigation
3. Click to open dashboard

**Features:**
- View total accounts
- See total balance across all accounts
- Monitor today's transactions
- See pending loan applications

**Actions:**
1. **View All Accounts** - See every account in the system
2. **Approve Loans** - Review and approve/deny pending loans
3. **Security Settings** - Configure bank security
4. **Initiate Lockdown** - Emergency lockdown (stops robberies)

### Handling Robberies

**When Robbery Occurs:**
1. Red alert appears on screen
2. Bank alarm activates
3. You receive notification

**Your Options:**
1. Call police (automatic alert)
2. Initiate lockdown to stop robbery
3. Review security footage (future feature)

**After Robbery:**
1. Review robbery logs
2. Check stolen amount
3. Adjust security level
4. Replenish vault cash

---

## 🚨 ROBBERY SYSTEM

### For Robbers

**Requirements:**
- Drill, C4, or Hacking Device
- Minimum 2 police online
- Bank not on cooldown

**Starting a Heist:**
1. Go to bank with tools
2. Use `/robbank` command or interact with vault
3. Robbery timer starts (5 minutes)
4. Police get alerted after 30 seconds

**During Robbery:**
- Stay in bank area
- Progress bar shows vault opening
- Police will be dispatched
- Escape when complete

**Loot:**
- Money bag with serial number
- Amount depends on bank vault
- Traceable by police
- Must launder or sell

**Cooldown:**
- 30 minutes per bank
- Cannot rob same bank during cooldown

### ATM Robberies

**Requirements:**
- Crowbar or C4
- ATM not recently robbed

**Process:**
1. Find ATM
2. Use tool on ATM
3. Wait 30 seconds
4. Receive cash directly
5. Police alerted

**Reward:**
- 10-30% of ATM cash
- Immediate cash (no money bag)
- Lower risk than bank

---

## 🔧 TROUBLESHOOTING

### Bank Interface Won't Open
```
Issue: Nothing happens when pressing E
Solution:
1. Check console for errors
2. Verify colshapes created: mp.colshapes.toArray()
3. Check if near bank location
4. Restart client
```

### Database Connection Errors
```
Issue: [Database] Connection error
Solution:
1. Check .env file credentials
2. Verify MySQL is running: service mysql status
3. Test connection: mysql -u root -p ragemp_roleplay
4. Check firewall rules
```

### UI Not Loading
```
Issue: Black screen or no UI
Solution:
1. Verify files in client_packages/banking/ui/
2. Check browser console (F12 in CEF debugger)
3. Clear RAGE:MP cache
4. Restart server
```

### Transactions Failing
```
Issue: "Transaction failed" errors
Solution:
1. Check database locks: SHOW PROCESSLIST;
2. Verify account status: SELECT * FROM bank_accounts WHERE character_id = X;
3. Check balance: Ensure sufficient funds
4. Review logs in server console
```

### Robbery Not Starting
```
Issue: Cannot start robbery
Solution:
1. Check police count: Must have 2+ online
2. Verify cooldown: Check robbery_cooldowns table
3. Ensure you have required tool
4. Check bank status: Not in lockdown
```

---

## 📊 DATABASE MAINTENANCE

### Regular Tasks

**Daily:**
```sql
-- Clean old sessions
UPDATE bank_accounts SET session_id = NULL WHERE last_access < DATE_SUB(NOW(), INTERVAL 1 DAY);

-- Reset robbed ATMs
UPDATE atm_locations SET status = 'Active' WHERE status = 'Robbed' AND last_robbery < DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

**Weekly:**
```sql
-- Archive old transactions (optional)
INSERT INTO bank_transactions_archive SELECT * FROM bank_transactions WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);
DELETE FROM bank_transactions WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Apply interest
CALL ApplyMonthlyInterest(); -- If you create this procedure
```

**Monthly:**
```sql
-- Backup database
mysqldump -u root -p ragemp_roleplay > backup_monthly.sql

-- Analyze tables
ANALYZE TABLE bank_accounts, bank_transactions, credit_cards, bank_loans;

-- Optimize tables
OPTIMIZE TABLE bank_accounts, bank_transactions;
```

### Monitoring Queries

**Check system health:**
```sql
-- Total accounts
SELECT COUNT(*) as total_accounts FROM bank_accounts WHERE status = 'Active';

-- Total balance in system
SELECT SUM(balance) as total_balance FROM bank_accounts;

-- Today's transactions
SELECT COUNT(*) as today_transactions FROM bank_transactions WHERE DATE(timestamp) = CURDATE();

-- Successful robberies this week
SELECT COUNT(*) as robberies FROM robbery_logs WHERE success = TRUE AND date > DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Top accounts
SELECT account_number, balance FROM bank_accounts ORDER BY balance DESC LIMIT 10;
```

---

## 🎯 NEXT STEPS

### After Installation:

1. ✅ **Test all features:**
   - Deposit/withdraw
   - Transfers
   - Loans
   - Cards
   - Manager dashboard

2. ✅ **Configure settings:**
   - Adjust fees
   - Set interest rates
   - Configure cooldowns

3. ✅ **Train staff:**
   - Assign managers
   - Train on approval process
   - Set security protocols

4. ✅ **Announce to players:**
   - New banking system available
   - Show features
   - Explain benefits

5. ✅ **Monitor performance:**
   - Check logs
   - Review transactions
   - Optimize as needed

---

## 📞 SUPPORT

**Issues?**
1. Check this guide
2. Review console logs (both client and server)
3. Verify database connection
4. Check file permissions
5. Test in development first

**Common Commands:**
```bash
# Check MySQL status
sudo service mysql status

# View server logs
tail -f server.log

# Test database connection
mysql -u root -p ragemp_roleplay -e "SELECT COUNT(*) FROM bank_accounts;"
```

---

## 🎉 YOU'RE DONE!

Your **Enhanced Banking & Robbery System** is now fully installed and ready!

**What you have:**
- ✅ Futuristic glassmorphism UI
- ✅ Secure PIN-protected banking
- ✅ Complete robbery mechanics
- ✅ Bank Manager job system
- ✅ Loans and credit cards
- ✅ Full transaction history
- ✅ ATM network
- ✅ Anti-exploit security

**Enjoy your new banking system!** 🏦💰

---

*Version 1.0.0 - Complete Installation Guide*
*Last Updated: 2025-11-06*