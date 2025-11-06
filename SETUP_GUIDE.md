# RAGE:MP Roleplay Server - Setup Guide

## Prerequisites

Before setting up the server, make sure you have the following installed:

1. **RAGE:MP Server Files** - Download from [rage.mp](https://rage.mp/)
2. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
3. **MySQL Server** (v5.7 or higher) - [Download](https://dev.mysql.com/downloads/)
4. **Git** (optional) - For version control

## Installation Steps

### 1. Download RAGE:MP Server

1. Go to [https://rage.mp/](https://rage.mp/)
2. Download the RAGE:MP server files
3. Extract the server files to a directory of your choice
4. Copy all files from this repository into the RAGE:MP server directory

### 2. Setup MySQL Database

#### Option A: Automatic Setup (Recommended)

The server will automatically create all tables when it starts. Just configure your database credentials in the `.env` file.

#### Option B: Manual Setup

1. Open MySQL Workbench or command line
2. Create a new database:
   ```sql
   CREATE DATABASE ragemp_server;
   ```
3. Import the database schema:
   ```bash
   mysql -u root -p ragemp_server < database.sql
   ```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=ragemp_server
   DB_PORT=3306
   ```

### 4. Install Dependencies

Navigate to the server directory and run:

```bash
npm install
```

This will install all required Node.js packages:
- mysql2 - MySQL database driver
- bcrypt - Password hashing
- dotenv - Environment variables

### 5. Configure Server Settings

Edit `conf.json` to customize your server:

```json
{
  "maxplayers": 100,
  "name": "Your Server Name",
  "gamemode": "freeroam/roleplay",
  "port": 22005,
  "announce": true,
  "url": "http://yourwebsite.com"
}
```

### 6. Start the Server

#### Windows:
```bash
ragemp-server.exe
```

#### Linux:
```bash
./ragemp-server
```

The server should now be running! You'll see console output indicating all modules are loaded.

## Verifying Installation

1. **Database Connection**: Check console for "Connected to MySQL database successfully!"
2. **Modules Loading**: You should see messages for each loaded module:
   - [Database] Module loaded
   - [Player] Module loaded
   - [Registration] Module loaded
   - [Character] Module loaded
   - [Banking] Module loaded
   - [Shops] Module loaded
   - [Jobs] Module loaded
   - [Vehicles] Module loaded
   - [Admin] Module loaded
   - [Spawn] Module loaded

3. **Client Connection**: Connect via RAGE:MP client to `localhost:22005` (or your server IP)

## Troubleshooting

### Database Connection Failed

**Problem**: "Error connecting to database"

**Solution**:
1. Make sure MySQL server is running
2. Verify database credentials in `.env`
3. Check if database exists: `SHOW DATABASES;`
4. Grant proper privileges: `GRANT ALL PRIVILEGES ON ragemp_server.* TO 'root'@'localhost';`

### Module Not Loading

**Problem**: Specific module doesn't load

**Solution**:
1. Check console for error messages
2. Verify all files are in correct directories
3. Make sure all dependencies are installed: `npm install`

### Port Already in Use

**Problem**: "Port 22005 is already in use"

**Solution**:
1. Change port in `conf.json`
2. Or stop the process using that port

### Cannot Connect to Server

**Problem**: Client can't connect

**Solution**:
1. Make sure server is running (check console)
2. Check firewall settings - allow port 22005
3. If hosting remotely, use server IP instead of localhost
4. Verify RAGE:MP client is up to date

## Default Admin Setup

Currently, all players with "Admin" in their username have admin privileges. 

To give yourself admin:
1. Register with username containing "Admin" (e.g., "Admin_John")
2. Or modify the `isAdmin()` function in `packages/rp-server/modules/admin.js`

## Server Commands

### Player Commands
- `/help` - Show all available commands
- `/me [action]` - Roleplay action
- `/do [description]` - Describe environment
- `/try [action]` - Try an action (50% success)
- `/b [message]` - Local OOC chat
- `/stats` - View your character stats
- `/job` - View current job info
- `/quitjob` - Quit current job
- `/engine` - Toggle vehicle engine
- `/lock` - Lock/unlock vehicle

### Admin Commands
- `/givemoney [name] [amount]` - Give money to player
- `/setmoney [name] [amount]` - Set player's money
- `/tp [x] [y] [z]` - Teleport to coordinates
- `/tpto [name]` - Teleport to player
- `/veh [model]` - Spawn vehicle
- `/heal [name]` - Heal yourself or another player
- `/kick [name] [reason]` - Kick player
- `/announce [message]` - Server-wide announcement
- `/freeze [name]` - Freeze/unfreeze player
- `/getpos` - Get your current position

## Next Steps

1. **Customize the server**: Edit shop items, job locations, vehicle prices, etc.
2. **Add more features**: The codebase is modular and easy to extend
3. **Set up backups**: Regular database backups are recommended
4. **Configure admin system**: Implement proper admin levels in database
5. **Add more jobs**: Create new job types in `jobs.js`
6. **Customize UI**: Modify CEF files in `client_packages/CEF/`

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review server console logs
3. Check MySQL error logs
4. Verify all files are properly placed

## Updates

To update the server:
1. Backup your database
2. Backup your `.env` file
3. Replace server files with new version
4. Restore your `.env` file
5. Run `npm install` to update dependencies
6. Start server and verify everything works

Enjoy your RAGE:MP Roleplay Server! 🎮
