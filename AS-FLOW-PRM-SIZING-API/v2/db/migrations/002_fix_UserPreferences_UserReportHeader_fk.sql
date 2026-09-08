-- ============================================================
-- Migration: 002_fix_UserPreferences_UserReportHeader_fk
-- Purpose:   Re-point the UserId foreign keys on UserPreferences
--            and UserReportHeader from the legacy "User" table to
--            the current "UserDetails" table.
--
-- Root cause: UserPreferences_UserId_fkey (and its sibling on
-- UserReportHeader) were created referencing "User"."Id".
-- Registration now inserts into "UserDetails", so every new
-- registration attempt raises:
--   ERROR 23503: Key (UserId)=(N) is not present in table "User".
-- ============================================================

-- ── Step 1: Remove orphaned rows ─────────────────────────────
-- Any UserId in UserPreferences / UserReportHeader that does not
-- exist in UserDetails was created under the old "User" schema.
-- These rows must be removed before the new FK can be added.
-- They are safe to delete: no matching UserDetails row means
-- the account can no longer log in anyway.

DELETE FROM "UserReportHeader"
WHERE "UserId" NOT IN (SELECT "Id" FROM "UserDetails");

DELETE FROM "UserPreferences"
WHERE "UserId" NOT IN (SELECT "Id" FROM "UserDetails");

-- ── Step 2: UserPreferences FK ───────────────────────────────

ALTER TABLE "UserPreferences"
    DROP CONSTRAINT IF EXISTS "UserPreferences_UserId_fkey";

ALTER TABLE "UserPreferences"
    ADD CONSTRAINT "UserPreferences_UserId_fkey"
    FOREIGN KEY ("UserId")
    REFERENCES "UserDetails" ("Id")
    ON DELETE CASCADE;

-- ── Step 3: UserReportHeader FK ──────────────────────────────
-- Drop any FK on UserId regardless of its original name, then
-- re-add it pointing to "UserDetails".

DO $$
DECLARE
    _conname text;
BEGIN
    SELECT conname INTO _conname
    FROM   pg_constraint c
    JOIN   pg_class t ON t.oid = c.conrelid
    WHERE  t.relname = 'UserReportHeader'
      AND  c.contype = 'f'
      AND  EXISTS (
               SELECT 1 FROM pg_attribute a
               WHERE  a.attrelid = c.conrelid
                 AND  a.attname  = 'UserId'
                 AND  a.attnum   = ANY(c.conkey)
           );

    IF _conname IS NOT NULL THEN
        EXECUTE format('ALTER TABLE "UserReportHeader" DROP CONSTRAINT %I', _conname);
    END IF;
END $$;

ALTER TABLE "UserReportHeader"
    ADD CONSTRAINT "UserReportHeader_UserId_fkey"
    FOREIGN KEY ("UserId")
    REFERENCES "UserDetails" ("Id")
    ON DELETE CASCADE;

-- ============================================================
-- Rollback (run manually to undo — only if "User" table still
-- exists and holds the original data)
-- ============================================================
-- ALTER TABLE "UserReportHeader"
--     DROP CONSTRAINT IF EXISTS "UserReportHeader_UserId_fkey";
-- ALTER TABLE "UserReportHeader"
--     ADD CONSTRAINT "UserReportHeader_UserId_fkey"
--     FOREIGN KEY ("UserId") REFERENCES "User" ("Id") ON DELETE CASCADE;
--
-- ALTER TABLE "UserPreferences"
--     DROP CONSTRAINT IF EXISTS "UserPreferences_UserId_fkey";
-- ALTER TABLE "UserPreferences"
--     ADD CONSTRAINT "UserPreferences_UserId_fkey"
--     FOREIGN KEY ("UserId") REFERENCES "User" ("Id") ON DELETE CASCADE;
