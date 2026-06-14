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
