# Testing Checklist

Use this checklist to verify all functions are working correctly.

## ✅ Database & Connection

- [ ] Database connection successful on server start
- [ ] All tables created automatically
- [ ] No database errors in console
- [ ] .env file configured correctly

## ✅ Player Registration System

### Registration
- [ ] Can access registration screen on connect
- [ ] Username validation works (3-20 characters)
- [ ] Password validation works (minimum 6 characters)
- [ ] Email validation works
- [ ] Duplicate username prevention works
- [ ] Duplicate email prevention works
- [ ] Password is hashed in database
- [ ] Success message shows after registration

### Login
- [ ] Can switch to login tab
- [ ] Login with correct credentials works
- [ ] Login with wrong password fails
- [ ] Login with non-existent user fails
- [ ] Banned users cannot login
- [ ] Last login timestamp updates

## ✅ Character System

### Character Creation
- [ ] Character creator shows after first login
- [ ] First name validation (minimum 2 chars)
- [ ] Last name validation (minimum 2 chars)
- [ ] Age validation (18-100)
- [ ] Gender selection (male/female)
- [ ] Character name uniqueness check
- [ ] Character spawns after creation
- [ ] Bank account created automatically
- [ ] Default money given ($5,000 cash, $10,000 bank)

### Character Selection
- [ ] Character list shows for returning users
- [ ] Can select character to play
- [ ] Can create additional characters
- [ ] Can delete characters
- [ ] Character data loads correctly (position, money, etc.)

### Character Loading
- [ ] Player spawns at last saved position
- [ ] Health and armor restored
- [ ] Money displays correctly
- [ ] Job displays correctly
- [ ] Player model applies correctly (male/female)

## ✅ Banking System

### ATMs & Banks
- [ ] ATM markers visible on map
- [ ] Bank markers visible on map
- [ ] Bank blips show on radar
- [ ] Proximity detection works (2m radius)
- [ ] "Press E" prompt shows when near
- [ ] E key opens banking menu

### Banking Operations
- [ ] Banking menu opens properly
- [ ] Account balance displays
- [ ] Cash balance displays
- [ ] Account number displays
- [ ] Deposit money works
- [ ] Withdraw money works
- [ ] Transfer to another player works
- [ ] Insufficient funds error shows
- [ ] Invalid amount error shows
- [ ] Money updates in real-time
- [ ] Transactions saved to database
- [ ] Close button works

## ✅ Shop System

### Shop Locations
- [ ] 24/7 store markers visible
- [ ] Clothing store markers visible
- [ ] Ammu-Nation markers visible
- [ ] Hardware store markers visible
- [ ] All shop blips show on radar
- [ ] Proximity detection works
- [ ] E key opens shop menu

### Shop Operations
- [ ] Shop menu opens with correct items
- [ ] Item prices display correctly
- [ ] Quantity selection works
- [ ] Purchase deducts money
- [ ] Insufficient funds error shows
- [ ] Items added to inventory
- [ ] Duplicate items stack correctly
- [ ] Close button works
- [ ] I key shows inventory

## ✅ Jobs System

### Job Locations
- [ ] All 10 job markers visible
- [ ] All job blips show on radar
- [ ] Proximity detection works
- [ ] E key starts job
- [ ] Job vehicle spawns (if applicable)

### Job Operations
- [ ] Cannot start job while already on one
- [ ] Checkpoint appears after starting job
- [ ] Checkpoint blip shows on radar
- [ ] Entering checkpoint completes task
- [ ] Payment received after completion
- [ ] New checkpoint appears
- [ ] /job command shows stats
- [ ] /quitjob command works
- [ ] Job vehicle destroyed on quit
- [ ] Can start different job after quitting

### Specific Jobs
- [ ] Taxi - spawns taxi
- [ ] Delivery - spawns boxville
- [ ] Trucker - spawns phantom
- [ ] Garbage - spawns trash truck
- [ ] Bus - spawns bus
- [ ] Mechanic - spawns towtruck
- [ ] Police - spawns police car
- [ ] Paramedic - spawns ambulance
- [ ] Miner - no vehicle
- [ ] Lumberjack - spawns sadler

## ✅ Vehicle System

### Vehicle Shops
- [ ] Dealership markers visible
- [ ] Dealership blips show on radar
- [ ] E key opens vehicle menu
- [ ] All categories show (6 types)
- [ ] All vehicles listed with prices

