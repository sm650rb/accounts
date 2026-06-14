-- Applied automatically on service start (acc/scripts/run-migrations.mjs)
-- Safe to re-run: duplicate column errors are ignored if already applied out-of-band.

ALTER TABLE rb_members
  ADD COLUMN blood_group VARCHAR(5) DEFAULT NULL AFTER phone;
