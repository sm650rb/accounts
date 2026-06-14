-- Phone numbers must be unique per member account
ALTER TABLE rb_members ADD UNIQUE KEY uq_phone (phone);