### Vehicle Operations
- [ ] Can browse all categories
- [ ] Purchase deducts money
- [ ] Insufficient funds error shows
- [ ] Vehicle spawns near player
- [ ] License plate generated
- [ ] Vehicle saved to database
- [ ] /engine command works
- [ ] /lock command works
- [ ] Vehicle stats save on disconnect

## ✅ HUD System

- [ ] HUD visible after character spawn
- [ ] Cash amount displays and updates
- [ ] Bank amount displays and updates
- [ ] Health bar updates in real-time
- [ ] Armor bar updates in real-time
- [ ] Job displays correctly
- [ ] U key toggles HUD visibility

## ✅ Roleplay Commands

- [ ] /me command works (20m radius)
- [ ] /do command works (20m radius)
- [ ] /try command works with 50% success
- [ ] /b command works (local OOC)
- [ ] /help shows all commands
- [ ] /stats shows character info

## ✅ Animation Commands

- [ ] /sit plays sit animation
- [ ] /dance plays dance animation
- [ ] /handsup plays hands up animation
- [ ] /stopanim stops animation

## ✅ Admin Commands

### Money Management (Admin Level 2+)
- [ ] /givemoney [name] [amount] works
- [ ] /setmoney [name] [amount] works
- [ ] Target player receives money
- [ ] Both players see notification

### Player Management (Admin Level 1+)
- [ ] /heal [name] works
- [ ] /kick [name] [reason] works
- [ ] /freeze [name] works
- [ ] /announce [message] works

### Teleportation (Admin Level 1+)
- [ ] /tp [x] [y] [z] works
- [ ] /tpto [name] works
- [ ] /getpos shows coordinates

### Vehicle Spawning (Admin Level 1+)
- [ ] /veh [model] spawns vehicle
- [ ] Invalid model shows error
- [ ] Vehicle spawns near admin

## ✅ Data Persistence

### On Disconnect
- [ ] Character position saves
- [ ] Money saves (cash and bank)
- [ ] Health and armor save
- [ ] Vehicle positions save
- [ ] Inventory saves

### Auto-Save
- [ ] Auto-save runs every 5 minutes
- [ ] Console shows auto-save message
- [ ] No errors during auto-save

### On Reconnect
- [ ] All saved data loads correctly
- [ ] No data loss

## ✅ User Experience

### Performance
- [ ] No lag when opening menus
- [ ] No lag with multiple players
- [ ] No memory leaks
- [ ] No console spam

### UI/UX
- [ ] All menus are responsive
- [ ] All buttons work
- [ ] Cursor shows when needed
- [ ] Cursor hides when needed
- [ ] Text is readable
- [ ] Colors are appropriate

### Error Handling
- [ ] Invalid inputs show errors
- [ ] Errors don't crash server
- [ ] Errors logged to console
- [ ] User-friendly error messages

## ✅ Multi-Player Testing

- [ ] Multiple players can register
- [ ] Multiple players can play simultaneously
- [ ] Money transfers work between players
- [ ] Players see each other's /me, /do, /try, /b
- [ ] No data conflicts between players
- [ ] Admin commands work on other players

## ✅ Security

- [ ] Passwords stored as hashes
- [ ] SQL injection prevented
- [ ] Can't give negative money
- [ ] Can't teleport without permission
- [ ] Can't spawn vehicles without permission
- [ ] Bank transfers validate recipient

## 🐛 Known Limitations

1. **Admin System**: Currently checks for "Admin" in username. For production, implement database-based admin roles.

2. **PIN System**: Bank accounts created with default PIN "1234". Implement PIN change feature for production.

3. **Vehicle Fuel**: Basic fuel system implemented. For production, add fuel consumption and refueling.

4. **Inventory UI**: Currently shows in chat. For production, create CEF inventory UI.

5. **Phone System**: Not implemented. Add for full roleplay experience.

6. **Property System**: Not implemented. Add for full roleplay experience.

## 📝 Testing Notes

- Test with fresh database for full registration flow
- Test with existing data for persistence
- Test edge cases (negative numbers, special characters, etc.)
- Test with multiple players for synchronization
- Monitor console for errors during all operations
- Check database after operations to verify data integrity

## ✅ Final Verification

After completing all tests above:

- [ ] No errors in server console
- [ ] No errors in client console (F8)
- [ ] All features work as expected
- [ ] Database populated correctly
- [ ] Players can play without issues
- [ ] Documentation is accurate

---

**Testing Complete!** ✅

If all items are checked, the server is ready for use!
