-- ============================================================
-- Migration: 001_create_UserDetails
-- Table:     "UserDetails"
-- Purpose:   Stores local application user credentials
--            used by the UserAuthentication model.
-- ============================================================

-- Auto-update trigger function (shared; create once per DB)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Table: UserDetails
-- ============================================================
CREATE TABLE IF NOT EXISTS "UserDetails" (
    "Id"           SERIAL          PRIMARY KEY,
    "Name"         VARCHAR(255)    NOT NULL,
    "Email"        VARCHAR(320)    NOT NULL,
    "PasswordHash" TEXT            NOT NULL,
    "AppType"      VARCHAR(50)     NOT NULL DEFAULT 'sizing',
    "CreatedAt"    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "UpdatedAt"    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Enforce unique emails per app type
    CONSTRAINT "UQ_UserDetails_Email_AppType" UNIQUE ("Email", "AppType"),

    -- Guard against empty strings
    CONSTRAINT "CHK_UserDetails_Name_NotEmpty"         CHECK (TRIM("Name")         <> ''),
    CONSTRAINT "CHK_UserDetails_Email_NotEmpty"        CHECK (TRIM("Email")        <> ''),
    CONSTRAINT "CHK_UserDetails_PasswordHash_NotEmpty" CHECK (TRIM("PasswordHash") <> '')
);

-- Index: fast lookup by email (used in findByEmail query)
CREATE INDEX IF NOT EXISTS "IDX_UserDetails_Email"
    ON "UserDetails" ("Email");

-- Trigger: keep UpdatedAt current on every row update
DROP TRIGGER IF EXISTS "TRG_UserDetails_UpdatedAt" ON "UserDetails";
CREATE TRIGGER "TRG_UserDetails_UpdatedAt"
    BEFORE UPDATE ON "UserDetails"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Rollback (run manually to undo this migration)
-- ============================================================
-- DROP TRIGGER IF EXISTS "TRG_UserDetails_UpdatedAt" ON "UserDetails";
-- DROP INDEX  IF EXISTS "IDX_UserDetails_Email";
-- DROP TABLE  IF EXISTS "UserDetails";
