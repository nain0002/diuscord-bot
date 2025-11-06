# 🚀 How to Start Both Servers

**IMPORTANT:** You need to run BOTH servers for full functionality!

---

## 📋 Quick Start

### Terminal 1: Admin Panel
```bash
cd C:\RAGEMP\workspace
npm run admin
```

**Wait for:**
```
Admin Panel running on http://localhost:3000
Default login: admin / admin123
```

### Terminal 2: RAGE:MP Game Server
```bash
cd C:\RAGEMP\server-files
server.exe
```

**Wait for:**
```
Server Initialization Complete!
[Admin Bridge] Connected to admin panel!
```

---

## ✅ Verification

### Admin Panel Running Successfully:
- ✅ Shows "Admin Panel running on http://localhost:3000"
- ✅ Shows "WebSocket bridge started on port 3001"
- ✅ No error messages

### Game Server Running Successfully:
- ✅ Shows "Database Connected"
- ✅ Shows "All tables created/verified"
- ✅ Shows "Admin Bridge Connected"
- ✅ Shows "Server Initialization Complete"

### Both Connected:
- ✅ Admin panel dashboard loads without errors
- ✅ Live Players tab shows "0 players online"
- ✅ WebSocket status is "connected" (green)
- ✅ Real-time updates working

---

## 🔧 Common Issues

### Issue 1: "Game server not connected"

**Symptom:** Admin panel shows this in logs

**Cause:** RAGE:MP server not running

**Fix:** Start server.exe in Terminal 2

---

### Issue 2: "Cannot read properties of undefined"

**Symptom:** Dashboard errors in admin panel

**Cause:** Database tables not created (game server not started)

**Fix:** Start RAGE:MP server - it will create tables automatically

---

### Issue 3: "Port already in use"

**Symptom:** Server fails to start

**Fix:**
- Admin Panel (3000): Change ADMIN_PORT in .env
- Game Server (22005): Change port in conf.json
- WebSocket (3001): Change in .env and admin-bridge.js

---

### Issue 4: "MySQL connection failed"

**Symptom:** Database errors

**Fix:**
1. Start MySQL service
2. Check credentials in .env
3. Create database:
   ```sql
   CREATE DATABASE ragemp_server;
   ```

---

## 📊 What Each Server Does

### Admin Panel (Port 3000)
- Web interface for server management
- Real-time dashboard
- Player management
- Database browser
- Server logs viewer

### RAGE:MP Server (Port 22005)
- Game server
- Player connections
- Game logic
- Database operations
- Sends data to admin panel

### WebSocket Bridge (Port 3001)
- Connects both servers
- Real-time communication
- Admin commands
- Live updates

---

## 🎮 Testing Everything Works

1. **Start both servers** (as shown above)

2. **Open admin panel:**
   - Browser: http://localhost:3000
   - Login: admin / admin123

3. **Connect with RAGE:MP client:**
   - Open RAGE:MP
   - F8 console
   - Type: connect localhost:22005
   - Press Enter

4. **Register in-game:**
   - Create account
   - Create character

5. **Watch admin panel:**
   - Should see player join notification
   - Player appears in Live Players
   - Chat messages show in real-time
   - Server stats update

---

## 🔄 Restart Sequence

If you need to restart:

### Restart Admin Panel Only:
```bash
# Press Ctrl+C in Terminal 1
# Then:
npm run admin
```

### Restart Game Server Only:
```bash
# Press Ctrl+C in Terminal 2
# Then:
server.exe
```

### Restart Both:
```bash
# Press Ctrl+C in both terminals
# Then start each again as shown above
```

---

## 💡 Pro Tips

1. **Use two separate terminal windows**
   - Easier to see logs from each server
   - Can restart independently

2. **Check logs for errors**
   - Admin panel logs show HTTP requests
   - Game server logs show player actions

3. **Keep terminals visible**
   - See real-time activity
   - Spot errors immediately

4. **Default credentials**
   - Admin: admin / admin123
   - **Change password immediately!**

---

## 📝 Startup Checklist

Before starting:
- [ ] MySQL server is running
- [ ] .env file configured (in workspace folder)
- [ ] Database 'ragemp_server' created
- [ ] node_modules installed (npm install)
- [ ] Files in correct locations:
  - [ ] workspace/ has package.json, admin-panel/
  - [ ] server-files/ has packages/, client_packages/

Starting:
- [ ] Terminal 1: Admin panel started
- [ ] Terminal 2: Game server started
- [ ] Admin panel accessible at http://localhost:3000
- [ ] Game server shows "Initialization Complete"
- [ ] WebSocket bridge connected

Testing:
- [ ] Admin panel dashboard loads
- [ ] No errors in console
- [ ] Can connect with RAGE:MP client
- [ ] Player join shows in admin panel
- [ ] Real-time updates working

---

## 🎯 Expected Behavior

### When Player Connects:

**Game Server Console:**
```
Player connecting: PlayerName
[Registration] Player authenticated
[Character] Character loaded: John Doe
```

**Admin Panel Console:**
```
[Admin Panel] Command received: playerJoin
[WS Bridge] Forwarding to admin clients
```

**Admin Panel Browser:**
```
✅ Player joined: John Doe
✅ Added to Live Players list
✅ Server stats updated
```

---

## 🚨 Emergency Stop

If something goes wrong:

1. **Stop both servers:**
   - Press Ctrl+C in both terminals

2. **Check logs:**
   - Look for error messages
   - Note the last successful operation

3. **Fix issue:**
   - See troubleshooting section
   - Check configuration files

4. **Restart:**
   - Follow startup sequence again

---

## 📞 Support Checklist

If you need help, provide:
- [ ] Admin panel console output
- [ ] Game server console output
- [ ] Contents of .env file (hide passwords!)
- [ ] MySQL status (running/stopped)
- [ ] Node.js version (node --version)
- [ ] Error messages (full text)

---

**Both servers working = Full functionality! 🎉**

Keep both terminals running while using the server!

---

*Last Updated: November 6, 2025*
