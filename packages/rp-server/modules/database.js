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
                // Users table
                `CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    social_club VARCHAR(100),
                    admin_level INT DEFAULT 0,
                    is_admin BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP NULL,
                    is_banned BOOLEAN DEFAULT FALSE,
                    ban_reason TEXT,
                    INDEX idx_username (username),
                    INDEX idx_email (email)
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

                // Bank accounts table
                `CREATE TABLE IF NOT EXISTS bank_accounts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    character_id INT NOT NULL,
                    account_number VARCHAR(20) UNIQUE NOT NULL,
                    balance INT DEFAULT 10000,
                    account_type VARCHAR(20) DEFAULT 'checking',
                    pin VARCHAR(4) DEFAULT '0000',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
                    INDEX idx_character_id (character_id),
                    INDEX idx_account_number (account_number)
                )`,

                // Bank transactions table
                `CREATE TABLE IF NOT EXISTS bank_transactions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    account_id INT NOT NULL,
                    transaction_type VARCHAR(20) NOT NULL,
                    amount INT NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
                    INDEX idx_account_id (account_id)
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
                )`
            ];

            for (const query of queries) {
                await pool.query(query);
            }

            // Add warnings column to characters if not exists
            try {
                await pool.query(`ALTER TABLE characters ADD COLUMN warnings INT DEFAULT 0`);
            } catch (e) {
                // Column likely already exists, ignore error
            }

            console.log('[Database] All tables created/verified successfully!');
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

    execute: async (sql, params = []) => {
        try {
            if (!pool) {
                throw new Error('Database connection not initialized. Call connect() first.');
            }
            return await pool.execute(sql, params);
        } catch (error) {
            console.error('[Database] Execute error:', error);
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
    }
};

module.exports = database;
