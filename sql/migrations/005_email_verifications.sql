-- Email verification state (separate from member profile)
CREATE TABLE IF NOT EXISTS rb_email_verifications (
  member_id INT UNSIGNED NOT NULL PRIMARY KEY,
  token VARCHAR(64) DEFAULT NULL,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_email_verification_member
    FOREIGN KEY (member_id) REFERENCES rb_members(id) ON DELETE CASCADE,
  UNIQUE KEY uq_email_verification_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
