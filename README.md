# RAGE:MP Roleplay Server

A full-featured roleplay server for RAGE Multiplayer with complete player management, character system, banking, shops, and jobs.

## Features

### 🔐 Authentication System
- Player registration with email verification
- Secure login with password hashing (bcrypt)
- Ban system with reasons
- Login attempt limiting

### 👤 Character System
- Create up to 3 characters per account
- Advanced character creator with facial customization
- Character selection screen
- Persistent character data (position, health, armor)
- Auto-save every 5 minutes

### 💰 Banking System
- Individual bank accounts for each character
- Deposit and withdraw cash
- Transfer money between players
- Transaction history
- ATM commands

### 🏪 Shop System
- Multiple shop types (24/7, Clothing, Gun Store, Vehicle Dealer, Electronics)
- Pre-configured shop locations across the map
- Inventory management system (20 slot inventory)
- Item stacking
- Visual shop markers and blips

### 💼 Job System
8 fully functional jobs:
1. **Police Officer** - Law enforcement (6 ranks)
2. **Paramedic** - Medical services (6 ranks)
3. **Mechanic** - Vehicle repair and customization (5 ranks)
4. **Taxi Driver** - Transport passengers
5. **Trucker** - Deliver goods
6. **Miner** - Mine resources
7. **Fisher** - Catch and sell fish
8. **Bus Driver** - Drive bus routes

Each job includes:
- Job points with markers and blips
- Rank progression system
- Salary payments (every 30 minutes)
- Job-specific tasks and missions

### 🛠️ Admin System
- Admin levels
- Give money command
- Teleport command
- Player management

### 📊 Database
- MySQL database with complete schema
- Players, characters, bank accounts, transactions
- Shops, inventory, jobs, vehicles, properties
- Character appearance storage
- Comprehensive indexing for performance

## Installation

### Prerequisites
- RAGE:MP Server (latest version)
- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd workspace
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure database**
   - Create a MySQL database named `ragemp_roleplay`
   - Import the database schema:
```bash
mysql -u root -p ragemp_roleplay < database.sql
```

4. **Configure environment**
   - Copy `.env.example` to `.env`
   - Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ragemp_roleplay
DB_PORT=3306
```

5. **Configure RAGE:MP server**
   - Edit `conf.json` to set your server name, max players, etc.
   - The server is configured to use port 22005 by default

6. **Start the server**
   - Place this folder in your RAGE:MP server directory
   - Start your RAGE:MP server

## Directory Structure

```
workspace/
├── packages/
│   └── rp-server/              # Server-side code
│       ├── database/
│       │   └── db.js           # Database connection manager
│       ├── modules/
│       │   ├── player/
│       │   │   └── authentication.js
│       │   ├── character/
│       │   │   └── character.js
│       │   ├── banking/
│       │   │   └── banking.js
│       │   ├── shops/
│       │   │   └── shops.js
│       │   └── jobs/
│       │       └── jobs.js
│       ├── events/
│       │   └── playerEvents.js
│       ├── commands/
│       │   └── commands.js
│       ├── utils/
│       │   └── helpers.js
│       └── index.js            # Main entry point
├── client_packages/
│   ├── index.js                # Client entry point
│   └── client/
│       └── ui/                 # HTML/CSS/JS interfaces
│           ├── login.html
│           ├── character-selection.html
│           ├── character-creator.html
│           ├── shop.html
│           └── inventory.html
├── conf.json                   # Server configuration
├── database.sql                # Database schema
├── package.json                # Dependencies
├── .env.example                # Environment template
└── README.md                   # This file
```

## Commands

### Player Commands
- `/balance` - Check cash and bank balance
- `/deposit [amount]` - Deposit money to bank
- `/withdraw [amount]` - Withdraw money from bank
- `/transfer [character_id] [amount]` - Transfer money to another player
- `/inventory` - Open inventory (or press I)
- `/job` - Check current job and rank
- `/quitjob` - Quit current job
- `/startwork` - Start working your job
- `/mine` - Mine ore (when working as Miner)
- `/fish` - Catch fish (when working as Fisher)
- `/help` - Show help menu

### Job-Specific Commands
- `/heal [player_id]` - Heal a player (Paramedic only)
- `/repair` - Repair vehicle (Mechanic only, must be in vehicle)

### Admin Commands
- `/givemoney [player_id] [amount]` - Give money to player
- `/tp [x] [y] [z]` - Teleport to coordinates

## Database Schema

### Main Tables
- **players** - User accounts
- **characters** - Character data
- **character_appearance** - Facial customization
- **bank_accounts** - Bank account information
- **bank_transactions** - Transaction history
- **shops** - Shop locations and data
- **shop_items** - Items available in shops
- **inventory** - Player inventories
- **jobs** - Job definitions
- **job_ranks** - Job rank progression
- **vehicles** - Player-owned vehicles
- **properties** - Houses and businesses

## Configuration

### Server Settings (conf.json)
```json
{
  "maxplayers": 100,
  "name": "RAGE:MP Roleplay Server",
  "gamemode": "Roleplay",
  "port": 22005,
  "voiceChat": true,
  "enable-nodejs": true
}
```

### Database Settings (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ragemp_roleplay
DB_PORT=3306
```

## Features in Detail

### Character Creator
The character creator includes:
- Gender selection
- Parent inheritance (mother/father)
- Facial similarity
- 30+ facial features sliders
- Hair styles and colors
- Eye colors
- Real-time preview

### Banking System
- Automatic bank account creation
- Unique account numbers
- Transaction logging
- Secure transfers
- Interest-ready structure

### Shop System
Pre-configured shops include:
- 3x 24/7 Supermarkets (food, drinks, basic items)
- Clothing stores
- Ammu-Nation (gun store)
- Vehicle dealership
- Electronics stores

### Job System Features
- Job application at designated locations
- Rank progression with salary increases
- Active job missions with waypoints
- Automatic salary payments every 30 minutes
- Job-specific abilities and commands

## Development

### Adding New Shops
1. Add shop to database:
```sql
INSERT INTO shops (name, type, position_x, position_y, position_z, blip_sprite, blip_color)
VALUES ('Shop Name', 'Type', x, y, z, sprite, color);
```

2. Add shop items:
```sql
INSERT INTO shop_items (shop_id, item_name, item_type, price, description)
VALUES (shop_id, 'Item', 'Type', price, 'Description');
```

3. Restart server - shops load automatically

### Adding New Jobs
1. Add job to database:
```sql
INSERT INTO jobs (name, description, min_level, base_salary, max_rank)
VALUES ('Job Name', 'Description', 0, 100, 5);
```

2. Add job ranks:
```sql
INSERT INTO job_ranks (job_id, rank_level, rank_name, salary)
VALUES (job_id, 0, 'Rank Name', salary);
```

3. Add job logic in `modules/jobs/jobs.js`
4. Restart server

## Support

For issues or questions:
- Check the database connection in `.env`
- Ensure MySQL server is running
- Check server logs for errors
- Verify all dependencies are installed

## License

MIT License - Feel free to modify and use for your server

## Credits

Built with:
- RAGE Multiplayer
- Node.js
- MySQL
- bcrypt for security
- Modern HTML/CSS/JavaScript for UI

---

**Ready to play!** Configure your database, start the server, and enjoy your roleplay experience.