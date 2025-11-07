-- COMPLETE MERGED DATABASE SCHEMA
-- RAGE:MP Roleplay Server with Enhanced Banking & Robbery System
-- This file merges database.sql and database_banking_upgrade.sql

CREATE DATABASE IF NOT EXISTS ragemp_roleplay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ragemp_roleplay;

-- ==================== PLAYER & CHARACTER TABLES ====================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
    credit_score INT DEFAULT 500,
    total_debt DECIMAL(15,2) DEFAULT 0,
    vip_status BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_player_id (player_id),
    INDEX idx_phone (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== ENHANCED BANKING TABLES ====================

-- Enhanced bank accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    balance DECIMAL(15,2) DEFAULT 10000.00,
    account_type ENUM('Personal', 'Business', 'Savings', 'Manager') DEFAULT 'Personal',
    pin VARCHAR(255) NOT NULL,
    status ENUM('Active', 'Frozen', 'Closed', 'Suspended') DEFAULT 'Active',
    interest_rate DECIMAL(5,2) DEFAULT 0.05,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_access TIMESTAMP NULL,
    total_deposits DECIMAL(15,2) DEFAULT 0,
    total_withdrawals DECIMAL(15,2) DEFAULT 0,
    session_id VARCHAR(100) NULL,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_character_id (character_id),
    INDEX idx_account_number (account_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Enhanced transactions table (FIXED: standardized timestamp column)
CREATE TABLE IF NOT EXISTS bank_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    transaction_type ENUM('Deposit', 'Withdraw', 'Transfer_In', 'Transfer_Out', 'Interest', 'Fee', 'Loan', 'Robbery') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    receiver_id INT NULL,
    receiver_account VARCHAR(20) NULL,
    description TEXT,
    location VARCHAR(100),
    ip_address VARCHAR(45) NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Completed', 'Failed', 'Cancelled') DEFAULT 'Completed',
    reference_number VARCHAR(50) UNIQUE,
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
    INDEX idx_account_id (account_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_type (transaction_type),
    INDEX idx_reference (reference_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Credit cards table
CREATE TABLE IF NOT EXISTS credit_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    card_number VARCHAR(19) UNIQUE NOT NULL,
    card_holder VARCHAR(100) NOT NULL,
    cvv VARCHAR(255) NOT NULL,
    expiry_date DATE NOT NULL,
    card_type ENUM('Debit', 'Credit', 'Platinum', 'Black') DEFAULT 'Debit',
    credit_limit DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) DEFAULT 0,
    status ENUM('Active', 'Blocked', 'Expired', 'Lost') DEFAULT 'Active',
    pin VARCHAR(255) NOT NULL,
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
    INDEX idx_card_number (card_number),
    INDEX idx_account_id (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bank loans table
CREATE TABLE IF NOT EXISTS bank_loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    loan_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    remaining_balance DECIMAL(15,2) NOT NULL,
    monthly_payment DECIMAL(10,2) NOT NULL,
    loan_term INT NOT NULL,
    payments_made INT DEFAULT 0,
    status ENUM('Pending', 'Approved', 'Active', 'Paid', 'Defaulted', 'Denied') DEFAULT 'Pending',
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    collateral TEXT,
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
    INDEX idx_account_id (account_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bank locations table
CREATE TABLE IF NOT EXISTS bank_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL,
    position_z FLOAT NOT NULL,
    dimension INT DEFAULT 0,
    vault_cash DECIMAL(15,2) DEFAULT 500000.00,
    max_vault_cash DECIMAL(15,2) DEFAULT 1000000.00,
    security_level INT DEFAULT 3,
    robbery_cooldown TIMESTAMP NULL,
    last_robbed TIMESTAMP NULL,
    total_robberies INT DEFAULT 0,
    alarm_active BOOLEAN DEFAULT FALSE,
    lockdown_active BOOLEAN DEFAULT FALSE,
    manager_id INT NULL,
    blip_sprite INT DEFAULT 108,
    blip_color INT DEFAULT 2,
    INDEX idx_manager (manager_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ATM locations table
CREATE TABLE IF NOT EXISTS atm_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL,
    position_z FLOAT NOT NULL,
    rotation FLOAT DEFAULT 0,
    model VARCHAR(50) DEFAULT 'prop_atm_01',
    status ENUM('Active', 'Offline', 'Robbed', 'Maintenance') DEFAULT 'Active',
    cash_available DECIMAL(10,2) DEFAULT 50000.00,
    last_robbery TIMESTAMP NULL,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bank employees table
CREATE TABLE IF NOT EXISTS bank_employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    bank_id INT NOT NULL,
    position ENUM('Manager', 'Teller', 'Security', 'Advisor') NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    permissions JSON,
    hired_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Active', 'On_Leave', 'Fired', 'Resigned') DEFAULT 'Active',
    performance_score INT DEFAULT 50,
    total_earnings DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_id) REFERENCES bank_locations(id) ON DELETE CASCADE,
    INDEX idx_character (character_id),
    INDEX idx_bank (bank_id),
    INDEX idx_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Robbery logs table
CREATE TABLE IF NOT EXISTS robbery_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bank_id INT NOT NULL,
    robber_id INT NOT NULL,
    robber_name VARCHAR(100),
    stolen_amount DECIMAL(15,2) DEFAULT 0,
    success BOOLEAN DEFAULT FALSE,
    method ENUM('Drill', 'Explosives', 'Hack', 'Inside_Job') NOT NULL,
    participants JSON,
    police_response_time INT DEFAULT 0,
    duration INT DEFAULT 0,
    caught BOOLEAN DEFAULT FALSE,
    escape_route VARCHAR(200),
    evidence_left JSON,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_id) REFERENCES bank_locations(id) ON DELETE CASCADE,
    FOREIGN KEY (robber_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_bank (bank_id),
    INDEX idx_robber (robber_id),
    INDEX idx_date (date),
    INDEX idx_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== SHOPS & INVENTORY TABLES ====================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1,
    slot INT NOT NULL,
    description TEXT NULL,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_character_id (character_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== JOBS TABLES ====================

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    min_level INT DEFAULT 0,
    base_salary INT DEFAULT 100,
    max_rank INT DEFAULT 5,
    bank_access BOOLEAN DEFAULT FALSE,
    manager_permissions JSON
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Job ranks table
CREATE TABLE IF NOT EXISTS job_ranks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    rank_level INT NOT NULL,
    rank_name VARCHAR(50) NOT NULL,
    salary INT NOT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== VEHICLES TABLE ====================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== PROPERTIES TABLE ====================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== INSERT DEFAULT DATA ====================

-- Insert default shops
INSERT INTO shops (name, type, position_x, position_y, position_z, blip_sprite, blip_color) VALUES
('24/7 Supermarket - Innocence Blvd', '24/7', 1960.129, 3740.545, 32.34375, 52, 2),
('24/7 Supermarket - Grove Street', '24/7', -47.522, -1757.514, 29.421, 52, 2),
('24/7 Supermarket - Sandy Shores', '24/7', 1729.216, 6414.711, 35.03723, 52, 2),
('Clothing Store - Vinewood', 'Clothing', 72.254, -1399.102, 29.376, 73, 3),
('Ammu-Nation - Pillbox Hill', 'Gun', 252.696, -50.011, 69.941, 110, 1),
('Premium Deluxe Motorsport', 'Vehicle', -33.803, -1102.322, 26.422, 225, 4)
ON DUPLICATE KEY UPDATE name = name;

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
(3, 'Sandwich', 'Food', 15, 'Delicious sandwich')
ON DUPLICATE KEY UPDATE item_name = item_name;

-- Insert default jobs
INSERT INTO jobs (name, description, min_level, base_salary, max_rank, bank_access) VALUES
('Police Officer', 'Protect and serve the citizens of Los Santos', 0, 150, 5, FALSE),
('Paramedic', 'Save lives and provide medical assistance', 0, 120, 5, FALSE),
('Mechanic', 'Repair and customize vehicles', 0, 100, 4, FALSE),
('Taxi Driver', 'Transport citizens around the city', 0, 80, 3, FALSE),
('Trucker', 'Deliver goods across San Andreas', 0, 90, 3, FALSE),
('Miner', 'Extract valuable resources from mines', 0, 70, 3, FALSE),
('Fisher', 'Catch fish and sell them for profit', 0, 60, 3, FALSE),
('Bus Driver', 'Transport passengers on scheduled routes', 0, 75, 3, FALSE),
('Bank Manager', 'Manage bank operations, accounts, and security', 0, 500, 3, TRUE)
ON DUPLICATE KEY UPDATE name = name;

-- Insert job ranks
INSERT INTO job_ranks (job_id, rank_level, rank_name, salary)
SELECT id, 0, 'Cadet', 150 FROM jobs WHERE name = 'Police Officer'
ON DUPLICATE KEY UPDATE rank_name = rank_name;

INSERT INTO job_ranks (job_id, rank_level, rank_name, salary)
SELECT id, 1, 'Officer', 200 FROM jobs WHERE name = 'Police Officer'
ON DUPLICATE KEY UPDATE rank_name = rank_name;

INSERT INTO job_ranks (job_id, rank_level, rank_name, salary)
SELECT id, 2, 'Detective', 300 FROM jobs WHERE name = 'Police Officer'
ON DUPLICATE KEY UPDATE rank_name = rank_name;

INSERT INTO job_ranks (job_id, rank_level, rank_name, salary)
SELECT id, 0, 'Junior Manager', 500 FROM jobs WHERE name = 'Bank Manager'
ON DUPLICATE KEY UPDATE rank_name = rank_name;

INSERT INTO job_ranks (job_id, rank_level, rank_name, salary)
SELECT id, 1, 'Senior Manager', 750 FROM jobs WHERE name = 'Bank Manager'
ON DUPLICATE KEY UPDATE rank_name = rank_name;

INSERT INTO job_ranks (job_id, rank_level, rank_name, salary)
SELECT id, 2, 'Regional Manager', 1000 FROM jobs WHERE name = 'Bank Manager'
ON DUPLICATE KEY UPDATE rank_name = rank_name;

INSERT INTO job_ranks (job_id, rank_level, rank_name, salary)
SELECT id, 3, 'Bank Director', 1500 FROM jobs WHERE name = 'Bank Manager'
ON DUPLICATE KEY UPDATE rank_name = rank_name;

-- Insert default bank locations
INSERT INTO bank_locations (name, position_x, position_y, position_z, vault_cash, security_level) VALUES
('Fleeca Bank - Legion Square', 147.65, -1035.82, 29.37, 750000.00, 3),
('Fleeca Bank - Great Ocean Highway', -2962.47, 482.19, 15.70, 500000.00, 2),
('Fleeca Bank - Route 68', 1175.07, 2706.64, 38.09, 400000.00, 2),
('Pacific Standard Bank', 253.45, 225.12, 101.68, 2000000.00, 5),
('Maze Bank Tower', -76.52, -817.93, 326.17, 5000000.00, 5),
('Paleto Bay Bank', -112.20, 6469.91, 31.62, 300000.00, 1)
ON DUPLICATE KEY UPDATE name = name;

-- Insert default ATM locations
INSERT INTO atm_locations (position_x, position_y, position_z, rotation) VALUES
(147.65, -1035.82, 29.37, 0),
(-1205.02, -326.29, 37.84, 180),
(527.37, -160.66, 57.09, 90),
(295.75, -896.09, 29.22, 270),
(-56.96, -1752.07, 29.42, 45)
ON DUPLICATE KEY UPDATE position_x = position_x;

-- ==================== TRIGGERS ====================

-- Trigger to prevent negative balances
DELIMITER //

DROP TRIGGER IF EXISTS prevent_negative_balance//
CREATE TRIGGER prevent_negative_balance
BEFORE UPDATE ON bank_accounts
FOR EACH ROW
BEGIN
    IF NEW.balance < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Balance cannot be negative';
    END IF;
END//

DELIMITER ;

-- ==================== STORED PROCEDURES ====================

DELIMITER //

-- Procedure to process transfer
DROP PROCEDURE IF EXISTS ProcessTransfer//
CREATE PROCEDURE ProcessTransfer(
    IN from_account_id INT,
    IN to_account_number VARCHAR(20),
    IN transfer_amount DECIMAL(15,2),
    IN description TEXT,
    OUT result_message VARCHAR(255)
)
BEGIN
    DECLARE to_account_id INT;
    DECLARE from_balance DECIMAL(15,2);
    DECLARE ref_number VARCHAR(50);
    
    SELECT balance INTO from_balance FROM bank_accounts WHERE id = from_account_id AND status = 'Active';
    SELECT id INTO to_account_id FROM bank_accounts WHERE account_number = to_account_number AND status = 'Active';
    
    IF from_balance IS NULL THEN
        SET result_message = 'Sender account not found or inactive';
    ELSEIF to_account_id IS NULL THEN
        SET result_message = 'Receiver account not found or inactive';
    ELSEIF from_balance < transfer_amount THEN
        SET result_message = 'Insufficient balance';
    ELSE
        SET ref_number = CONCAT('TXN', UNIX_TIMESTAMP(), FLOOR(RAND() * 1000));
        
        UPDATE bank_accounts SET balance = balance - transfer_amount, total_withdrawals = total_withdrawals + transfer_amount WHERE id = from_account_id;
        UPDATE bank_accounts SET balance = balance + transfer_amount, total_deposits = total_deposits + transfer_amount WHERE id = to_account_id;
        
        INSERT INTO bank_transactions (account_id, transaction_type, amount, receiver_id, receiver_account, description, reference_number)
        VALUES (from_account_id, 'Transfer_Out', transfer_amount, to_account_id, to_account_number, description, ref_number);
        
        INSERT INTO bank_transactions (account_id, transaction_type, amount, description, reference_number)
        VALUES (to_account_id, 'Transfer_In', transfer_amount, description, ref_number);
        
        SET result_message = CONCAT('Transfer successful: ', ref_number);
    END IF;
END//

DELIMITER ;

-- ==================== VIEWS ====================

CREATE OR REPLACE VIEW bank_statistics AS
SELECT 
    bl.id as bank_id,
    bl.name as bank_name,
    COUNT(DISTINCT ba.id) as total_accounts,
    SUM(ba.balance) as total_deposits,
    COUNT(DISTINCT CASE WHEN bt.transaction_type = 'Robbery' THEN bt.id END) as total_robberies,
    bl.vault_cash,
    COUNT(DISTINCT be.id) as employee_count
FROM bank_locations bl
LEFT JOIN bank_accounts ba ON ba.id IS NOT NULL
LEFT JOIN bank_transactions bt ON bt.timestamp > DATE_SUB(NOW(), INTERVAL 30 DAY)
LEFT JOIN bank_employees be ON be.bank_id = bl.id AND be.status = 'Active'
GROUP BY bl.id;

-- ==================== PERFORMANCE INDEXES ====================

CREATE INDEX idx_transactions_recent ON bank_transactions(timestamp DESC);
CREATE INDEX idx_accounts_balance ON bank_accounts(balance);
CREATE INDEX idx_loans_status ON bank_loans(status, due_date);

-- ==================== COMPLETION MESSAGE ====================

SELECT 'Complete Merged Database Schema Created Successfully!' as Status,
       'All tables, triggers, procedures, views, and default data loaded!' as Details;
