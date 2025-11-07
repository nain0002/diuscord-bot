-- RAGE:MP Roleplay Server Database Setup
-- This file contains the complete database schema
-- Run this file if you want to manually create the database structure

CREATE DATABASE IF NOT EXISTS ragemp_server;
USE ragemp_server;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    social_club VARCHAR(100),
    admin_level INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    char_name VARCHAR(50) NOT NULL,
    char_surname VARCHAR(50) NOT NULL,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_played TIMESTAMP NULL,
    play_time INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_char_name (char_name)
);

-- Bank accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    balance INT DEFAULT 10000,
    account_type VARCHAR(20) DEFAULT 'checking',
    pin VARCHAR(4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_character_id (character_id),
    INDEX idx_account_number (account_number)
);

-- Bank transactions table
CREATE TABLE IF NOT EXISTS bank_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    amount INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
    INDEX idx_account_id (account_id)
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
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
);

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
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
);

-- Shop items table
CREATE TABLE IF NOT EXISTS shop_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    stock INT DEFAULT -1,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_shop_id (shop_id)
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
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
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1,
    data TEXT,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_character_id (character_id)
);
