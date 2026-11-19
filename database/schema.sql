-- =============================================================================
-- AI Interview Preparation Platform - Database Schema
-- Target: MySQL 8.0+
-- Description: Normalized schema for users, resumes, interviews, questions,
--              answers, and AI-powered evaluations.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `ai_interview_prep` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `ai_interview_prep`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `target_role` VARCHAR(100) DEFAULT NULL,
  `college_or_company` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Resumes Table
CREATE TABLE IF NOT EXISTS `resumes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size` INT UNSIGNED NOT NULL,
  `file_type` VARCHAR(50) NOT NULL,
  `parsed_text` MEDIUMTEXT DEFAULT NULL,
  `extracted_skills` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_resumes_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_resumes_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Interviews Table
CREATE TABLE IF NOT EXISTS `interviews` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `resume_id` INT UNSIGNED DEFAULT NULL,
  `category` ENUM('quantitative_aptitude', 'technical', 'hr', 'job_description', 'resume_based') NOT NULL,
  `difficulty` ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  `total_questions` TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `duration_minutes` SMALLINT UNSIGNED NOT NULL DEFAULT 15,
  `selected_topics` JSON DEFAULT NULL,
  `job_description` TEXT DEFAULT NULL,
  `status` ENUM('in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'in_progress',
  `overall_score` DECIMAL(4, 2) DEFAULT NULL,
  `correct_count` TINYINT UNSIGNED DEFAULT 0,
  `partially_correct_count` TINYINT UNSIGNED DEFAULT 0,
  `incorrect_count` TINYINT UNSIGNED DEFAULT 0,
  `report_summary` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT `fk_interviews_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_interviews_resume` FOREIGN KEY (`resume_id`) 
    REFERENCES `resumes` (`id`) ON DELETE SET NULL,
  INDEX `idx_interviews_user_id` (`user_id`),
  INDEX `idx_interviews_category` (`category`),
  INDEX `idx_interviews_status` (`status`),
  INDEX `idx_interviews_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Questions Table
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `interview_id` INT UNSIGNED NOT NULL,
  `question_number` TINYINT UNSIGNED NOT NULL,
  `question_text` TEXT NOT NULL,
  `topic` VARCHAR(100) NOT NULL,
  `difficulty` ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  `expected_concepts` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_questions_interview` FOREIGN KEY (`interview_id`) 
    REFERENCES `interviews` (`id`) ON DELETE CASCADE,
  INDEX `idx_questions_interview_id` (`interview_id`),
  UNIQUE KEY `uk_interview_question_num` (`interview_id`, `question_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Answers Table
CREATE TABLE IF NOT EXISTS `answers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `interview_id` INT UNSIGNED NOT NULL,
  `question_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `answer_text` TEXT NOT NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_answers_interview` FOREIGN KEY (`interview_id`) 
    REFERENCES `interviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_answers_question` FOREIGN KEY (`question_id`) 
    REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_answers_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_answers_interview_id` (`interview_id`),
  INDEX `idx_answers_question_id` (`question_id`),
  UNIQUE KEY `uk_interview_question_answer` (`interview_id`, `question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Evaluations Table
CREATE TABLE IF NOT EXISTS `evaluations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `answer_id` INT UNSIGNED NOT NULL,
  `interview_id` INT UNSIGNED NOT NULL,
  `score` DECIMAL(4, 2) NOT NULL, -- 0.00 to 10.00
  `technical_accuracy` DECIMAL(4, 2) DEFAULT NULL,
  `conceptual_understanding` DECIMAL(4, 2) DEFAULT NULL,
  `relevance` DECIMAL(4, 2) DEFAULT NULL,
  `completeness` DECIMAL(4, 2) DEFAULT NULL,
  `clarity` DECIMAL(4, 2) DEFAULT NULL,
  `verdict` ENUM('correct', 'partially_correct', 'incorrect') NOT NULL DEFAULT 'partially_correct',
  `what_went_well` TEXT DEFAULT NULL,
  `what_was_missing` TEXT DEFAULT NULL,
  `improvement_areas` TEXT DEFAULT NULL,
  `ideal_answer` TEXT DEFAULT NULL,
  `study_concepts` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_evaluations_answer` FOREIGN KEY (`answer_id`) 
    REFERENCES `answers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_evaluations_interview` FOREIGN KEY (`interview_id`) 
    REFERENCES `interviews` (`id`) ON DELETE CASCADE,
  INDEX `idx_evaluations_answer_id` (`answer_id`),
  INDEX `idx_evaluations_interview_id` (`interview_id`),
  UNIQUE KEY `uk_answer_evaluation` (`answer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
