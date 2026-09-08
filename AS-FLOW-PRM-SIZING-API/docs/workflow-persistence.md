# Workflow JSON persistence

The existing `GET /v2/api/layoutData/workflow/file/update?workFlowId=1` operation
now saves the generated layout to PostgreSQL `"WorkflowDetails"` and publishes
the same JSON to `v2/data/workflows/workflowSections1.json`. It retains the
existing success response. Validation/missing workflows return 400/404;
database and filesystem failures return 500 instead of a misleading success.

`"WorkflowId"` is the primary key, `"WorkflowDetails"` is a JSONB section array,
and `"PopupDetails"` stores the optional generated popup object. Creation and
update timestamps are recorded. Repeated updates replace the existing row.

Apply the migration and import the existing generated files locally:

```powershell
npm run db:workflow:local
```

For another configured environment, explicitly select its env file:

```powershell
node --env-file=.env.stage scripts/migrate-workflow-details.js --backfill
```

The migration is idempotent. Backfill inserts missing workflow rows and leaves
existing rows and JSON files intact. Only layouts present under
`v2/data/workflows` are imported. The original source layouts in `v2/data` remain
the inputs for normalized-table imports. Existing payload configuration
(`VITE_DB_SCHEMA_PAYLOAD_FLAG` and `VITE_DB_SCHEMA_PAYLOAD_WORKFLOWS`) continues
to control which layouts the application serves.

To publish later changes, refresh the normalized table snapshots using the
existing `/v2/api/layoutData/datafiles/create` operation, then call the workflow
file update operation for each affected workflow. Both requests use the
application's existing authentication.

Updates use a PostgreSQL transaction and advisory lock, including shared popup
files. Each file is replaced by renaming a completed temporary file. An error
restores already replaced files and rolls back the database update. PostgreSQL
and the filesystem do not share a crash-atomic transaction: after a process
crash or an uncertain database commit, restore files from the committed rows:

```powershell
node --env-file=.env.local scripts/migrate-workflow-details.js --restore
```

Restore runs under the same publication lock and does not change database
records. Deployments with separate backend filesystems must run restore on each
instance after changes; the database lock alone does not distribute files.

Run integration checks against the local database:

```powershell
npm run test:workflow:local
```

Tests create an isolated PostgreSQL schema and temporary filesystem directory,
then remove both. They exercise repeated upserts, nested JSON round trips,
concurrent publication, file/database failures, restoration, ID validation, and
the existing generator/controller update path.
