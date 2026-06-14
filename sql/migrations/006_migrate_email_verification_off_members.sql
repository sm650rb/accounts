-- Move verification data off rb_members (no-op if columns were never added)
INSERT IGNORE INTO rb_email_verifications (member_id, token, sent_at, verified_at)
SELECT
  id,
  email_verification_token,
  COALESCE(email_verification_sent_at, created_at),
  IF(email_verified = 1, COALESCE(email_verification_sent_at, created_at), NULL)
FROM rb_members
WHERE email_verification_token IS NOT NULL OR email_verified = 1;

ALTER TABLE rb_members DROP COLUMN IF EXISTS email_verified;
ALTER TABLE rb_members DROP COLUMN IF EXISTS email_verification_token;
ALTER TABLE rb_members DROP COLUMN IF EXISTS email_verification_sent_at;
