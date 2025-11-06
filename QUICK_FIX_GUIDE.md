# Quick Fix Guide

Common issues and their solutions.

## Database Issues

### Error: "Cannot connect to database"

**Solutions:**
1. Make sure MySQL server is running
2. Check `.env` file credentials
3. Verify database exists: `CREATE DATABASE ragemp_server;`
4. Grant permissions: `GRANT ALL PRIVILEGES ON ragemp_server.* TO 'root'@'localhost';`
5. Restart MySQL service

### Error: "Table doesn't exist"

**Solution:**
- Tables are created automatically. If not, run:
```bash
mysql -u root -p ragemp_server < database.sql
```

## Server Issues

### Error: "Port already in use"

**Solution:**
1. Change port in `conf.json`
2. Or kill process using port 22005:
```bash
# Windows
netstat -ano | findstr :22005
taskkill /PID <PID> /F

# Linux
lsof -i :22005
kill -9 <PID>
```

### Error: "Module not found"

**Solution:**
```bash
cd packages/rp-server
npm install
```

### Server crashes on start

**Check:**
1. All files in correct directories
2. `packages/rp-server/index.js` exists
3. All modules in `packages/rp-server/modules/` exist
4. Database credentials correct
5. Check console for specific error

## Client Issues

### Cannot connect to server

**Check:**
1. Server is running (check console)
2. Correct IP and port
3. Firewall allows port 22005
4. RAGE:MP client is up to date

### UI doesn't show

**Check:**
1. All CEF files exist in `client_packages/CEF/`
2. Client console (F8) for errors
3. Restart client

### E key doesn't work

**Verify:**
1. Near marker (within 2 meters)
2. Not in a vehicle
3. Client console (F8) for errors
4. interactions.js loaded (check console)

## Gameplay Issues

### Can't login after registration

**Check:**
1. Used correct username/password
2. Check database: `SELECT * FROM users WHERE username='yourname';`
3. Password was hashed correctly
4. No ban flag set

### Money not saving

**Check:**
1. Character ID is set
2. Auto-save runs (check console every 5 min)
3. Database connection active
4. Check: `SELECT * FROM characters WHERE id=<your_id>;`

### Vehicle doesn't spawn

**Check:**
1. Correct vehicle model name
2. Have enough money
3. Database entry created
4. Check console for errors
5. Try different location

### Job doesn't work

**Check:**
1. Not already on a job
2. Within 2 meters of job marker
3. Press E key
4. Check console for errors
5. Job vehicle model valid (if applicable)

## Admin Issues

### Admin commands don't work

**Current System:**
- Username must contain "Admin" (case-sensitive)

**To Fix:**
1. Edit `packages/rp-server/modules/admin.js`
2. Modify `isAdmin()` function
3. Or add admin flag to database

**Better Solution (Production):**
```sql
ALTER TABLE users ADD COLUMN admin_level INT DEFAULT 0;
UPDATE users SET admin_level = 4 WHERE username = 'YourName';
```

Then update `isAdmin()`:
```javascript
async function isAdmin(player, minLevel = 1) {
    const data = playerModule.getPlayerData(player);
    if (!data || !data.userId) return false;
    
    const users = await database.query(
        'SELECT admin_level FROM users WHERE id = ?',
        [data.userId]
    );
    
    return users.length > 0 && users[0].admin_level >= minLevel;
}
```

## Performance Issues

### Server lag

**Solutions:**
1. Increase server RAM
2. Optimize auto-save interval
3. Add indexes to database tables
4. Reduce marker render distance

### Client FPS drops

**Solutions:**
1. Reduce number of visible markers
2. Optimize HUD update interval
3. Lower GTA V graphics settings

## Development Issues

### Changes not reflecting

**Steps:**
1. Stop server
2. Clear cache (if any)
3. Restart server
4. Reconnect client
5. Hard refresh (if CEF changes): Ctrl+F5

### Can't edit files

**Check:**
1. File permissions
2. File not locked by process
3. Using correct text editor
4. UTF-8 encoding

## Database Maintenance

### Reset database (WARNING: Deletes all data!)

```sql
DROP DATABASE ragemp_server;
CREATE DATABASE ragemp_server;
USE ragemp_server;
SOURCE database.sql;
```

### Backup database

```bash
mysqldump -u root -p ragemp_server > backup_$(date +%Y%m%d).sql
```

### Restore database

```bash
mysql -u root -p ragemp_server < backup_20240101.sql
```

### View data

```sql
-- Users
SELECT * FROM users;

-- Characters
SELECT * FROM characters;

-- Bank accounts
SELECT * FROM bank_accounts;

-- Recent transactions
SELECT * FROM bank_transactions ORDER BY created_at DESC LIMIT 10;

-- Player vehicles
SELECT * FROM vehicles;
```

## Debugging Tips

### Enable detailed logging

Add to server modules:
```javascript
console.log('[DEBUG]', variable);
```

### Client console

Press `F8` in-game to see client errors

### Check player data

```javascript
// In any server module
const data = playerModule.getPlayerData(player);
console.log('[DEBUG] Player data:', data);
```

### Test database queries

```javascript
// In server console or module
const result = await database.query('SELECT * FROM users LIMIT 1');
console.log(result);
```

## Common Errors and Fixes

### "Cannot read property 'position' of undefined"

**Cause:** Player object is null/undefined
**Fix:** Always check `if (!mp.players.local) return;`

### "TypeError: Cannot read property 'money' of undefined"

**Cause:** characterData not initialized
**Fix:** Check if character is loaded before accessing data

### "Error: ER_NO_SUCH_TABLE"

**Cause:** Table doesn't exist
**Fix:** Run `database.sql` or let auto-creation run

### "EADDRINUSE"

**Cause:** Port already in use
**Fix:** Change port or kill existing process

### "ECONNREFUSED"

**Cause:** Cannot connect to MySQL
**Fix:** Start MySQL service

## Support Resources

1. **Server console** - Shows all server-side errors
2. **Client console (F8)** - Shows all client-side errors
3. **Database logs** - MySQL error log
4. **RAGE:MP Forums** - https://rage.mp/
5. **RAGE:MP Discord** - Official Discord server

## Quick Command Reference

### Test Database Connection
```bash
mysql -u root -p -e "USE ragemp_server; SHOW TABLES;"
```

### Check Server Port
```bash
# Windows
netstat -ano | findstr :22005

# Linux
netstat -tuln | grep 22005
```

### Restart Server
```bash
# Stop server (Ctrl+C)
# Then start again
./ragemp-server  # Linux
ragemp-server.exe  # Windows
```

---

**Still having issues?**

1. Check all file paths are correct
2. Verify all dependencies installed
3. Read error messages carefully
4. Check this guide for similar issues
5. Review the code for typos
