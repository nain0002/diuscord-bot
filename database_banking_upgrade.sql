-- Enhanced Banking & Robbery System Database Schema
-- USE ragemp_roleplay;

-- Drop existing tables if upgrading
DROP TABLE IF EXISTS robbery_logs;
DROP TABLE IF EXISTS bank_transactions;
DROP TABLE IF EXISTS bank_accounts;
DROP TABLE IF EXISTS credit_cards;
DROP TABLE IF EXISTS bank_loans;
DROP TABLE IF EXISTS atm_locations;
DROP TABLE IF EXISTS bank_locations;
DROP TABLE IF EXISTS bank_employees;

-- Enhanced bank_accounts table
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

-- Enhanced transactions table
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
    status ENUM('Pending', 'Approved', 'Active', 'Paid', 'Defaulted') DEFAULT 'Pending',
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

-- Insert default bank locations
INSERT INTO bank_locations (name, position_x, position_y, position_z, vault_cash, security_level) VALUES
('Fleeca Bank - Legion Square', 147.65, -1035.82, 29.37, 750000.00, 3),
('Fleeca Bank - Great Ocean Highway', -2962.47, 482.19, 15.70, 500000.00, 2),
('Fleeca Bank - Route 68', 1175.07, 2706.64, 38.09, 400000.00, 2),
('Pacific Standard Bank', 253.45, 225.12, 101.68, 2000000.00, 5),
('Maze Bank Tower', -76.52, -817.93, 326.17, 5000000.00, 5),
('Paleto Bay Bank', -112.20, 6469.91, 31.62, 300000.00, 1);

-- Insert default ATM locations (sample locations)
INSERT INTO atm_locations (position_x, position_y, position_z, rotation) VALUES
(147.65, -1035.82, 29.37, 0),
(-1205.02, -326.29, 37.84, 180),
(527.37, -160.66, 57.09, 90),
(295.75, -896.09, 29.22, 270),
(-56.96, -1752.07, 29.42, 45);

-- Add new columns to existing characters table (if not exists)
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS credit_score INT DEFAULT 500,
ADD COLUMN IF NOT EXISTS total_debt DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vip_status BOOLEAN DEFAULT FALSE;

-- Add new columns to jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS bank_access BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS manager_permissions JSON;

-- Update Bank Manager job with permissions
UPDATE jobs SET 
    bank_access = TRUE,
    manager_permissions = JSON_OBJECT(
        'view_accounts', true,
        'freeze_accounts', true,
        'approve_loans', true,
        'hire_employees', true,
        'manage_security', true,
        'access_vault', true
    )
WHERE name = 'Bank Manager' OR id = 10;

-- Insert Bank Manager job if it doesn't exist
INSERT INTO jobs (name, description, min_level, base_salary, max_rank, bank_access) 
VALUES ('Bank Manager', 'Manage bank operations, accounts, and security', 0, 500, 3, TRUE)
ON DUPLICATE KEY UPDATE bank_access = TRUE;

-- Insert bank job ranks
INSERT INTO job_ranks (job_id, rank_level, rank_name, salary) 
SELECT id, 0, 'Junior Manager', 500 FROM jobs WHERE name = 'Bank Manager'
ON DUPLICATE KEY UPDATE salary = 500;

INSERT INTO job_ranks (job_id, rank_level, rank_name, salary) 
SELECT id, 1, 'Senior Manager', 750 FROM jobs WHERE name = 'Bank Manager'
ON DUPLICATE KEY UPDATE salary = 750;

INSERT INTO job_ranks (job_id, rank_level, rank_name, salary) 
SELECT id, 2, 'Regional Manager', 1000 FROM jobs WHERE name = 'Bank Manager'
ON DUPLICATE KEY UPDATE salary = 1000;

INSERT INTO job_ranks (job_id, rank_level, rank_name, salary) 
SELECT id, 3, 'Bank Director', 1500 FROM jobs WHERE name = 'Bank Manager'
ON DUPLICATE KEY UPDATE salary = 1500;

-- Create stored procedures for common operations

DELIMITER //

-- Procedure to process transfer
CREATE PROCEDURE IF NOT EXISTS ProcessTransfer(
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
    
    -- Get sender balance
    SELECT balance INTO from_balance FROM bank_accounts WHERE id = from_account_id AND status = 'Active';
    
    -- Get receiver account ID
    SELECT id INTO to_account_id FROM bank_accounts WHERE account_number = to_account_number AND status = 'Active';
    
    -- Validate
    IF from_balance IS NULL THEN
        SET result_message = 'Sender account not found or inactive';
    ELSEIF to_account_id IS NULL THEN
        SET result_message = 'Receiver account not found or inactive';
    ELSEIF from_balance < transfer_amount THEN
        SET result_message = 'Insufficient balance';
    ELSE
        -- Generate reference number
        SET ref_number = CONCAT('TXN', UNIX_TIMESTAMP(), FLOOR(RAND() * 1000));
        
        -- Deduct from sender
        UPDATE bank_accounts SET balance = balance - transfer_amount, total_withdrawals = total_withdrawals + transfer_amount WHERE id = from_account_id;
        
        -- Add to receiver
        UPDATE bank_accounts SET balance = balance + transfer_amount, total_deposits = total_deposits + transfer_amount WHERE id = to_account_id;
        
        -- Log transactions
        INSERT INTO bank_transactions (account_id, transaction_type, amount, receiver_id, receiver_account, description, reference_number)
        VALUES (from_account_id, 'Transfer_Out', transfer_amount, to_account_id, to_account_number, description, ref_number);
        
        INSERT INTO bank_transactions (account_id, transaction_type, amount, description, reference_number)
        VALUES (to_account_id, 'Transfer_In', transfer_amount, description, ref_number);
        
        SET result_message = CONCAT('Transfer successful: ', ref_number);
    END IF;
END //

DELIMITER ;

-- Create views for analytics

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

-- Indexes for performance
CREATE INDEX idx_transactions_recent ON bank_transactions(timestamp DESC);
CREATE INDEX idx_accounts_balance ON bank_accounts(balance);
CREATE INDEX idx_loans_status ON bank_loans(status, due_date);

-- Security: Create trigger to prevent negative balances
DELIMITER //

CREATE TRIGGER prevent_negative_balance
BEFORE UPDATE ON bank_accounts
FOR EACH ROW
BEGIN
    IF NEW.balance < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Balance cannot be negative';
    END IF;
END //

DELIMITER ;

-- Done
SELECT 'Enhanced Banking & Robbery System Database Created Successfully!' as Status;
