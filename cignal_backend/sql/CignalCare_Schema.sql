-- =========================================================
-- CignalCare+ Complete Schema
-- Database: cignal_system
-- =========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `cignal_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cignal_system`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `load_history`;
DROP TABLE IF EXISTS `load_requests`;
DROP TABLE IF EXISTS `prepaid_transactions`;
DROP TABLE IF EXISTS `prepaid_accounts`;
DROP TABLE IF EXISTS `prepaid_plans`;
DROP TABLE IF EXISTS `ticket_messages`;
DROP TABLE IF EXISTS `technician_requests`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `troubleshoot_steps`;
DROP TABLE IF EXISTS `troubleshoot_issues`;
DROP TABLE IF EXISTS `troubleshoot_models`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `accountName` VARCHAR(100) NOT NULL,
  `accountNumber` VARCHAR(50) NOT NULL,
  `ccaNumber` VARCHAR(50) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `location` ENUM('Balayan','Calaca','Lian','Calatagan','Nasugbu','Lemery') NOT NULL DEFAULT 'Balayan',
  `email` VARCHAR(150) DEFAULT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('user','admin') NOT NULL DEFAULT 'user',
  `status` ENUM('active','inactive','archived') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_accountNumber` (`accountNumber`),
  UNIQUE KEY `idx_ccaNumber` (`ccaNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `prepaid_plans` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `plan_code` VARCHAR(50) NOT NULL,
  `plan_name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `validity_days` INT(11) NOT NULL DEFAULT 30,
  `hd_channels` INT(11) DEFAULT 0,
  `sd_channels` INT(11) DEFAULT 0,
  `benefits_text` TEXT DEFAULT NULL,
  `ai_note` TEXT DEFAULT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_plan_code` (`plan_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `prepaid_accounts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL,
  `account_number` VARCHAR(50) NOT NULL,
  `account_name` VARCHAR(100) NOT NULL,
  `current_plan_id` INT(11) DEFAULT NULL,
  `last_load_amount` DECIMAL(10,2) DEFAULT 0.00,
  `last_load_date` DATETIME DEFAULT NULL,
  `expiry_date` DATETIME DEFAULT NULL,
  `status` ENUM('active','expired','inactive') NOT NULL DEFAULT 'inactive',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_account_number` (`account_number`),
  CONSTRAINT `fk_pa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pa_plan` FOREIGN KEY (`current_plan_id`) REFERENCES `prepaid_plans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `prepaid_transactions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `reference_no` VARCHAR(100) NOT NULL,
  `user_id` INT(11) DEFAULT NULL,
  `account_number` VARCHAR(50) NOT NULL,
  `account_name` VARCHAR(100) NOT NULL,
  `plan_id` INT(11) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `processed_by` VARCHAR(100) NOT NULL DEFAULT 'Admin',
  `transaction_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `validity_days` INT(11) NOT NULL DEFAULT 30,
  `expiry_date` DATETIME NOT NULL,
  `status` ENUM('completed','pending','failed','cancelled') NOT NULL DEFAULT 'completed',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reference` (`reference_no`),
  CONSTRAINT `fk_pt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pt_plan` FOREIGN KEY (`plan_id`) REFERENCES `prepaid_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `load_requests` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL,
  `account_number` VARCHAR(50) NOT NULL,
  `account_name` VARCHAR(100) NOT NULL,
  `plan_name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(30) NOT NULL DEFAULT 'GCash',
  `reference_no` VARCHAR(100) NOT NULL,
  `receipt_photo` LONGTEXT DEFAULT NULL,
  `screen_photo` LONGTEXT DEFAULT NULL,
  `diagnostic_result` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('Received','Under Review','Attending','Completed','Rejected') NOT NULL DEFAULT 'Received',
  `location` VARCHAR(100) DEFAULT 'Balayan',
  `admin_note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_load_reference` (`reference_no`),
  CONSTRAINT `fk_lr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `load_history` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL,
  `accountNumber` VARCHAR(50) NOT NULL,
  `loadAmount` DECIMAL(10,2) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'completed',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_lh_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tickets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `subject` TEXT NOT NULL,
  `priority` ENUM('Low','Normal','High','Urgent') NOT NULL DEFAULT 'Normal',
  `status` ENUM('Open','In Progress','Resolved','Closed') NOT NULL DEFAULT 'Open',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tickets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ticket_messages` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` INT(11) NOT NULL,
  `sender_id` INT(11) NOT NULL,
  `sender_role` ENUM('user','admin') NOT NULL,
  `message` TEXT DEFAULT NULL,
  `attachment` VARCHAR(255) DEFAULT NULL,
  `attachment_type` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tm_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tm_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `technician_requests` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `accountNumber` VARCHAR(50) NOT NULL,
  `contactName` VARCHAR(100) NOT NULL,
  `contactPhone` VARCHAR(30) NOT NULL,
  `issueDescription` TEXT NOT NULL,
  `preferred_date` DATE DEFAULT NULL,
  `preferred_time` TIME DEFAULT NULL,
  `technician_name` VARCHAR(100) DEFAULT NULL,
  `admin_note` TEXT DEFAULT NULL,
  `status` ENUM('Pending','Scheduled','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `troubleshoot_models` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `troubleshoot_issues` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `model_id` INT(11) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `error_code` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ti_model` FOREIGN KEY (`model_id`) REFERENCES `troubleshoot_models` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `troubleshoot_steps` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `issue_id` INT(11) NOT NULL,
  `step_number` INT(11) NOT NULL,
  `instruction` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ts_issue` FOREIGN KEY (`issue_id`) REFERENCES `troubleshoot_issues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `notifications` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL,
  `account_number` VARCHAR(50) DEFAULT NULL,
  `type` VARCHAR(50) DEFAULT 'info',
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEED DATA
INSERT INTO `users` (`id`,`accountName`,`accountNumber`,`ccaNumber`,`address`,`phone`,`location`,`role`,`status`) VALUES
(1,'admin','admin','0','Descallar Satellite Services HQ, Balayan, Batangas','09170000000','Balayan','admin','active'),
(2,'loyd descallar','88773322','88773322','Balayan, Batangas','09755718056','Balayan','user','active'),
(3,'maria santos','88001001','CCA-1001','Brgy. Lucban, Calaca, Batangas','09181234567','Calaca','user','active'),
(4,'jose reyes','88002001','CCA-2001','Brgy. Lian Proper, Lian, Batangas','09209876543','Lian','user','active'),
(5,'ana garcia','88003001','CCA-3001','Brgy. Calatagan Proper, Calatagan','09351112222','Calatagan','user','active'),
(6,'pedro dela cruz','88004001','CCA-4001','Brgy. Nasugbu Poblacion, Nasugbu','09473334444','Nasugbu','user','active'),
(7,'rosa mendoza','88005001','CCA-5001','Brgy. Lemery Proper, Lemery','09555556666','Lemery','user','active');

INSERT INTO `prepaid_plans` (`plan_code`,`plan_name`,`amount`,`validity_days`,`hd_channels`,`sd_channels`,`benefits_text`,`ai_note`,`status`) VALUES
('REG200','Load 200',200.00,30,7,62,'Mid-entry package with more HD access.','Good for users who want more content.','active'),
('REG300','Load 300',300.00,30,10,70,'Broader channel access.','Good value for frequent viewers.','active'),
('REG450','Load 450',450.00,30,14,78,'Higher-tier regular load.','Good for users wanting more variety.','active'),
('REG500','Load 500',500.00,30,17,82,'Premium regular package.','Good for richer viewing experience.','active'),
('REG600','Load 600',600.00,30,20,86,'High-tier regular load.','Good for heavier viewers.','active'),
('REG800','Load 800',800.00,30,25,91,'High-value load with premium lineup.','Ideal for wide viewing selection.','active'),
('REG1000','Load 1000',1000.00,30,30,95,'Top-tier prepaid load.','Best for broadest viewing experience.','active');

INSERT INTO `prepaid_accounts` (`user_id`,`account_number`,`account_name`,`current_plan_id`,`last_load_amount`,`last_load_date`,`expiry_date`,`status`) VALUES
(2,'88773322','loyd descallar',7,1000.00,NOW(),DATE_ADD(NOW(),INTERVAL 30 DAY),'active');

INSERT INTO `load_history` (`user_id`,`accountNumber`,`loadAmount`,`description`,`status`) VALUES
(2,'88773322',300.00,'Initial sample POS prepaid load','completed');

INSERT INTO `troubleshoot_models` VALUES
(1,'Cignal SD Box Model A','Standard definition receiver for entry-level plans','active'),
(2,'Cignal HD Box Model B','High definition receiver for HD plans','active'),
(3,'Cignal DVR Box Model C','DVR receiver with recording capability','active');

INSERT INTO `troubleshoot_issues` (`model_id`,`title`,`description`,`category`,`error_code`) VALUES
(1,'No signal on screen','TV shows no signal or blank screen','Technical Problem','NO_SIGNAL'),
(1,'Remote not responding','Remote control does not work','Technical Problem','REMOTE'),
(2,'HD channels not displaying','Only SD channels are available','Channel Concern','HD_CHANNEL'),
(3,'Recording not working','Cannot record scheduled programs','Device Concern','DVR_RECORD');

INSERT INTO `troubleshoot_steps` (`issue_id`,`step_number`,`instruction`) VALUES
(1,1,'Check that the satellite cable is firmly connected to the back of the box.'),
(1,2,'Ensure the TV is set to the correct HDMI/AV input.'),
(1,3,'Restart the box by unplugging it for 10 seconds, then plug it back in.'),
(2,1,'Replace the remote batteries with new AA batteries.'),
(2,2,'Make sure there are no obstructions between the remote and the receiver.'),
(2,3,'Try resetting the box using the power button on the unit.'),
(3,1,'Confirm that your subscription plan includes HD channels.'),
(3,2,'Run a channel scan from the Settings menu.'),
(4,1,'Check available storage space on the DVR hard drive.'),
(4,2,'Verify that the recording schedule time is set correctly.'),
(4,3,'Restart the DVR and try scheduling the recording again.');

INSERT INTO `notifications` (`user_id`,`account_number`,`type`,`message`,`is_read`) VALUES
(2,'88773322','info','Welcome to CignalCare+. Your account is ready!',0);
