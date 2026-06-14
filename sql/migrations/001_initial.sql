-- Applied automatically on service start (acc/scripts/run-migrations.mjs)

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
  UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
