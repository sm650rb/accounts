-- Road Burners member accounts
-- Full DDL reference; migrations run from acc/sql/migrations/ on service start.

CREATE TABLE IF NOT EXISTS rb_members (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  blood_group VARCHAR(5) DEFAULT NULL,
  bike_model VARCHAR(100) NOT NULL DEFAULT 'Super Meteor 650',
  bike_color VARCHAR(100) DEFAULT NULL,
  bike_registration VARCHAR(20) DEFAULT NULL,
  emergency_contact_name VARCHAR(255) DEFAULT NULL,
  emergency_contact_phone VARCHAR(20) DEFAULT NULL,
  membership_status ENUM('pending', 'active', 'suspended') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_email (email),
  UNIQUE KEY uq_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rb_email_verifications (
  member_id INT UNSIGNED NOT NULL PRIMARY KEY,
  token VARCHAR(64) DEFAULT NULL,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_email_verification_member
    FOREIGN KEY (member_id) REFERENCES rb_members(id) ON DELETE CASCADE,
  UNIQUE KEY uq_email_verification_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rb_registration_sessions (
  id CHAR(36) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  otp_code CHAR(6) NOT NULL,
  otp_verified TINYINT(1) NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_reg_phone (phone),
  KEY idx_reg_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
