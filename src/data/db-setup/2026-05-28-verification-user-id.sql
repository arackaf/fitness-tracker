ALTER TABLE "verification"
  ADD COLUMN IF NOT EXISTS "userId" TEXT REFERENCES "user" ("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "verification_userId_idx"
  ON "verification" ("userId");
