param([string]$PostgresBin = "$env:USERPROFILE\Documents\postgres\postgresql-17.6-1-windows-x64-binaries\pgsql\bin")
$ErrorActionPreference = 'Stop'
$workspace = Split-Path $PSScriptRoot -Parent
$api = Join-Path $workspace 'AS-FLOW-PRM-SIZING-API'
$app = Join-Path $workspace 'AS-FLOW-PRM-SIZING-APP-V2'
$pgRoot = Join-Path $workspace '.local\postgres'
$pgData = Join-Path $pgRoot 'data'
if (!(Test-Path -LiteralPath (Join-Path $PostgresBin 'initdb.exe'))) {
    throw 'Set -PostgresBin to the bin directory of PostgreSQL 17 or newer.'
}
New-Item -ItemType Directory -Force -Path $pgRoot | Out-Null
$passwordFile = Join-Path $pgRoot 'password.txt'
if (!(Test-Path -LiteralPath $passwordFile)) {
    [IO.File]::WriteAllText($passwordFile, [Guid]::NewGuid().ToString('N'))
}
if (!(Test-Path -LiteralPath (Join-Path $pgData 'PG_VERSION'))) {
    & (Join-Path $PostgresBin 'initdb.exe') -D $pgData -U prv_local --encoding=UTF8 --locale=C --auth=scram-sha-256 "--pwfile=$passwordFile"
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL initialization failed.' }
}
$apiEnv = Join-Path $api '.env.local'
if (!(Test-Path -LiteralPath $apiEnv)) {
    $dbPassword = [IO.File]::ReadAllText($passwordFile).Trim()
    $settings = [ordered]@{
        NODE_ENV='development'; PORT='3001'; HOST='localhost'
        DB_HOST='localhost'; DB_PORT='5433'; DB_NAME='prv_sizing_local'; DB_DATABASE='prv_sizing_local'
        DB_USER='prv_local'; DB_PASS=$dbPassword
        MSSQL_SERVER='localhost'; MSSQL_PORT='1433'; MSSQL_DB='prv_sizing_local'
        MSSQL_USER='prv_local'; MSSQL_PASS=[Guid]::NewGuid().ToString('N')
        PRM_DB_SERVER='localhost'; PRM_DB_DATABASE='prv_sizing_local'
        SESSION_EMR_SECRET=[Guid]::NewGuid().ToString('N'); ACCESS_TOKEN_SECRET=[Guid]::NewGuid().ToString('N')
        REFRESH_TOKEN_SECRET=[Guid]::NewGuid().ToString('N'); PASSWORD_HASH_SALT_STRING=[Guid]::NewGuid().ToString('N')
        PASSWORD_HASH_SALT_ROUNDS='10'; ACCESS_TOKEN_EXPIRY='10m'; REFRESH_TOKEN_EXPIRY='1d'
        GQL_PATH='/gql'; VITE_DB_SCHEMA_PAYLOAD_FLAG='true'; LOCAL_DATABASE_BOOTSTRAP='true'
    }
    # Fresh checkouts may not contain the ignored development environment file.
    $workflowIds = @()
    $multiValveIds = @()
    Get-ChildItem -LiteralPath (Join-Path $api 'v2\data\workflows') -Filter 'workflowSections*.json' | ForEach-Object {
        if ($_.BaseName -match '^workflowSections(\d+)$') {
            $workflowId = [int]$Matches[1]
            $workflowIds += $workflowId
            $layout = Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json
            if ($layout | ForEach-Object { $_.fields } | Where-Object fieldName -eq 'IsMultivalve') {
                $multiValveIds += $workflowId
            }
        }
    }
    $settings['VITE_DB_SCHEMA_PAYLOAD_WORKFLOWS'] = ($workflowIds | Sort-Object) -join ','
    $settings['MULTIVALVE_SECTION_WF'] = ($multiValveIds | Sort-Object) -join ','
    # Retain available project feature configuration, without copying integration credentials.
    $developmentEnv = Join-Path $api '.env.dev'
    if (Test-Path -LiteralPath $developmentEnv) {
        Get-Content -LiteralPath $developmentEnv | ForEach-Object {
            if ($_ -match '^\s*(MULTIVALVE_SECTION_WF|VITE_DB_SCHEMA_PAYLOAD_WORKFLOWS)\s*=(.*)$') {
                $settings[$Matches[1]] = $Matches[2].Trim()
            }
        }
    }
    [IO.File]::WriteAllLines($apiEnv, @($settings.GetEnumerator() | ForEach-Object { $_.Key + '=' + $_.Value }))
}
$appEnv = Join-Path $app '.env.local'
if (!(Test-Path -LiteralPath $appEnv)) {
    [IO.File]::WriteAllLines($appEnv, @('VITE_API_URL=http://localhost:3001', 'VITE_GRAPHQL_ENDPOINT=/gql', 'VITE_API_GATEWAY_ENABLED=true', 'VITE_WF_BACKEND_CONFIGURATION_FLAG=true', 'VITE_CONFIGURATION_FLAG=false'))
}
& (Join-Path $PSScriptRoot 'start-local.ps1') -PostgresBin $PostgresBin -DatabaseOnly
Push-Location $api
try {
    & node --env-file=.env.local scripts/setup-local-db.js
    if ($LASTEXITCODE -ne 0) { throw 'Local schema/seed failed.' }
    & node scripts/sync-pressure-rule-expressions.js --database --env .env.local
    if ($LASTEXITCODE -ne 0) { throw 'Pressure-rule synchronization failed.' }
    & npm.cmd run db:workflow:local
    if ($LASTEXITCODE -ne 0) { throw 'Workflow JSON backfill failed.' }
} finally { Pop-Location }
Write-Output 'Database setup complete. Run scripts/start-local.ps1 to start the API and app.'
