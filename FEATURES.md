# Feature Documentation

## Complete Feature List

### 1. Player Registration System

#### Features:
- Secure account creation with username, password, and email
- Password encryption using bcrypt
- Username and email uniqueness validation
- Social Club integration
- Login system with authentication
- Session management

#### Usage:
1. When joining the server, players see the authentication screen
2. New players click "Register" and fill in credentials
3. Existing players click "Login" and enter username/password
4. After authentication, players can create/select characters

---

### 2. Character Creation & Management

#### Features:
- Multiple characters per account
- Character customization:
  - First Name
  - Last Name
  - Age (18-100)
  - Gender (Male/Female)
- Character selection screen
- Character deletion option
- Persistent character data (position, stats, inventory)

#### Character Data Stored:
- Name and demographics
- Position and heading
- Health and armor
- Money (cash and bank)
- Job and rank
- Play time
- Last played timestamp

---

### 3. Banking System

#### Features:
- **ATM Locations**: 18+ ATMs across Los Santos
- **Bank Locations**: 7 major banks including Pacific Standard
- **Account System**: Automatic account creation with unique account number
- **Transactions**:
  - Deposit cash to bank
  - Withdraw cash from bank
  - Transfer money to other players
  - Transaction history (stored in database)

#### Banking Operations:
- **Deposit**: Convert cash to bank balance
- **Withdraw**: Convert bank balance to cash
- **Transfer**: Send money to other players by name
- **Check Balance**: View account details

#### Locations:
- Downtown Los Santos
- Rockford Hills
- Little Seoul
- Great Ocean Highway
- Paleto Bay
- Sandy Shores
- And many more!

---

### 4. Shop System

#### Shop Types:

**24/7 Stores** (6 locations)
- Water - $5
- Sandwich - $10
- Pizza - $15
- Burger - $12
- Coffee - $7
- Energy Drink - $8
- Chips - $6
- Phone - $500
- Cigarettes - $15
- Lighter - $5

**Clothing Stores** (4 locations)
- T-Shirt - $50
- Jeans - $75
- Jacket - $150
- Shoes - $100
- Hat - $35
- Glasses - $45
- Watch - $200
- Backpack - $80

**Ammu-Nation** (4 locations)
- Pistol - $5,000
- Pistol Ammo (50) - $250
- Flashlight - $150
- Knife - $300
- Baseball Bat - $250
- Body Armor - $500

**Hardware Stores** (2 locations)
- Lockpick - $150
- Rope - $25
- Toolbox - $500
- Fishing Rod - $350
- Shovel - $200
- Flashlight - $50

#### Features:
- Interactive shop menus with modern UI
- Quantity selection for purchases
- Automatic inventory management
- Money deduction on purchase
- Visual markers and map blips

---

### 5. Jobs System

#### Available Jobs:

**Taxi Driver**
- Location: Downtown LS
- Salary: $100-$500 per task
- Vehicle: Taxi
- Description: Transport passengers

**Delivery Driver**
- Location: Strawberry
- Salary: $150-$600 per task
- Vehicle: Boxville
- Description: Deliver packages

**Trucker**
- Location: Port of LS
- Salary: $200-$800 per task
- Vehicle: Phantom
- Description: Transport goods

**Garbage Collector**
- Location: Vespucci
- Salary: $120-$450 per task
- Vehicle: Trash Truck
- Description: Collect trash

**Bus Driver**
- Location: Downtown LS
- Salary: $130-$500 per task
- Vehicle: Bus
- Description: Drive city routes

**Mechanic**
- Location: Burton
- Salary: $180-$700 per task
- Vehicle: Towtruck
- Description: Repair vehicles

**Police Officer**
- Location: Mission Row PD
- Salary: $300-$1,200 per task
- Vehicle: Police Cruiser
- Description: Law enforcement

**Paramedic**
- Location: Pillbox Medical
- Salary: $250-$1,000 per task
- Vehicle: Ambulance
- Description: Medical assistance

**Miner**
- Location: Sandy Shores
- Salary: $150-$600 per task
- Vehicle: None
- Description: Extract resources

**Lumberjack**
- Location: Paleto Forest
- Salary: $140-$550 per task
- Vehicle: Sadler
- Description: Cut lumber

#### Job System Features:
- Dynamic checkpoint system
- Job vehicle spawning
- Real-time earnings tracking
- Completion counter
- Multiple jobs available simultaneously
- Random task locations
- Easy quit system

---

### 6. Vehicle System

#### Vehicle Categories & Prices:

**Compact Cars**
- Blista - $15,000
- Brioso R/A - $18,000
- Dilettante - $12,000
- Issi - $14,000
- Panto - $10,000

**Sedans**
- Asea - $25,000
- Asterope - $28,000
- Cognoscenti - $65,000
- Fugitive - $35,000
- Primo - $30,000

**SUVs**
- Baller - $75,000
- Cavalcade - $60,000
- FQ 2 - $45,000
- Granger - $55,000
- Seminole - $50,000

**Sports Cars**
- Alpha - $150,000
- Banshee - $180,000
- Carbonizzare - $195,000
- Comet - $175,000
- Elegy RH8 - $95,000

**Super Cars**
- Adder - $1,000,000
- Entity XF - $795,000
- Infernus - $440,000
- Vacca - $240,000
- Zentorno - $725,000

