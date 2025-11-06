# RAGE:MP Roleplay Server + Web Admin Panel

A fully functional RAGE:MP roleplay server with a complete suite of features including player registration, character creation, banking system, shops, jobs, vehicles, **and a powerful web-based admin panel!**

## 🎮 Features

### 🎛️ **NEW: Web Admin Panel (like txAdmin!)**
- **Full web-based administration**
  - Modern, responsive dashboard
  - Real-time server statistics
  - Player management (ban, kick, view, edit)
  - Database browser and editor
  - Server configuration
  - Live logs viewer
  - WebSocket for real-time updates
- **Access from anywhere** - Browser-based control panel
- **Secure authentication** - Session-based with rate limiting
- **Professional UI** - Beautiful, modern design

### Core Systems
- ✅ **Player Registration & Authentication** - Secure account system with password hashing
- ✅ **Character Creation & Management** - Create multiple characters per account
- ✅ **MySQL Database Integration** - Persistent data storage
- ✅ **Modern UI/UX** - Beautiful CEF interfaces for all systems

### Gameplay Features
- 💰 **Banking System**
  - ATM and bank locations across the map
  - Deposit, withdraw, and transfer money
  - Transaction history
  - Account management

- 🏪 **Shop System**
  - 24/7 Stores (food, drinks, phones)
  - Clothing Stores (outfits, accessories)
  - Ammu-Nation (weapons, armor)
  - Hardware Stores (tools, equipment)
  - Multiple locations with blips on map

- 💼 **Jobs System**
  - Taxi Driver
  - Delivery Driver
  - Trucker
  - Garbage Collector
  - Bus Driver
  - Mechanic
  - Police Officer
  - Paramedic
  - Miner
  - Lumberjack
  - Dynamic task system with checkpoints
  - Earn money by completing tasks

- 🚗 **Vehicle System**
  - Vehicle dealerships
  - Purchase and own vehicles
  - Vehicle categories: Compact, Sedan, SUV, Sports, Super, Motorcycle
  - Persistent vehicle storage
  - Lock/unlock and engine control

- 👮 **Admin System**
  - Money management commands
  - Player management (kick, heal, freeze)
  - Teleportation commands
  - Vehicle spawning
  - Server announcements

### Additional Features
- 📊 **HUD System** - Real-time display of money, health, armor, and job
- 🎭 **Roleplay Commands** - /me, /do, /try, /b for immersive roleplay
- 📦 **Inventory System** - Store and manage items
- 🎨 **Character Customization** - Gender, age, appearance
- 💾 **Auto-Save** - Automatic player data saving every 5 minutes
- 📍 **Map Markers** - Visual markers for all locations (shops, jobs, ATMs, banks)

## 📋 Requirements

- RAGE:MP Server (latest version)
- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- At least 2GB RAM
- Windows or Linux operating system

## 🚀 Quick Start

1. **Download RAGE:MP Server** from [rage.mp](https://rage.mp/)

2. **Clone or download this repository** into your RAGE:MP server directory

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Configure database**:
   - Edit `.env` file with your MySQL credentials
   - Database tables will be created automatically on first run

5. **Start the game server**:
   ```bash
   # Windows
   ragemp-server.exe
   
   # Linux
   ./ragemp-server
   ```

6. **Start the admin panel** (in a new terminal):
   ```bash
   npm run admin
   ```
   Access at: `http://localhost:3000`
   Default login: `admin` / `admin123`

7. **Connect to the game server** via RAGE:MP client

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)
For admin panel guide, see [ADMIN_PANEL_GUIDE.md](ADMIN_PANEL_GUIDE.md)

## 📁 Project Structure

```
ragemp-server/
├── packages/
│   └── rp-server/           # Server-side scripts
│       ├── index.js         # Main entry point
│       └── modules/         # Feature modules
│           ├── database.js  # Database connection
│           ├── player.js    # Player management
│           ├── registration.js
│           ├── character.js
│           ├── banking.js
│           ├── shops.js
│           ├── jobs.js
│           ├── vehicles.js
│           ├── admin.js
│           └── spawn.js
├── client_packages/         # Client-side scripts
│   ├── index.js            # Client entry point
│   ├── modules/            # Client modules
│   └── CEF/                # UI files
│       ├── css/            # Stylesheets
│       ├── js/             # JavaScript
│       └── *.html          # HTML pages
├── conf.json               # Server configuration
├── package.json            # Dependencies
├── .env                    # Database credentials
└── database.sql            # Database schema
```

## 🎮 How to Play

### Getting Started
1. Connect to the server
2. Register a new account (username, password, email)
3. Create your character (name, age, gender)
4. Start playing!

### Making Money
- **Get a Job**: Visit job locations marked on the map
- **Complete Tasks**: Follow checkpoints to earn money
- **Visit Shops**: Buy items to use or sell

### Using the Banking System
- **ATMs**: Green markers across the map
- **Banks**: Blue markers with bank blips
- Press `E` near ATM/Bank to access banking menu
- Deposit cash to keep it safe
- Transfer money to other players

### Buying Vehicles
- Visit vehicle dealerships (marked on map)
- Browse different categories
- Purchase vehicles with cash
- Vehicles are saved to your character

### Roleplay Commands
- `/me [action]` - Perform a roleplay action
- `/do [description]` - Describe the environment
- `/try [action]` - Try an action (50% success rate)
- `/b [message]` - Local out-of-character chat

## 🛠️ Customization

### Adding New Jobs
Edit `packages/rp-server/modules/jobs.js` to add new job types with custom locations and rewards.

### Adding Shop Items
Edit `packages/rp-server/modules/shops.js` to add new items to shops.

### Modifying Vehicles
Edit `packages/rp-server/modules/vehicles.js` to add/remove vehicles or change prices.

### Customizing UI
Edit CEF files in `client_packages/CEF/` to change the look and feel of interfaces.

## 📝 Database Schema

The server uses the following main tables:
- `users` - Player accounts
- `characters` - Character data
- `bank_accounts` - Banking information
- `bank_transactions` - Transaction history
- `vehicles` - Player-owned vehicles
- `shops` - Shop locations
- `shop_items` - Items available in shops
- `jobs` - Job definitions
- `inventory` - Player inventory

## 🔒 Security Features

- Password hashing with bcrypt
- SQL injection prevention with prepared statements
- Input validation on all forms
- Secure session management

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📜 License

This project is open source and available under the MIT License.

## 🙏 Credits

- Built for RAGE:MP multiplayer modification
- Uses Node.js and MySQL
- Modern UI design with responsive layouts

## 📞 Support

For setup help, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

For issues and bugs, please check the troubleshooting section in the setup guide.

---

**Enjoy your RAGE:MP Roleplay Server!** 🎮🚗💰

*This is a complete, production-ready roleplay server with all essential features. Perfect for starting your own GTA V roleplay community!*
