-- ------------------------------------------------------------
-- Advanced RageMP Server MySQL Schema
-- Compatible with phpMyAdmin (MySQL 8.0+/MariaDB 10.6+)
-- ------------------------------------------------------------

-- Optional: create dedicated database
-- CREATE DATABASE IF NOT EXISTS `rage_server`
--   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `rage_server`;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ------------------------------------------------------------
-- Players
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `players` (
  `id`            VARCHAR(16)  NOT NULL,
  `social_club`   VARCHAR(64)  DEFAULT NULL,
  `username`      VARCHAR(64)  NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `email`         VARCHAR(128) DEFAULT NULL,
  `cash`          INT          NOT NULL DEFAULT 500,
  `bank`          INT          NOT NULL DEFAULT 0,
  `level`         INT          NOT NULL DEFAULT 1,
  `role`          ENUM('player','admin','moderator') NOT NULL DEFAULT 'player',
  `status`        ENUM('active','banned','suspended') NOT NULL DEFAULT 'active',
  `last_position` JSON         DEFAULT NULL,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login`    DATETIME     DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_unique` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Inventories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inventories` (
  `id`         VARCHAR(16) NOT NULL,
  `player_id`  VARCHAR(16) NOT NULL,
  `capacity`   INT         NOT NULL DEFAULT 20,
  `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventories_player_unique` (`player_id`),
  KEY `inventories_player_id_idx` (`player_id`),
  CONSTRAINT `inventories_player_fk`
    FOREIGN KEY (`player_id`) REFERENCES `players`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Inventory Items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inventory_items` (
  `id`           VARCHAR(16)  NOT NULL,
  `inventory_id` VARCHAR(16)  NOT NULL,
  `item_code`    VARCHAR(64)  NOT NULL,
  `label`        VARCHAR(128) NOT NULL,
  `quantity`     INT          NOT NULL DEFAULT 1,
  `stackable`    TINYINT(1)   NOT NULL DEFAULT 1,
  `metadata`     JSON         DEFAULT NULL,
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `inventory_items_inventory_idx` (`inventory_id`),
  KEY `inventory_items_item_idx` (`item_code`),
  CONSTRAINT `inventory_items_inventory_fk`
    FOREIGN KEY (`inventory_id`) REFERENCES `inventories` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Chat Messages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id`         VARCHAR(16) NOT NULL,
  `player_id`  VARCHAR(16) DEFAULT NULL,
  `message`    TEXT        NOT NULL,
  `channel`    VARCHAR(32) NOT NULL DEFAULT 'global',
  `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `chat_messages_player_idx` (`player_id`),
  KEY `chat_messages_channel_idx` (`channel`),
  CONSTRAINT `chat_messages_player_fk`
    FOREIGN KEY (`player_id`) REFERENCES `players` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Activity Logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id`        VARCHAR(16) NOT NULL,
  `type`      VARCHAR(64) NOT NULL,
  `actor_id`  VARCHAR(16) DEFAULT NULL,
  `payload`   JSON        DEFAULT NULL,
  `created_at` DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `activity_logs_actor_idx` (`actor_id`),
  KEY `activity_logs_type_idx` (`type`),
  CONSTRAINT `activity_logs_actor_fk`
    FOREIGN KEY (`actor_id`) REFERENCES `players` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Admin Panel Sessions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `panel_sessions` (
  `id`         VARCHAR(24)  NOT NULL,
  `player_id`  VARCHAR(16)  NOT NULL,
  `token`      VARCHAR(64)  NOT NULL,
  `expires_at` DATETIME     NOT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `panel_sessions_token_unique` (`token`),
  KEY `panel_sessions_player_idx` (`player_id`),
  CONSTRAINT `panel_sessions_player_fk`
    FOREIGN KEY (`player_id`) REFERENCES `players` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Territories and Control Logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `territories` (
  `id`              VARCHAR(16)  NOT NULL,
  `code`            VARCHAR(64)  NOT NULL,
  `name`            VARCHAR(128) NOT NULL,
  `owner_player_id` VARCHAR(16)  DEFAULT NULL,
  `owner_name`      VARCHAR(64)  DEFAULT NULL,
  `reward_cash`     INT          NOT NULL DEFAULT 0,
  `capture_time`    INT          NOT NULL DEFAULT 120,
  `last_capture_at` DATETIME     DEFAULT NULL,
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `territories_code_unique` (`code`),
  KEY `territories_owner_idx` (`owner_player_id`),
  CONSTRAINT `territories_owner_fk`
    FOREIGN KEY (`owner_player_id`) REFERENCES `players` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `territory_control_logs` (
  `id`         VARCHAR(16) NOT NULL,
  `territory_id` VARCHAR(16) NOT NULL,
  `winner_player_id` VARCHAR(16) DEFAULT NULL,
  `winner_name` VARCHAR(64) DEFAULT NULL,
  `reward_cash` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `territory_logs_territory_idx` (`territory_id`),
  CONSTRAINT `territory_logs_territory_fk`
    FOREIGN KEY (`territory_id`) REFERENCES `territories` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Jobs and Player Job States
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `player_jobs` (
  `id`          VARCHAR(16) NOT NULL,
  `player_id`   VARCHAR(16) NOT NULL,
  `job_code`    VARCHAR(64) NOT NULL,
  `status`      ENUM('active','completed','failed') NOT NULL DEFAULT 'active',
  `progress`    INT NOT NULL DEFAULT 0,
  `payload`     JSON DEFAULT NULL,
  `started_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `player_jobs_player_idx` (`player_id`),
  KEY `player_jobs_status_idx` (`status`),
  KEY `player_jobs_job_code_idx` (`job_code`),
  CONSTRAINT `player_jobs_player_fk`
    FOREIGN KEY (`player_id`) REFERENCES `players` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Shop Transactions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `shop_transactions` (
  `id`         VARCHAR(16) NOT NULL,
  `player_id`  VARCHAR(16) NOT NULL,
  `shop_code`  VARCHAR(64) NOT NULL,
  `item_code`  VARCHAR(64) NOT NULL,
  `item_label` VARCHAR(128) NOT NULL,
  `quantity`   INT         NOT NULL,
  `price`      INT         NOT NULL,
  `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `shop_transactions_player_idx` (`player_id`),
  KEY `shop_transactions_shop_idx` (`shop_code`),
  CONSTRAINT `shop_transactions_player_fk`
    FOREIGN KEY (`player_id`) REFERENCES `players` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Default Administrator Seed (username: admin / password: admin123)
-- ------------------------------------------------------------
INSERT INTO `players` (`id`, `social_club`, `username`, `password_hash`, `email`, `cash`, `bank`, `level`, `role`, `status`, `last_position`, `created_at`, `updated_at`, `last_login`)
VALUES
('admin0000000000', NULL, 'admin', '$2a$10$7smfrpIEByU9GiddYDBWweoUxF9X5piw4M0raSfa10bK/u96zkRgG', NULL, 10000, 50000, 10, 'admin', 'active', NULL, NOW(), NOW(), NULL)
ON DUPLICATE KEY UPDATE `updated_at` = VALUES(`updated_at`);

INSERT INTO `inventories` (`id`, `player_id`, `capacity`, `created_at`)
VALUES
('admininv0000000', 'admin0000000000', 50, NOW())
ON DUPLICATE KEY UPDATE `capacity` = VALUES(`capacity`);

-- Example inventory seed item (optional)
-- INSERT INTO `inventory_items` (`id`, `inventory_id`, `item_code`, `label`, `quantity`, `stackable`, `metadata`)
-- VALUES ('starterkit000001', 'admininv0000000', 'starter_kit', 'Starter Kit', 1, 0, JSON_OBJECT('desc','Initial admin kit'));

-- ------------------------------------------------------------
-- Views (optional helpers)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW `v_player_latest_chat` AS
SELECT c.id,
       c.player_id,
       p.username,
       c.message,
       c.channel,
       c.created_at
FROM chat_messages c
LEFT JOIN players p ON c.player_id = p.id;

CREATE OR REPLACE VIEW `v_inventory_summary` AS
SELECT inv.player_id,
       pl.username,
       inv.id           AS inventory_id,
       inv.capacity,
       COUNT(items.id)  AS item_slots,
       COALESCE(SUM(items.quantity), 0) AS total_quantity
FROM inventories inv
JOIN players pl ON inv.player_id = pl.id
LEFT JOIN inventory_items items ON items.inventory_id = inv.id
GROUP BY inv.id;

-- End of schema