**Motorcycles**
- Akuma - $35,000
- Bagger - $40,000
- Bati 801 - $45,000
- Carbon RS - $50,000
- Hexer - $38,000

#### Features:
- Purchase vehicles from dealerships
- Unique license plates
- Persistent vehicle storage
- Vehicle spawning system
- Lock/unlock functionality
- Engine on/off control
- Vehicle ownership tracking
- Save vehicle position and state

---

### 7. Admin System

#### Admin Commands:

**Money Management:**
- `/givemoney [name] [amount]` - Give money to player
- `/setmoney [name] [amount]` - Set player's money

**Player Management:**
- `/kick [name] [reason]` - Kick player from server
- `/heal [name]` - Heal player (health + armor to 100)
- `/freeze [name]` - Freeze/unfreeze player

**Teleportation:**
- `/tp [x] [y] [z]` - Teleport to coordinates
- `/tpto [name]` - Teleport to player
- `/getpos` - Get current position

**Server Management:**
- `/veh [model]` - Spawn vehicle
- `/announce [message]` - Server-wide announcement

#### Admin Levels:
- None (0) - Regular player
- Moderator (1) - Basic commands
- Admin (2) - Money and player management
- Head Admin (3) - Advanced features
- Owner (4) - Full access

*Note: Current implementation grants admin to players with "Admin" in username. Modify `admin.js` for database-based admin system.*

---

### 8. Roleplay Commands

**Emote Commands:**
- `/me [action]` - Display roleplay action (20m radius)
  - Example: `/me takes out phone`
  - Output: `* John_Doe takes out phone`

- `/do [description]` - Describe environment (20m radius)
  - Example: `/do The phone is ringing`
  - Output: `* The phone is ringing (( John_Doe ))`

- `/try [action]` - Attempt action with 50% success (20m radius)
  - Example: `/try picks the lock`
  - Output: `* John_Doe tries to picks the lock and succeeds/fails`

**Communication:**
- `/b [message]` - Local OOC chat (20m radius)
  - Example: `/b BRB 5 mins`
  - Output: `(( John_Doe: BRB 5 mins ))`

**Animations:**
- `/sit` - Sit animation
- `/dance` - Dance animation
- `/handsup` - Hands up animation
- `/stopanim` - Stop current animation

---

### 9. HUD System

#### Display Elements:
- **Money Display**:
  - Cash on hand (green)
  - Bank balance (green)

- **Status Bars**:
  - Health bar (red gradient)
  - Armor bar (blue gradient)

- **Job Display**:
  - Current job name
  - Updates in real-time

#### Controls:
- Press `U` to toggle HUD visibility
- Updates every 100ms for accurate stats

---

### 10. Inventory System

#### Features:
- Item storage per character
- Item types:
  - Consumables (food, drinks)
  - Weapons
  - Tools
  - Clothing
  - Miscellaneous

- Quantity tracking
- Automatic stacking
- Database persistence

#### Access:
- Press `I` key to view inventory
- Purchase items from shops
- Items saved automatically

---

### 11. Database Features

#### Auto-Save System:
- Player data saved every 5 minutes
- Data saved on disconnect
- Prevents data loss

#### Stored Data:
- User accounts (encrypted passwords)
- Character information
- Bank accounts and transactions
- Vehicle ownership
- Inventory items
- Shop and job data

#### Database Tables:
- `users` - Account data
- `characters` - Character information
- `bank_accounts` - Banking data
- `bank_transactions` - Transaction history
- `vehicles` - Vehicle ownership
- `shops` - Shop locations
- `shop_items` - Available items
- `jobs` - Job definitions
- `inventory` - Player items

---

### 12. Player Commands

**Information:**
- `/help` - Display all commands
- `/stats` - View character statistics

**Jobs:**
- `/job` - View current job info
- `/quitjob` - Quit current job

**Vehicles:**
- `/engine` - Toggle vehicle engine
- `/lock` - Lock/unlock vehicle

**Roleplay:**
- `/me` - Roleplay action
- `/do` - Describe environment
- `/try` - Try action
- `/b` - Local OOC

**Animations:**
- `/sit`, `/dance`, `/handsup`, `/stopanim`

---

## Technical Features

### Security:
- ✅ Bcrypt password hashing
- ✅ SQL injection prevention
- ✅ Input validation
- ✅ Session management

### Performance:
- ✅ Efficient database queries with indexes
- ✅ Connection pooling
- ✅ Optimized client-server communication
- ✅ Minimal client-side processing

### User Experience:
- ✅ Modern, responsive UI
- ✅ Smooth animations
- ✅ Clear feedback messages
- ✅ Intuitive controls
- ✅ Map markers and blips
- ✅ Visual indicators

### Modular Architecture:
- ✅ Easy to extend
- ✅ Well-organized code
- ✅ Clear separation of concerns
- ✅ Reusable components

---

## Future Expansion Ideas

**Potential Additions:**
- Property system (houses, businesses)
- Faction/gang system
- Crafting system
- Phone system
- Vehicle modifications
- Clothing shops with try-on
- Advanced character customization
- Weather and time sync
- Whitelist system
- Admin panel UI
- Anti-cheat system
- Achievement system
- Leveling/XP system

This server provides a solid foundation for building a complete roleplay experience!
