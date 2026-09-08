# Local setup

This workspace uses Node.js 24, PostgreSQL 17, a React/Vite app, and an Express API.

| Service | Address |
| --- | --- |
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/v2/api |
| GraphQL | http://localhost:3001/gql |
| PostgreSQL | localhost:5433, database `prv_sizing_local`, user `prv_local` |

Run these commands from this workspace in PowerShell:

```powershell
# Install once in each project; the checked-in lockfiles are used.
Set-Location AS-FLOW-PRM-SIZING-API
npm.cmd ci
Set-Location ..\AS-FLOW-PRM-SIZING-APP-V2
npm.cmd ci
Set-Location ..

# Initialize or resume the dedicated local database, then seed available data.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\setup-local.ps1

# Start the database, API, and Vite as background processes.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\start-local.ps1

# Stop only those local processes.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\stop-local.ps1
```

The scripts use the existing portable PostgreSQL installation under
`Documents/postgres/postgresql-17.6-1-windows-x64-binaries/pgsql/bin`.
Pass `-PostgresBin 'C:\path\to\pgsql\bin'` to use another installation.

Local login credentials are in `.local/login.json`. Database credentials are in
`AS-FLOW-PRM-SIZING-API/.env.local` and `.local/postgres/password.txt`.
The API and app load their own `.env.local` files. The original `.env.dev`,
`.env.stage`, and frontend `.env` are preserved. Runtime data, secrets, and logs
are ignored by Git. API and frontend logs are under `.local/`.
If `.env.dev` is absent, setup derives the enabled generated workflows and
Multi-Valve workflow IDs from the checked-in generated layouts. When `.env.dev`
exists, its two workflow feature lists are retained.

For foreground development, start the database using
`scripts/start-local.ps1 -DatabaseOnly`, then run `npm.cmd run start:local` in the API
and `npm.cmd run dev` in the frontend in separate terminals.

## Available database data

The local seed creates the authentication/preferences tables, UOMs, normalized
workflow sections/fields/expressions, and a workflow catalog. It preserves existing
rows on subsequent runs. Workflow IDs and labels 1–25 come from
`KT_Docs/Copy of PRVPA_FRS_V2.0 (2024.07.26) 2.xlsx`, `Part1-Main` sections
4.4.1.1–4.4.1.25. Catalog lookup IDs are local identifiers; unspecified codes remain
null. Workflow 1's `SectionVIII` code also appears in the KT REST API documentation.

`scripts/local-field-properties.sql` supplies the two field-property lookup
functions needed to exercise local validation against these snapshot tables.
These local functions are not a copy of the deployed database procedures.

The workflow persistence migration adds `WorkflowDetails` and backfills the existing
generated backend layouts. See the API's `docs/workflow-persistence.md` for update,
backfill, and recovery commands. Pressure expressions are synchronized with
`scripts/sync-pressure-rule-expressions.js` before backfill.

## Remaining data requirement

The repository and KT folder do not include the complete PRV application database
backup, valve catalog, calculation/selection reference tables, or SQL Server
drawing procedures. Local login, workflow layouts, pressure validation and workflow
JSON persistence can be exercised. Full sizing results, valve selection, saved
sizing/report flows, and drawings need the corresponding database backups or
configured development services. No valve reference values were fabricated.

Deleting `.local/login.json` and rerunning setup creates fresh credentials for the
local developer account. Normal setup reruns preserve its existing password.
Start/stop scripts record the Node process start time and absolute entrypoint so
stale PID files cannot select an unrelated process. A port occupied by an
unverified process must be freed before starting the local services.

SQL Server is not installed or seeded by these scripts. Optional Okta-dependent
routes report unavailable until configured; local JWT login remains enabled.
An existing backup found in `Documents/postgres` belongs to a different application
(`develop_apptoolbox`) and was not restored into this database.

## Verification

```powershell
Set-Location AS-FLOW-PRM-SIZING-API
npm.cmd run test:workflow:local
node --test test/section-viii-fire-rules.test.js test/section-viii-fire-multivalve-runtime.test.js
node --env-file=.env.local --test tests/integration/multi-valve-overpressure.test.js
Set-Location ..\AS-FLOW-PRM-SIZING-APP-V2
npm.cmd run build
```

See the API task documents for pressure-rule regression commands and source references.
