-- RAGE:MP Roleplay Server Database Schema
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ragemp_roleplay;
USE ragemp_roleplay;

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    admin_level INT DEFAULT 0,
    banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT NULL,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female') NOT NULL,
    money INT DEFAULT 5000,
    bank_balance INT DEFAULT 10000,
    phone_number VARCHAR(15) UNIQUE,
    job VARCHAR(50) DEFAULT 'Unemployed',
    job_rank INT DEFAULT 0,
    health INT DEFAULT 100,
    armor INT DEFAULT 0,
    position_x FLOAT DEFAULT -425.517,
    position_y FLOAT DEFAULT 1123.620,
    position_z FLOAT DEFAULT 325.8544,
    dimension INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_played TIMESTAMP NULL,
    playtime INT DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_player_id (player_id),
    INDEX idx_phone (phone_number)
);

-- Character appearance table
CREATE TABLE IF NOT EXISTS character_appearance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    gender INT DEFAULT 0,
    mother INT DEFAULT 0,
    father INT DEFAULT 0,
    similarity FLOAT DEFAULT 0.5,
    skin_similarity FLOAT DEFAULT 0.5,
    eyecolor INT DEFAULT 0,
    haircolor INT DEFAULT 0,
    highlightcolor INT DEFAULT 0,
    hair INT DEFAULT 0,
    eyebrows FLOAT DEFAULT 0,
    eyebrows_color INT DEFAULT 0,
    beard FLOAT DEFAULT 0,
    beard_color INT DEFAULT 0,
    nose_width FLOAT DEFAULT 0,
    nose_height FLOAT DEFAULT 0,
    nose_length FLOAT DEFAULT 0,
    nose_bridge FLOAT DEFAULT 0,
    nose_tip FLOAT DEFAULT 0,
    nose_shift FLOAT DEFAULT 0,
    brow_height FLOAT DEFAULT 0,
    brow_width FLOAT DEFAULT 0,
    cheekbone_height FLOAT DEFAULT 0,
    cheekbone_width FLOAT DEFAULT 0,
    cheeks_width FLOAT DEFAULT 0,
    eyes FLOAT DEFAULT 0,
    lips FLOAT DEFAULT 0,
    jaw_width FLOAT DEFAULT 0,
    jaw_height FLOAT DEFAULT 0,
    chin_length FLOAT DEFAULT 0,
    chin_position FLOAT DEFAULT 0,
    chin_width FLOAT DEFAULT 0,
    chin_shape FLOAT DEFAULT 0,
    neck_width FLOAT DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_character_id (character_id)
);

-- Bank accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    balance INT DEFAULT 10000,
    account_type ENUM('Checking', 'Savings') DEFAULT 'Checking',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_character_id (character_id),
    INDEX idx_account_number (account_number)
);

-- Bank transactions table
CREATE TABLE IF NOT EXISTS bank_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    transaction_type ENUM('Deposit', 'Withdraw', 'Transfer') NOT NULL,
    amount INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
    INDEX idx_account_id (account_id),
    INDEX idx_created_at (created_at)
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    model VARCHAR(50) NOT NULL,
    plate VARCHAR(10) UNIQUE NOT NULL,
    color1 VARCHAR(50) DEFAULT 'Black',
    color2 VARCHAR(50) DEFAULT 'Black',
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    position_z FLOAT DEFAULT 0,
    rotation FLOAT DEFAULT 0,
    fuel INT DEFAULT 100,
    health INT DEFAULT 1000,
    locked BOOLEAN DEFAULT TRUE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_character_id (character_id),
    INDEX idx_plate (plate)
);

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('24/7', 'Clothing', 'Gun', 'Vehicle', 'Electronics') NOT NULL,
    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL,
    position_z FLOAT NOT NULL,
    dimension INT DEFAULT 0,
    blip_sprite INT DEFAULT 52,
    blip_color INT DEFAULT 2,
    INDEX idx_type (type)
);

-- Shop items table
CREATE TABLE IF NOT EXISTS shop_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    stock INT DEFAULT -1,
    description TEXT,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_shop_id (shop_id)
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1,
    slot INT NOT NULL,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_character_id (character_id)
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    min_level INT DEFAULT 0,
    base_salary INT DEFAULT 100,
    max_rank INT DEFAULT 5
);

