param(
    [string]$PostgresBin = "$env:USERPROFILE\Documents\postgres\postgresql-17.6-1-windows-x64-binaries\pgsql\bin",
    [switch]$DatabaseOnly
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'local-process.ps1')
$workspace = Split-Path $PSScriptRoot -Parent
$runtime = Join-Path $workspace '.local'
$pgData = Join-Path $runtime 'postgres\data'
if (!(Test-Path -LiteralPath (Join-Path $pgData 'PG_VERSION'))) {
    throw 'Local database has not been initialized. See LOCAL_SETUP.md.'
}
& (Join-Path $PostgresBin 'pg_ctl.exe') -D $pgData status *> $null
if ($LASTEXITCODE -ne 0) {
    $pgArgs = '-D "{0}" -l "{1}" -o "-p 5433 -h localhost" -w start' -f $pgData, (Join-Path $runtime 'postgres\server.log')
    $pgStart = Start-Process -FilePath (Join-Path $PostgresBin 'pg_ctl.exe') -ArgumentList $pgArgs -WindowStyle Hidden -PassThru
    $pgStart.WaitForExit()
    if ($pgStart.ExitCode -ne 0) { throw 'PostgreSQL startup failed. Check .local/postgres/server.log.' }
}
Write-Output 'PostgreSQL: localhost:5433 / prv_sizing_local'
if ($DatabaseOnly) { return }
$nodePath = (Get-Command node.exe).Source
$projects = @(
    @{ Name = 'api'; Directory = 'AS-FLOW-PRM-SIZING-API'; Script = 'bin\www'; Port = 3001 },
    @{ Name = 'app'; Directory = 'AS-FLOW-PRM-SIZING-APP-V2'; Script = 'node_modules\vite\bin\vite.js'; Port = 3000 }
)
foreach ($project in $projects) {
    $projectDirectory = Join-Path $workspace $project.Directory
    $entryPoint = Join-Path $projectDirectory $project.Script
    $existing = Get-VerifiedLocalNodeProcess -Runtime $runtime -Name $project.Name -EntryPoint $entryPoint
    if ($existing) {
        Write-Output ($project.Name + ' already running: http://localhost:' + $project.Port)
        continue
    }
    $listener = Get-NetTCPConnection -State Listen -LocalPort $project.Port -ErrorAction SilentlyContinue
    if ($listener) {
        throw "Port $($project.Port) is occupied by an unverified process. Stop that process before starting $($project.Name)."
    }
    $arguments = if ($project.Name -eq 'api') {
        '"--env-file={0}" "{1}"' -f (Join-Path $projectDirectory '.env.local'), $entryPoint
    } else {
        '"{0}" --host localhost --port 3000 --strictPort' -f $entryPoint
    }
    $process = Start-Process -FilePath $nodePath -ArgumentList $arguments -WorkingDirectory $projectDirectory -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtime ($project.Name + '.log')) -RedirectStandardError (Join-Path $runtime ($project.Name + '.error.log'))
    $deadline = (Get-Date).AddSeconds(60)
    do {
        $process.Refresh()
        if ($process.HasExited) { throw "$($project.Name) exited during startup. Check .local/$($project.Name).error.log." }
        $listener = Get-NetTCPConnection -State Listen -LocalPort $project.Port -ErrorAction SilentlyContinue | Where-Object OwningProcess -eq $process.Id
        if ($listener) { break }
        Start-Sleep -Milliseconds 250
    } while ((Get-Date) -lt $deadline)
    if (!$listener) {
        Stop-Process -InputObject $process
        throw "$($project.Name) has not opened port $($project.Port). Check .local/$($project.Name).error.log."
    }
    Save-LocalNodeProcess -Runtime $runtime -Name $project.Name -EntryPoint $entryPoint -Process $process -ExecutablePath $nodePath
    Write-Output ($project.Name + ': http://localhost:' + $project.Port)
}
