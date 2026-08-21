-- =====================================================================
-- EOMS: Employee Onboarding Management System
-- Comprehensive 34-Table MySQL Relational Schema
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =====================================================================

-- Drop any pre-existing database to purge legacy tables and conflicting foreign key constraints
DROP DATABASE IF EXISTS `eoms`;
CREATE DATABASE `eoms` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `eoms`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. AUTHENTICATION & ACCESS CONTROL (RBAC)
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `system_users`;
CREATE TABLE `system_users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login` DATETIME NULL,
  `mfa_secret` VARCHAR(255) NULL,
  `version_number` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `role_id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `hierarchy_level` INT NOT NULL DEFAULT 9,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `permission_id` INT AUTO_INCREMENT PRIMARY KEY,
  `action_name` VARCHAR(100) NOT NULL UNIQUE,
  `resource` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `role_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  `granted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `user_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `role_id`),
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `system_users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. ORGANIZATION STRUCTURE & EMPLOYEES
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `dept_id` INT AUTO_INCREMENT PRIMARY KEY,
  `dept_name` VARCHAR(100) NOT NULL UNIQUE,
  `parent_dept_id` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_dept_parent` FOREIGN KEY (`parent_dept_id`) REFERENCES `departments` (`dept_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `positions`;
CREATE TABLE `positions` (
  `position_id` INT AUTO_INCREMENT PRIMARY KEY,
  `dept_id` INT NOT NULL,
  `job_title` VARCHAR(100) NOT NULL,
  `job_grade` VARCHAR(20) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_pos_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `employee_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `position_id` INT NOT NULL,
  `manager_id` INT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `hire_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `status` ENUM('onboarding', 'active', 'on_leave', 'terminated') NOT NULL DEFAULT 'onboarding',
  `work_email` VARCHAR(150) NULL,
  `work_location` ENUM('Remote', 'Hybrid', 'On-site') NULL DEFAULT 'Hybrid',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_emp_user` FOREIGN KEY (`user_id`) REFERENCES `system_users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_emp_pos` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_emp_mgr` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `emergency_contacts`;
CREATE TABLE `emergency_contacts` (
  `contact_id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `relationship` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `email` VARCHAR(150) NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ec_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. ONBOARDING PLANS, CHECKLISTS, TASKS & PROGRESS
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `onboarding_templates`;
CREATE TABLE `onboarding_templates` (
  `template_id` INT AUTO_INCREMENT PRIMARY KEY,
  `template_name` VARCHAR(150) NOT NULL,
  `dept_id` INT NULL,
  `target_role` VARCHAR(50) NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ot_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `onboarding_plans`;
CREATE TABLE `onboarding_plans` (
  `plan_id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL UNIQUE,
  `template_id` INT NULL,
  `start_date` DATE NOT NULL,
  `target_completion_date` DATE NOT NULL,
  `actual_completion_date` DATE NULL,
  `progress_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('not_started', 'in_progress', 'completed', 'overdue') NOT NULL DEFAULT 'in_progress',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_op_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_op_template` FOREIGN KEY (`template_id`) REFERENCES `onboarding_templates` (`template_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `checklists`;
CREATE TABLE `checklists` (
  `checklist_id` INT AUTO_INCREMENT PRIMARY KEY,
  `plan_id` INT NOT NULL,
  `phase_name` VARCHAR(100) NOT NULL, -- e.g., 'Pre-boarding', 'Day 1', 'Week 1', '30 Days', '60 Days', '90 Days'
  `phase_order` INT NOT NULL DEFAULT 1,
  `due_offset_days` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cl_plan` FOREIGN KEY (`plan_id`) REFERENCES `onboarding_plans` (`plan_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `task_id` INT AUTO_INCREMENT PRIMARY KEY,
  `checklist_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `category` ENUM('administrative', 'it_setup', 'training', 'compliance', 'manager_meeting') NOT NULL DEFAULT 'administrative',
  `assigned_role` VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
  `estimated_minutes` INT NOT NULL DEFAULT 30,
  `priority` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  `is_mandatory` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_task_checklist` FOREIGN KEY (`checklist_id`) REFERENCES `checklists` (`checklist_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `task_dependencies`;
CREATE TABLE `task_dependencies` (
  `task_id` INT NOT NULL,
  `prerequisite_task_id` INT NOT NULL,
  PRIMARY KEY (`task_id`, `prerequisite_task_id`),
  CONSTRAINT `fk_td_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_td_prereq` FOREIGN KEY (`prerequisite_task_id`) REFERENCES `tasks` (`task_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `task_progress`;
CREATE TABLE `task_progress` (
  `progress_id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `task_id` INT NOT NULL,
  `status` ENUM('not_started', 'in_progress', 'completed', 'blocked') NOT NULL DEFAULT 'not_started',
  `completed_at` DATETIME NULL,
  `completed_by` INT NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_emp_task` (`employee_id`, `task_id`),
  CONSTRAINT `fk_tp_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tp_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tp_user` FOREIGN KEY (`completed_by`) REFERENCES `system_users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. DOCUMENTS & VERIFICATION LOGS
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `document_types`;
CREATE TABLE `document_types` (
  `type_id` INT AUTO_INCREMENT PRIMARY KEY,
  `type_name` VARCHAR(100) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `is_required` TINYINT(1) NOT NULL DEFAULT 1,
  `allowed_extensions` VARCHAR(100) NOT NULL DEFAULT 'pdf,png,jpg,jpeg',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `document_id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `type_id` INT NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size_bytes` BIGINT NOT NULL DEFAULT 0,
  `mime_type` VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_doc_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_doc_type` FOREIGN KEY (`type_id`) REFERENCES `document_types` (`type_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `document_verifications`;
CREATE TABLE `document_verifications` (
  `verification_id` INT AUTO_INCREMENT PRIMARY KEY,
  `document_id` INT NOT NULL,
  `reviewer_user_id` INT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'requires_resubmission') NOT NULL DEFAULT 'pending',
  `comments` TEXT NULL,
  `verified_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_dv_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`document_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dv_reviewer` FOREIGN KEY (`reviewer_user_id`) REFERENCES `system_users` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. TRAINING COURSES, MODULES & RECORDS
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `training_courses`;
CREATE TABLE `training_courses` (
  `course_id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 30,
  `is_mandatory` TINYINT(1) NOT NULL DEFAULT 1,
  `passing_score` INT NOT NULL DEFAULT 80,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `training_modules`;
CREATE TABLE `training_modules` (
  `module_id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content_type` ENUM('video', 'slides', 'quiz', 'document') NOT NULL DEFAULT 'slides',
  `content_url` VARCHAR(500) NULL,
  `module_order` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_tm_course` FOREIGN KEY (`course_id`) REFERENCES `training_courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `training_records`;
CREATE TABLE `training_records` (
  `record_id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `status` ENUM('not_started', 'in_progress', 'completed', 'failed') NOT NULL DEFAULT 'not_started',
  `score` INT NULL,
  `progress_percent` INT NOT NULL DEFAULT 0,
  `started_at` DATETIME NULL,
  `completed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_emp_course` (`employee_id`, `course_id`),
  CONSTRAINT `fk_tr_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tr_course` FOREIGN KEY (`course_id`) REFERENCES `training_courses` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `training_quiz_attempts`;
CREATE TABLE `training_quiz_attempts` (
  `attempt_id` INT AUTO_INCREMENT PRIMARY KEY,
  `record_id` INT NOT NULL,
  `attempt_number` INT NOT NULL DEFAULT 1,
  `score_achieved` INT NOT NULL,
  `passed` TINYINT(1) NOT NULL DEFAULT 0,
  `attempted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_tqa_record` FOREIGN KEY (`record_id`) REFERENCES `training_records` (`record_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. ASSET MANAGEMENT & HARDWARE/SOFTWARE PROVISIONING
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `asset_categories`;
CREATE TABLE `asset_categories` (
  `category_id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(100) NOT NULL UNIQUE,
  `type` ENUM('hardware', 'software_license', 'peripheral', 'access_card') NOT NULL DEFAULT 'hardware',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `asset_models`;
CREATE TABLE `asset_models` (
  `model_id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `manufacturer` VARCHAR(100) NOT NULL,
  `model_name` VARCHAR(150) NOT NULL,
  `specs` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_am_cat` FOREIGN KEY (`category_id`) REFERENCES `asset_categories` (`category_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `assets`;
CREATE TABLE `assets` (
  `asset_id` INT AUTO_INCREMENT PRIMARY KEY,
  `model_id` INT NOT NULL,
  `serial_number` VARCHAR(100) NOT NULL UNIQUE,
  `asset_tag` VARCHAR(50) NOT NULL UNIQUE,
  `status` ENUM('in_stock', 'allocated', 'in_repair', 'retired') NOT NULL DEFAULT 'in_stock',
  `purchased_at` DATE NULL,
  `warranty_expiry` DATE NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_asset_model` FOREIGN KEY (`model_id`) REFERENCES `asset_models` (`model_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `asset_allocations`;
CREATE TABLE `asset_allocations` (
  `allocation_id` INT AUTO_INCREMENT PRIMARY KEY,
  `asset_id` INT NOT NULL,
  `employee_id` INT NOT NULL,
  `allocated_by` INT NOT NULL,
  `allocated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `returned_at` DATETIME NULL,
  `acknowledgement_status` ENUM('pending', 'acknowledged', 'disputed') NOT NULL DEFAULT 'pending',
  `notes` TEXT NULL,
  CONSTRAINT `fk_aa_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`asset_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_aa_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_aa_user` FOREIGN KEY (`allocated_by`) REFERENCES `system_users` (`user_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `software_provisioning`;
CREATE TABLE `software_provisioning` (
  `provision_id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `software_name` VARCHAR(100) NOT NULL,
  `license_key` VARCHAR(255) NULL,
  `status` ENUM('requested', 'provisioned', 'revoked') NOT NULL DEFAULT 'requested',
  `provisioned_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_sp_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. NOTIFICATIONS & COMMUNICATION
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `notification_templates`;
CREATE TABLE `notification_templates` (
  `template_id` INT AUTO_INCREMENT PRIMARY KEY,
  `trigger_event` VARCHAR(100) NOT NULL UNIQUE,
  `subject_template` VARCHAR(255) NOT NULL,
  `body_template` TEXT NOT NULL,
  `channels` VARCHAR(50) NOT NULL DEFAULT 'email,in_app',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `notification_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `channel` ENUM('in_app', 'email', 'sms') NOT NULL DEFAULT 'in_app',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `read_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `system_users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. SYSTEM AUDITING, COMPLIANCE & SCHEDULING
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `log_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_table` VARCHAR(100) NULL,
  `target_id` VARCHAR(100) NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `details` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_al_user` FOREIGN KEY (`user_id`) REFERENCES `system_users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `schedules`;
CREATE TABLE `schedules` (
  `schedule_id` INT AUTO_INCREMENT PRIMARY KEY,
  `job_name` VARCHAR(100) NOT NULL UNIQUE,
  `cron_expression` VARCHAR(50) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_run_at` DATETIME NULL,
  `next_run_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `setting_key` VARCHAR(100) PRIMARY KEY,
  `setting_value` TEXT NOT NULL,
  `description` VARCHAR(255) NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `mfa_backup_codes`;
CREATE TABLE `mfa_backup_codes` (
  `code_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `code_hash` VARCHAR(255) NOT NULL,
  `used_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_mbc_user` FOREIGN KEY (`user_id`) REFERENCES `system_users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS `feedback_surveys`;
CREATE TABLE `feedback_surveys` (
  `survey_id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` INT NOT NULL,
  `milestone` ENUM('day_7', 'day_30', 'day_60', 'day_90') NOT NULL,
  `rating` INT NOT NULL,
  `comments` TEXT NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_fs_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