-- Job ranks table
CREATE TABLE IF NOT EXISTS job_ranks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    rank_level INT NOT NULL,
    rank_name VARCHAR(50) NOT NULL,
    salary INT NOT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id)
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('House', 'Apartment', 'Business') NOT NULL,
    price INT NOT NULL,
    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL,
    position_z FLOAT NOT NULL,
    locked BOOLEAN DEFAULT TRUE,
    for_sale BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL,
    INDEX idx_character_id (character_id),
    INDEX idx_for_sale (for_sale)
);

-- Insert default shops
INSERT INTO shops (name, type, position_x, position_y, position_z, blip_sprite, blip_color) VALUES
('24/7 Supermarket - Innocence Blvd', '24/7', 1960.129, 3740.545, 32.34375, 52, 2),
('24/7 Supermarket - Grove Street', '24/7', -47.522, -1757.514, 29.421, 52, 2),
('24/7 Supermarket - Sandy Shores', '24/7', 1729.216, 6414.711, 35.03723, 52, 2),
('Clothing Store - Vinewood', 'Clothing', 72.254, -1399.102, 29.376, 73, 3),
('Ammu-Nation - Pillbox Hill', 'Gun', 252.696, -50.011, 69.941, 110, 1),
('Premium Deluxe Motorsport', 'Vehicle', -33.803, -1102.322, 26.422, 225, 4);

-- Insert default shop items for 24/7
INSERT INTO shop_items (shop_id, item_name, item_type, price, description) VALUES
(1, 'Water Bottle', 'Food', 5, 'Refreshing bottled water'),
(1, 'Sandwich', 'Food', 15, 'Delicious sandwich'),
(1, 'Energy Drink', 'Food', 10, 'Boosts your energy'),
(1, 'Cigarettes', 'Misc', 25, 'Pack of cigarettes'),
(1, 'Phone', 'Electronics', 500, 'Basic mobile phone'),
(2, 'Water Bottle', 'Food', 5, 'Refreshing bottled water'),
(2, 'Sandwich', 'Food', 15, 'Delicious sandwich'),
(2, 'Energy Drink', 'Food', 10, 'Boosts your energy'),
(3, 'Water Bottle', 'Food', 5, 'Refreshing bottled water'),
(3, 'Sandwich', 'Food', 15, 'Delicious sandwich');

-- Insert default jobs
INSERT INTO jobs (name, description, min_level, base_salary, max_rank) VALUES
('Police Officer', 'Protect and serve the citizens of Los Santos', 0, 150, 5),
('Paramedic', 'Save lives and provide medical assistance', 0, 120, 5),
('Mechanic', 'Repair and customize vehicles', 0, 100, 4),
('Taxi Driver', 'Transport citizens around the city', 0, 80, 3),
('Trucker', 'Deliver goods across San Andreas', 0, 90, 3),
('Miner', 'Extract valuable resources from mines', 0, 70, 3),
('Fisher', 'Catch fish and sell them for profit', 0, 60, 3),
('Bus Driver', 'Transport passengers on scheduled routes', 0, 75, 3);

-- Insert job ranks for Police
INSERT INTO job_ranks (job_id, rank_level, rank_name, salary) VALUES
(1, 0, 'Cadet', 150),
(1, 1, 'Officer', 200),
(1, 2, 'Detective', 300),
(1, 3, 'Sergeant', 400),
(1, 4, 'Lieutenant', 500),
(1, 5, 'Captain', 650);

-- Insert job ranks for Paramedic
INSERT INTO job_ranks (job_id, rank_level, rank_name, salary) VALUES
(2, 0, 'Trainee', 120),
(2, 1, 'Paramedic', 180),
(2, 2, 'Senior Paramedic', 250),
(2, 3, 'Specialist', 350),
(2, 4, 'Supervisor', 450),
(2, 5, 'Chief Medical Officer', 600);

-- Insert job ranks for Mechanic
INSERT INTO job_ranks (job_id, rank_level, rank_name, salary) VALUES
(3, 0, 'Apprentice', 100),
(3, 1, 'Mechanic', 150),
(3, 2, 'Senior Mechanic', 220),
(3, 3, 'Master Mechanic', 300),
(3, 4, 'Workshop Manager', 400);
