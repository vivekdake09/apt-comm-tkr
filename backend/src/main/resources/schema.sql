/*
  =========================================
  APT-COMM DATABASE INITIALIZATION SCRIPT
  =========================================
  
  Please configure the following database parameters:
  - Database Host: localhost
  - Database Port: 3306
  - Database Name: apt_comm_db
  
  /* USER PROVIDED: database_user */
  /* USER PROVIDED: database_password */
*/

CREATE DATABASE IF NOT EXISTS `apt_comm_db`;
USE `apt_comm_db`;

-- 1. Users Table (Residents, Admin, Security)
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `role` ENUM('ADMIN', 'RESIDENT', 'SECURITY') NOT NULL,
    `flat_number` VARCHAR(20) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Complaints Table
CREATE TABLE IF NOT EXISTS `complaints` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `resident_id` BIGINT NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `category` ENUM('PLUMBING', 'ELECTRICAL', 'SECURITY', 'CLEANLINESS', 'PARKING', 'OTHERS') NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`resident_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_complaints_status` (`status`),
    INDEX `idx_complaints_category` (`category`),
    INDEX `idx_complaints_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Visitors Table
CREATE TABLE IF NOT EXISTS `visitors` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `resident_id` BIGINT DEFAULT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `purpose` VARCHAR(150) DEFAULT NULL,
    `vehicle_number` VARCHAR(20) DEFAULT NULL,
    `qr_code_token` VARCHAR(100) NOT NULL UNIQUE,
    `status` ENUM('PENDING', 'APPROVED', 'DENIED', 'CHECKED_IN', 'CHECKED_OUT') NOT NULL DEFAULT 'PENDING',
    `check_in_time` TIMESTAMP NULL DEFAULT NULL,
    `check_out_time` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`resident_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    INDEX `idx_visitors_qr` (`qr_code_token`),
    INDEX `idx_visitors_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Parcels Table
CREATE TABLE IF NOT EXISTS `parcels` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `resident_id` BIGINT NOT NULL,
    `carrier` VARCHAR(50) NOT NULL,
    `tracking_number` VARCHAR(100) DEFAULT NULL,
    `status` ENUM('RECEIVED', 'COLLECTED') NOT NULL DEFAULT 'RECEIVED',
    `received_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `collected_at` TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (`resident_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_parcels_status` (`status`),
    INDEX `idx_parcels_resident` (`resident_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `resident_id` BIGINT NOT NULL,
    `type` ENUM('RENT', 'MAINTENANCE') NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `due_date` DATE NOT NULL,
    `status` ENUM('UNPAID', 'PAID', 'FAILED') NOT NULL DEFAULT 'UNPAID',
    `transaction_id` VARCHAR(100) DEFAULT NULL,
    `payment_date` TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (`resident_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_payments_status` (`status`),
    INDEX `idx_payments_resident` (`resident_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `resident_id` BIGINT NOT NULL,
    `facility_name` ENUM('CLUBHOUSE', 'GYM', 'TENNIS_COURT', 'PARTY_HALL') NOT NULL,
    `booking_date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `status` ENUM('CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`resident_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_bookings_date` (`booking_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Polls Table
CREATE TABLE IF NOT EXISTS `polls` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `question` VARCHAR(255) NOT NULL,
    `created_by` BIGINT DEFAULT NULL,
    `expires_at` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Poll Options Table
CREATE TABLE IF NOT EXISTS `poll_options` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `poll_id` BIGINT NOT NULL,
    `option_text` VARCHAR(100) NOT NULL,
    FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Poll Votes Table
CREATE TABLE IF NOT EXISTS `poll_votes` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `poll_id` BIGINT NOT NULL,
    `option_id` BIGINT NOT NULL,
    `resident_id` BIGINT NOT NULL,
    `voted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_resident_poll_vote` (`resident_id`, `poll_id`),
    FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`option_id`) REFERENCES `poll_options` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`resident_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Vehicle Logs Table
CREATE TABLE IF NOT EXISTS `vehicle_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `vehicle_number` VARCHAR(20) NOT NULL,
    `driver_name` VARCHAR(100) DEFAULT NULL,
    `entry_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `exit_time` TIMESTAMP NULL DEFAULT NULL,
    `visitor_id` BIGINT DEFAULT NULL,
    FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`) ON DELETE SET NULL,
    INDEX `idx_vehicle_logs_number` (`vehicle_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Staff Table
CREATE TABLE IF NOT EXISTS `staff` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `role` ENUM('MAINTENANCE', 'SECURITY', 'CLEANING', 'MANAGEMENT') NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    INDEX `idx_staff_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- INITIAL SEED DATA (Bcrypt hashed passwords: 'password' is '$2a$10$Y50UaMFOxteibQEYdfasUeLp.DviqZkK0x.y89.6f1H2wT5R4R3eK')
-- =========================================

-- Seed Users
INSERT INTO `users` (`id`, `username`, `password`, `email`, `full_name`, `phone`, `role`, `flat_number`) VALUES
(1, 'admin', '$2a$10$Y50UaMFOxteibQEYdfasUeLp.DviqZkK0x.y89.6f1H2wT5R4R3eK', 'admin@aptcomm.com', 'System Admin', '+15550100', 'ADMIN', NULL),
(2, 'john_res', '$2a$10$Y50UaMFOxteibQEYdfasUeLp.DviqZkK0x.y89.6f1H2wT5R4R3eK', 'john.doe@email.com', 'John Doe', '+15550101', 'RESIDENT', '101-A'),
(3, 'jane_res', '$2a$10$Y50UaMFOxteibQEYdfasUeLp.DviqZkK0x.y89.6f1H2wT5R4R3eK', 'jane.smith@email.com', 'Jane Smith', '+15550102', 'RESIDENT', '204-B'),
(4, 'guard_bob', '$2a$10$Y50UaMFOxteibQEYdfasUeLp.DviqZkK0x.y89.6f1H2wT5R4R3eK', 'bob.security@aptcomm.com', 'Guard Bob', '+15550103', 'SECURITY', NULL)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Staff members
INSERT INTO `staff` (`id`, `name`, `role`, `phone`, `status`) VALUES
(1, 'David Miller', 'MAINTENANCE', '+15550201', 'ACTIVE'),
(2, 'Sarah Jenkins', 'CLEANING', '+15550202', 'ACTIVE'),
(3, 'Michael Scott', 'MANAGEMENT', '+15550203', 'ACTIVE'),
(4, 'Bob Security', 'SECURITY', '+15550103', 'ACTIVE')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Payments
INSERT INTO `payments` (`id`, `resident_id`, `type`, `amount`, `due_date`, `status`, `transaction_id`, `payment_date`) VALUES
(1, 2, 'RENT', 1500.00, '2026-08-01', 'UNPAID', NULL, NULL),
(2, 2, 'MAINTENANCE', 150.00, '2026-08-01', 'UNPAID', NULL, NULL),
(3, 3, 'RENT', 1650.00, '2026-08-01', 'UNPAID', NULL, NULL),
(4, 3, 'MAINTENANCE', 150.00, '2026-08-01', 'PAID', 'TXN_992104921', '2026-07-25 10:30:00')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed historical complaints for analytics & recurrence ML predictions
-- Category: PLUMBING (Multiple recurring events in Flat 101-A and Block A-related entries)
INSERT INTO `complaints` (`id`, `resident_id`, `title`, `description`, `category`, `status`, `created_at`) VALUES
(1, 2, 'Water leakage in kitchen', 'Water is dripping from the kitchen sink tap heavily.', 'PLUMBING', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 2, 'Clogged washbasin', 'Washbasin in master bathroom is clogged and not draining.', 'PLUMBING', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(3, 2, 'Low pressure in bathroom showers', 'The water flow pressure in the shower is extremely low.', 'PLUMBING', 'PENDING', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 3, 'Flickering lights in living room', 'The LED panels in the living room are flickering constantly.', 'ELECTRICAL', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(5, 3, 'Power socket burnt', 'The washing machine socket in utility area got burnt.', 'ELECTRICAL', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(6, 3, 'Lobby corridor dirty', 'Corridor on the 2nd floor has garbage left by some residents.', 'CLEANLINESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 4 DAY))
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Polls
INSERT INTO `polls` (`id`, `question`, `created_by`, `expires_at`, `created_at`) VALUES
(1, 'Should we repaint the outer clubhouse facade to light beige or slate grey?', 1, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW())
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Poll Options
INSERT INTO `poll_options` (`id`, `poll_id`, `option_text`) VALUES
(1, 1, 'Light Beige (Warm Concept)'),
(2, 1, 'Slate Grey (Modern Concept)'),
(3, 1, 'Keep Current Color')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed a pre-approved visitor for Resident 2 (John)
INSERT INTO `visitors` (`id`, `resident_id`, `name`, `phone`, `purpose`, `vehicle_number`, `qr_code_token`, `status`, `created_at`) VALUES
(1, 2, 'Alice Johnson', '+15550999', 'Delivery of furniture', 'NY-992-XX', 'QR_TOK_ALICE_101A', 'APPROVED', NOW())
ON DUPLICATE KEY UPDATE `id`=`id`;
