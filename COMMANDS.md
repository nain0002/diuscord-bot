# Server Commands Reference

## Player Commands

### Financial Commands

#### `/balance`
Check your current cash and bank balance.
```
Usage: /balance
Example: /balance
Output: 
  Cash: $5,000
  Bank: $10,000
```

#### `/deposit [amount]`
Deposit cash into your bank account.
```
Usage: /deposit [amount]
Example: /deposit 1000
Requirements: Must have cash on hand
```

#### `/withdraw [amount]`
Withdraw money from your bank account.
```
Usage: /withdraw [amount]
Example: /withdraw 500
Requirements: Must have sufficient bank balance
```

#### `/transfer [character_id] [amount]`
Transfer money from your bank account to another player.
```
Usage: /transfer [character_id] [amount]
Example: /transfer 5 1000
Requirements: 
  - Must have sufficient bank balance
  - Target character must exist
```

### Inventory Commands

#### `/inventory`
Open your inventory interface (can also press I key).
```
Usage: /inventory
Example: /inventory
Shows: All items in your 20-slot inventory
```

### Job Commands

#### `/job`
Display your current job and rank information.
```
Usage: /job
Example: /job
Output:
  Current Job: Police Officer
  Job Rank: 2
```

#### `/quitjob`
Quit your current job.
```
Usage: /quitjob
Example: /quitjob
Effect: Sets job to "Unemployed"
```

#### `/startwork`
Begin working your current job and receive a task.
```
Usage: /startwork
Example: /startwork
Requirements: Must have a job
```

#### `/mine`
Mine ore when working as a Miner.
```
Usage: /mine
Example: /mine
Requirements: Must be working as Miner
Progress: Shows ore count (e.g., 3/10)
```

#### `/fish`
Catch fish when working as a Fisher.
```
Usage: /fish
Example: /fish
Requirements: Must be working as Fisher
Progress: Shows fish count (e.g., 5/10)
```

### Job-Specific Commands

#### `/heal [player_id]`
Heal a nearby player (Paramedic only).
```
Usage: /heal [player_id]
Example: /heal 2
Requirements:
  - Must be a Paramedic
  - Target must be within 5 meters
Effect: Restores target's health to 100
```

#### `/repair`
Repair the vehicle you're currently in (Mechanic only).
```
Usage: /repair
Example: /repair
Requirements:
  - Must be a Mechanic
  - Must be inside a vehicle
Effect: Fully repairs vehicle
```

### Utility Commands

#### `/help`
Display list of available commands.
```
Usage: /help
Example: /help
Shows: Command list with descriptions
```

## Admin Commands

### Level 1+ Admin

#### `/givemoney [player_id] [amount]`
Give money to a player.
```
Usage: /givemoney [player_id] [amount]
Example: /givemoney 3 10000
Requirements: Admin level 1+
Effect: Adds cash to target player
```

#### `/tp [x] [y] [z]`
Teleport to specific coordinates.
```
Usage: /tp [x] [y] [z]
Example: /tp -425.5 1123.6 325.8
Requirements: Admin level 1+
```

## Interactive Commands (Key Bindings)

### E Key
Interact with nearby objects.
- **At Shop**: Opens shop menu
- **At Job Location**: Apply for job
```
Action: Press E near marker
```

### I Key
Open inventory.
```
Action: Press I anywhere
```

## Job Locations

### Police Officer
**Location:** Mission Row Police Station
- **Coordinates:** 441.5, -982.0, 30.68
- **Blip:** Blue shield
- **Ranks:** Cadet → Officer → Detective → Sergeant → Lieutenant → Captain
- **Base Salary:** $150 - $650

### Paramedic
**Location:** Pillbox Hill Medical Center
- **Coordinates:** 298.5, -584.5, 43.26
- **Blip:** Red cross
- **Ranks:** Trainee → Paramedic → Senior → Specialist → Supervisor → Chief
- **Base Salary:** $120 - $600
- **Special:** /heal command

### Mechanic
**Location:** Mechanic Shop
- **Coordinates:** -337.0, -136.0, 39.0
- **Blip:** Yellow wrench
- **Ranks:** Apprentice → Mechanic → Senior → Master → Manager
- **Base Salary:** $100 - $400
- **Special:** /repair command

### Taxi Driver
**Location:** Downtown Taxi Stand
- **Coordinates:** 895.5, -179.0, 74.7
- **Blip:** Yellow taxi
- **Ranks:** Driver → Experienced → Veteran
- **Base Salary:** $80 - $160
- **Tasks:** Pick up and deliver passengers

### Trucker
**Location:** Trucking Depot
- **Coordinates:** 900.0, -1234.0, 25.0
- **Blip:** Orange truck
- **Ranks:** Rookie → Driver → Veteran
- **Base Salary:** $90 - $180
- **Tasks:** Deliver goods to locations

### Miner
**Location:** Mining Area
- **Coordinates:** 2832.0, 2797.0, 57.0
- **Blip:** Yellow pickaxe
- **Ranks:** Novice → Miner → Expert
- **Base Salary:** $70 - $140
- **Tasks:** Use /mine to collect ore

### Fisher
**Location:** Fishing Pier
- **Coordinates:** -1816.0, -1193.0, 14.0
- **Blip:** Blue fish
- **Ranks:** Beginner → Fisher → Master
- **Base Salary:** $60 - $120
- **Tasks:** Use /fish to catch fish

### Bus Driver
**Location:** Bus Depot
- **Coordinates:** 453.0, -602.0, 28.0
- **Blip:** Orange bus
- **Ranks:** Trainee → Driver → Veteran
- **Base Salary:** $75 - $150
- **Tasks:** Complete bus route stops

## Shop Locations

### 24/7 Supermarkets
1. **Innocence Boulevard**
   - Coordinates: 1960.1, 3740.5, 32.3
   - Items: Food, drinks, cigarettes, phones

2. **Grove Street**
   - Coordinates: -47.5, -1757.5, 29.4
   - Items: Food, drinks, energy drinks

3. **Sandy Shores**
   - Coordinates: 1729.2, 6414.7, 35.0
   - Items: Basic supplies

### Clothing Store
**Vinewood Location**
- Coordinates: 72.3, -1399.1, 29.4
- Items: Various clothing items

### Ammu-Nation
**Pillbox Hill**
- Coordinates: 252.7, -50.0, 69.9
- Items: Weapons and ammunition

### Vehicle Dealership
**Premium Deluxe Motorsport**
- Coordinates: -33.8, -1102.3, 26.4
- Items: Vehicles for purchase

## Tips & Tricks

### Making Money
1. Get a job at any job location (press E)
2. Use `/startwork` to begin tasks
3. Complete tasks for payment
4. Receive automatic salary every 30 minutes

### Banking
- Keep money in bank for safety
- Use `/transfer` to pay other players
- Withdraw only what you need

### Jobs
- Higher ranks = higher salary
- Stay employed for automatic income
- Some jobs have special commands
- Complete tasks to progress faster

### Inventory Management
- 20 slot inventory limit
- Items stack automatically
- Buy items at shops (press E at marker)
- Open with I key or `/inventory`

### Safety
- Bank your money regularly
- Don't carry all cash at once
- Use transfers for large payments

## Command Aliases (Future)
These may be added in future updates:
- `/bal` → `/balance`
- `/inv` → `/inventory`
- `/give` → `/givemoney`
- `/goto` → `/tp`

---

**Need more help?** Use `/help` in-game or check the README.md file!