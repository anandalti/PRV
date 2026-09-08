-- Stores the generated layouts also published to v2/data/workflows.
-- Idempotent: safe to apply before backfilling the existing workflow files.
CREATE TABLE IF NOT EXISTS "WorkflowDetails" (
    "WorkflowId"      INTEGER     PRIMARY KEY CHECK ("WorkflowId" > 0),
    "WorkflowDetails" JSONB       NOT NULL CHECK (jsonb_typeof("WorkflowDetails") = 'array'),
    "PopupDetails"    JSONB       CHECK ("PopupDetails" IS NULL OR jsonb_typeof("PopupDetails") = 'object'),
    "CreatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
