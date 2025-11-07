/**
 * Database Module
 * Handles MySQL database connection and queries
 */

const mysql = require('mysql2/promise');

let pool;

const database = {
    connect: async () => {
        try {
            pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'ragemp_server',
                port: process.env.DB_PORT || 3306,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });

            // Test connection
            const connection = await pool.getConnection();
            console.log('[Database] Connected to MySQL database successfully!');
            connection.release();

            // Create tables if they don't exist
            await database.createTables();
        } catch (error) {
            console.error('[Database] Error connecting to database:', error);
        }
    },

    createTables: async () => {
        try {
            const queries = [
                // Users table (Enhanced)
                `CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    social_club VARCHAR(100),
                    admin_level INT DEFAULT 0 COMMENT '0=Player, 1=Helper, 2=Moderator, 3=Admin, 4=HeadAdmin, 5=Owner',
                    is_admin BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP NULL,
                    is_banned BOOLEAN DEFAULT FALSE,
                    ban_reason TEXT,
                    total_playtime INT DEFAULT 0 COMMENT 'Total minutes played',
                    last_ip VARCHAR(45),
                    is_whitelisted BOOLEAN DEFAULT FALSE,
                    discord_id VARCHAR(100),
                    two_factor_enabled BOOLEAN DEFAULT FALSE,
                    two_factor_secret VARCHAR(100),
                    INDEX idx_username (username),
                    INDEX idx_email (email),
                    INDEX idx_social_club (social_club),
                    INDEX idx_admin_level (admin_level)
                )`,

                // Characters table
                `CREATE TABLE IF NOT EXISTS characters (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    first_name VARCHAR(50) NOT NULL,
                    last_name VARCHAR(50) NOT NULL,
                    char_name VARCHAR(50),
                    char_surname VARCHAR(50),
                    age INT NOT NULL,
                    gender VARCHAR(10) NOT NULL,
                    skin_data TEXT,
                    position_x FLOAT DEFAULT -1037.8,
                    position_y FLOAT DEFAULT -2738.5,
                    position_z FLOAT DEFAULT 13.8,
                    heading FLOAT DEFAULT 0,
                    health INT DEFAULT 100,
                    armor INT DEFAULT 0,
                    money INT DEFAULT 5000,
                    bank_balance INT DEFAULT 10000,
                    job VARCHAR(50) DEFAULT 'unemployed',
                    job_rank INT DEFAULT 0,
                    level INT DEFAULT 1,
                    skill_driving INT DEFAULT 0,
                    skill_shooting INT DEFAULT 0,
                    skill_stamina INT DEFAULT 0,
                    playtime INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_played TIMESTAMP NULL,
                    play_time INT DEFAULT 0,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_char_name (char_name)
                )`,

                // Bank accounts table (Enhanced for new banking system)
                `CREATE TABLE IF NOT EXISTS bank_accounts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    character_id INT NOT NULL,
                    account_number VARCHAR(20) UNIQUE NOT NULL,
                    balance BIGINT DEFAULT 10000,
                    account_type ENUM('personal', 'business', 'savings', 'manager') DEFAULT 'personal',
                    pin VARCHAR(255) NOT NULL,
                    card_number VARCHAR(16) UNIQUE,
                    status ENUM('active', 'frozen', 'closed') DEFAULT 'active',
                    interest_rate DECIMAL(5,2) DEFAULT 0.05,
                    overdraft_limit INT DEFAULT 0,
                    last_transaction TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
                    INDEX idx_character_id (character_id),
                    INDEX idx_account_number (account_number),
                    INDEX idx_card_number (card_number),
                    INDEX idx_status (status)
                )`,

                // Bank transactions table (Enhanced)
                `CREATE TABLE IF NOT EXISTS bank_transactions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    account_id INT NOT NULL,
                    transaction_type ENUM('deposit', 'withdraw', 'transfer_in', 'transfer_out', 'interest', 'fee', 'loan', 'robbery') NOT NULL,
                    amount BIGINT NOT NULL,
                    receiver_id INT NULL,
                    receiver_account VARCHAR(20) NULL,
                    description TEXT,
                    location VARCHAR(100),
                    ip_address VARCHAR(45),
                    status ENUM('pending', 'completed', 'failed', 'reversed') DEFAULT 'completed',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
                    INDEX idx_account_id (account_id),
                    INDEX idx_receiver_id (receiver_id),
                    INDEX idx_created_at (created_at),
                    INDEX idx_transaction_type (transaction_type)
                )`,

                // Vehicles table
                `CREATE TABLE IF NOT EXISTS vehicles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    character_id INT NOT NULL,
                    model VARCHAR(50) NOT NULL,
                    plate VARCHAR(10) UNIQUE NOT NULL,
                    color1 VARCHAR(50) DEFAULT '0,0,0',
                    color2 VARCHAR(50) DEFAULT '0,0,0',
                    position_x FLOAT,
                    position_y FLOAT,
                    position_z FLOAT,
                    rotation FLOAT DEFAULT 0,
                    fuel INT DEFAULT 100,
                    engine_health INT DEFAULT 1000,
                    body_health INT DEFAULT 1000,
                    locked BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
                    INDEX idx_character_id (character_id),
                    INDEX idx_plate (plate)
                )`,

                // Shops table
                `CREATE TABLE IF NOT EXISTS shops (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    position_x FLOAT NOT NULL,
                    position_y FLOAT NOT NULL,
                    position_z FLOAT NOT NULL,
                    dimension INT DEFAULT 0,
                    blip_sprite INT DEFAULT 52,
                    blip_color INT DEFAULT 2,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,

                // Shop items table
                `CREATE TABLE IF NOT EXISTS shop_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    shop_id INT NOT NULL,
                    item_name VARCHAR(100) NOT NULL,
                    item_type VARCHAR(50) NOT NULL,
                    price INT NOT NULL,
                    stock INT DEFAULT -1,
                    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
                    INDEX idx_shop_id (shop_id)
                )`,

                // Jobs table
                `CREATE TABLE IF NOT EXISTS jobs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(50) UNIQUE NOT NULL,
                    description TEXT,
                    min_salary INT DEFAULT 100,
                    max_salary INT DEFAULT 1000,
                    position_x FLOAT,
                    position_y FLOAT,
                    position_z FLOAT,
                    blip_sprite INT DEFAULT 1,
                    blip_color INT DEFAULT 5
                )`,

                // Inventory table
                `CREATE TABLE IF NOT EXISTS inventory (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    character_id INT NOT NULL,
                    item_name VARCHAR(100) NOT NULL,
                    category VARCHAR(50) DEFAULT 'misc',
                    quantity INT DEFAULT 1,
                    weight FLOAT DEFAULT 0,
                    data TEXT,
                    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
                    INDEX idx_character_id (character_id)
                )`,

                // Character appearance table
                `CREATE TABLE IF NOT EXISTS character_appearance (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    character_id INT NOT NULL UNIQUE,
                    face_preset INT DEFAULT 0,
                    nose_width INT DEFAULT 0,
                    nose_length INT DEFAULT 0,
                    jaw_width INT DEFAULT 0,
                    lip_thickness INT DEFAULT 0,
                    hair_style INT DEFAULT 0,
                    hair_color INT DEFAULT 0,
                    eye_color INT DEFAULT 0,
                    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
                    INDEX idx_character_id (character_id)
                )`,

                // Bans table
                `CREATE TABLE IF NOT EXISTS bans (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    social_club VARCHAR(100) NOT NULL,
                    character_id INT,
                    reason TEXT,
                    admin_name VARCHAR(100),
                    banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_social_club (social_club)
                )`,

                // Admin logs table
                `CREATE TABLE IF NOT EXISTS admin_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    action VARCHAR(50) NOT NULL,
                    admin_name VARCHAR(255) NOT NULL,
                    target_name VARCHAR(255),
                    reason TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_action (action),
                    INDEX idx_admin (admin_name),
                    INDEX idx_timestamp (timestamp)
                )`,

                // Whitelist table
                `CREATE TABLE IF NOT EXISTS whitelist (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    social_club VARCHAR(255) NOT NULL UNIQUE,
                    added_by VARCHAR(255),
                    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_social_club (social_club)
                )`,

                // Reports table
                `CREATE TABLE IF NOT EXISTS reports (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    reporter_id INT NOT NULL,
                    reported_id INT NOT NULL,
                    reason TEXT NOT NULL,
                    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
                    handled_by VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    handled_at TIMESTAMP NULL,
                    INDEX idx_status (status),
                    INDEX idx_reporter (reporter_id),
                    INDEX idx_reported (reported_id)
                )`,
                
                // Player statistics table (NEW)
                `CREATE TABLE IF NOT EXISTS player_stats (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    character_id INT NOT NULL UNIQUE,
                    distance_walked FLOAT DEFAULT 0,
                    distance_driven FLOAT DEFAULT 0,
                    distance_flown FLOAT DEFAULT 0,
                    vehicles_owned INT DEFAULT 0,
                    properties_owned INT DEFAULT 0,
                    businesses_owned INT DEFAULT 0,
                    jobs_completed INT DEFAULT 0,
                    money_earned BIGINT DEFAULT 0,
                    money_spent BIGINT DEFAULT 0,
                    items_crafted INT DEFAULT 0,
                    fish_caught INT DEFAULT 0,
                    drugs_sold INT DEFAULT 0,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
                    INDEX idx_character_id (character_id)
                )`,
                
                // Achievements table (NEW)
                `CREATE TABLE IF NOT EXISTS achievements (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    description TEXT NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    points INT DEFAULT 10,
                    icon VARCHAR(255),
                    requirement_type VARCHAR(50) NOT NULL COMMENT 'money, kills, distance, etc',
                    requirement_value INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_category (category)
                )`,
                
                // Player achievements table (NEW)
                `CREATE TABLE IF NOT EXISTS player_achievements (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    character_id INT NOT NULL,
                    achievement_id INT NOT NULL,
                    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    progress INT DEFAULT 0,
                    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
                    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_achievement (character_id, achievement_id),
                    INDEX idx_character_id (character_id)
                )`,
                
                // Admin permissions table (NEW)
                `CREATE TABLE IF NOT EXISTS admin_permissions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    admin_level INT NOT NULL UNIQUE,
                    level_name VARCHAR(50) NOT NULL,
                    can_kick BOOLEAN DEFAULT FALSE,
                    can_ban BOOLEAN DEFAULT FALSE,
                    can_mute BOOLEAN DEFAULT FALSE,
                    can_freeze BOOLEAN DEFAULT FALSE,
                    can_teleport BOOLEAN DEFAULT FALSE,
                    can_spawn_vehicle BOOLEAN DEFAULT FALSE,
                    can_spawn_item BOOLEAN DEFAULT FALSE,
                    can_give_money BOOLEAN DEFAULT FALSE,
                    can_manage_whitelist BOOLEAN DEFAULT FALSE,
                    can_view_logs BOOLEAN DEFAULT FALSE,
                    can_manage_admins BOOLEAN DEFAULT FALSE,
                    can_edit_database BOOLEAN DEFAULT FALSE,
                    can_restart_server BOOLEAN DEFAULT FALSE,
                    INDEX idx_admin_level (admin_level)
                )`,
                
                // Player sessions table (NEW)
                `CREATE TABLE IF NOT EXISTS player_sessions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    character_id INT,
                    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    session_end TIMESTAMP NULL,
                    duration_minutes INT DEFAULT 0,
                    ip_address VARCHAR(45),
                    disconnect_reason VARCHAR(100),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL,
                    INDEX idx_user_id (user_id),
                    INDEX idx_session_start (session_start)
                )`,
                
                // Economy logs table (NEW)
                `CREATE TABLE IF NOT EXISTS economy_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    character_id INT NOT NULL,
                    transaction_type ENUM('earn', 'spend', 'transfer', 'bank_deposit', 'bank_withdraw') NOT NULL,
                    amount INT NOT NULL,
                    balance_before INT NOT NULL,
                    balance_after INT NOT NULL,
                    source VARCHAR(100) NOT NULL COMMENT 'job, shop, player, atm, etc',
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
                    INDEX idx_character_id (character_id),
                    INDEX idx_transaction_type (transaction_type),
                    INDEX idx_created_at (created_at)
                )`,

                // Bank branches/locations table
                `CREATE TABLE IF NOT EXISTS bank_branches (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    position_x FLOAT NOT NULL,
                    position_y FLOAT NOT NULL,
                    position_z FLOAT NOT NULL,
                    vault_cash BIGINT DEFAULT 1000000,
                    status ENUM('open', 'closed', 'robbery', 'lockdown') DEFAULT 'open',
                    manager_id INT NULL,
                    last_robbery TIMESTAMP NULL,
                    robbery_cooldown INT DEFAULT 3600,
                    security_level INT DEFAULT 3,
                    blip_sprite INT DEFAULT 108,
                    blip_color INT DEFAULT 2,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_status (status),
                    INDEX idx_manager_id (manager_id)
                )`,

                // Robbery logs table
                `CREATE TABLE IF NOT EXISTS robbery_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    bank_id INT NOT NULL,
                    robber_id INT NOT NULL,
                    stolen_amount BIGINT DEFAULT 0,
                    success BOOLEAN DEFAULT FALSE,
                    police_called BOOLEAN DEFAULT FALSE,
                    arrests INT DEFAULT 0,
                    duration INT DEFAULT 0,
                    location VARCHAR(100),
                    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (bank_id) REFERENCES bank_branches(id) ON DELETE CASCADE,
                    FOREIGN KEY (robber_id) REFERENCES characters(id) ON DELETE CASCADE,
                    INDEX idx_bank_id (bank_id),
                    INDEX idx_robber_id (robber_id),
                    INDEX idx_date (date)
                )`,

                // Bank loans table
                `CREATE TABLE IF NOT EXISTS bank_loans (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    account_id INT NOT NULL,
                    amount BIGINT NOT NULL,
                    interest_rate DECIMAL(5,2) DEFAULT 5.00,
                    remaining_balance BIGINT NOT NULL,
                    monthly_payment INT DEFAULT 0,
                    status ENUM('active', 'paid', 'defaulted') DEFAULT 'active',
                    approved_by INT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    due_date TIMESTAMP NULL,
                    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
                    INDEX idx_account_id (account_id),
                    INDEX idx_status (status)
                )`,

                // ATM locations table
                `CREATE TABLE IF NOT EXISTS atm_locations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    position_x FLOAT NOT NULL,
                    position_y FLOAT NOT NULL,
                    position_z FLOAT NOT NULL,
                    heading FLOAT DEFAULT 0,
                    cash_available INT DEFAULT 50000,
                    status ENUM('active', 'empty', 'broken', 'robbed') DEFAULT 'active',
                    last_robbery TIMESTAMP NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_status (status)
                )`,

                // Bank manager permissions table
                `CREATE TABLE IF NOT EXISTS bank_manager_permissions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    character_id INT NOT NULL,
                    bank_id INT NOT NULL,
                    role ENUM('manager', 'teller', 'guard', 'employee') DEFAULT 'employee',
                    can_approve_loans BOOLEAN DEFAULT FALSE,
                    can_freeze_accounts BOOLEAN DEFAULT FALSE,
                    can_view_all_accounts BOOLEAN DEFAULT FALSE,
                    can_hire BOOLEAN DEFAULT FALSE,
                    salary INT DEFAULT 5000,
                    hired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
                    FOREIGN KEY (bank_id) REFERENCES bank_branches(id) ON DELETE CASCADE,
                    INDEX idx_character_id (character_id),
                    INDEX idx_bank_id (bank_id),
                    INDEX idx_role (role)
                )`
            ];

            for (const query of queries) {
                await pool.query(query);
            }

            // Add columns if not exists
            try {
                await pool.query(`ALTER TABLE characters ADD COLUMN warnings INT DEFAULT 0`);
            } catch (e) {
                // Column likely already exists
            }
            
            try {
                await pool.query(`ALTER TABLE characters ADD COLUMN gun_slots JSON DEFAULT NULL`);
            } catch (e) {
                // Column likely already exists
            }
            
            try {
                await pool.query(`ALTER TABLE characters ADD COLUMN hotbar JSON DEFAULT NULL`);
            } catch (e) {
                // Column likely already exists
            }
            
            try {
                await pool.query(`ALTER TABLE characters ADD COLUMN hunger INT DEFAULT 100`);
            } catch (e) {
                // Column likely already exists
            }
            
            try {
                await pool.query(`ALTER TABLE characters ADD COLUMN thirst INT DEFAULT 100`);
            } catch (e) {
                // Column likely already exists
            }
            
            try {
                await pool.query(`ALTER TABLE characters ADD COLUMN hud_settings TEXT DEFAULT NULL`);
            } catch (e) {
                // Column likely already exists
            }
            
            // Insert default admin permissions if not exists
            try {
                const permissions = [
                    [0, 'Player', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 'Helper', 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0],
                    [2, 'Moderator', 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0],
                    [3, 'Admin', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                    [4, 'Head Admin', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                    [5, 'Owner', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                ];
                
                for (const perm of permissions) {
                    await pool.query(
                        `INSERT IGNORE INTO admin_permissions (
                            admin_level, level_name, can_kick, can_ban, can_mute, can_freeze,
                            can_teleport, can_spawn_vehicle, can_spawn_item, can_give_money,
                            can_manage_whitelist, can_view_logs, can_manage_admins, can_edit_database,
                            can_restart_server
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        perm
                    );
                }
            } catch (e) {
                console.error('[Database] Error inserting admin permissions:', e.message);
            }
            
            // Insert default achievements
            try {
                const achievements = [
                    ['First Steps', 'Complete your first job', 'Jobs', 10, '🎯', 'jobs_completed', 1],
                    ['Money Maker', 'Earn $100,000', 'Economy', 25, '💰', 'money_earned', 100000],
                    ['Road Warrior', 'Drive 100 km', 'Driving', 15, '🚗', 'distance_driven', 100000],
                    ['Sky High', 'Fly 50 km', 'Flying', 20, '✈️', 'distance_flown', 50000],
                    ['Survivor', 'Play for 10 hours', 'Playtime', 30, '⏰', 'playtime', 600],
                    ['Level Up', 'Reach level 10', 'Progression', 20, '⭐', 'level', 10],
                    ['Entrepreneur', 'Own 3 businesses', 'Business', 50, '🏢', 'businesses_owned', 3],
                    ['Vehicle Collector', 'Own 10 vehicles', 'Vehicles', 30, '🏎️', 'vehicles_owned', 10]
                ];
                
                for (const ach of achievements) {
                    await pool.query(
                        `INSERT IGNORE INTO achievements (name, description, category, points, icon, requirement_type, requirement_value) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        ach
                    );
                }
            } catch (e) {
                console.error('[Database] Error inserting achievements:', e.message);
            }

            console.log('[Database] All tables created/verified successfully!');
            console.log('[Database] Admin permission levels initialized!');
            console.log('[Database] Default achievements created!');
            
            // Load admin permissions into cache after tables are ready
            try {
                const AdminPermissions = require('./admin-permissions');
                await AdminPermissions.loadPermissions();
            } catch (e) {
                console.error('[Database] Error loading admin permissions:', e.message);
            }
        } catch (error) {
            console.error('[Database] Error creating tables:', error);
        }
    },

    query: async (sql, params = []) => {
        try {
            if (!pool) {
                throw new Error('Database connection not initialized. Call connect() first.');
            }
            const [results] = await pool.query(sql, params);
            return results;
        } catch (error) {
            console.error('[Database] Query error:', error);
            throw error;
        }
    },

    getConnection: async () => {
        if (!pool) {
            throw new Error('Database connection not initialized. Call connect() first.');
        }
        return await pool.getConnection();
    },

    isConnected: () => {
        return pool !== null && pool !== undefined;
    },

    execute: async (sql, params = []) => {
        // Alias for query (they work the same with mysql2/promise)
        return await database.query(sql, params);
    }
};

module.exports = database;
