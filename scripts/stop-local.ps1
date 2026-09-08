param([string]$PostgresBin = "$env:USERPROFILE\Documents\postgres\postgresql-17.6-1-windows-x64-binaries\pgsql\bin")
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'local-process.ps1')
$workspace = Split-Path $PSScriptRoot -Parent
$runtime = Join-Path $workspace '.local'
foreach ($name in @('api', 'app')) {
    $pidFile = Join-Path $runtime ($name + '.pid')
    $entryPoint = if ($name -eq 'api') {
        Join-Path $workspace 'AS-FLOW-PRM-SIZING-API\bin\www'
    } else {
        Join-Path $workspace 'AS-FLOW-PRM-SIZING-APP-V2\node_modules\vite\bin\vite.js'
    }
    $process = Get-VerifiedLocalNodeProcess -Runtime $runtime -Name $name -EntryPoint $entryPoint
    if ($process) {
        Stop-Process -InputObject $process
    } elseif (Test-Path -LiteralPath $pidFile) {
        Write-Output "$name has no matching process identity; no process was stopped."
    }
    Remove-Item -LiteralPath $pidFile -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath (Join-Path $runtime ($name + '.process.json')) -ErrorAction SilentlyContinue
}
$pgData = Join-Path $runtime 'postgres\data'
if (Test-Path -LiteralPath (Join-Path $pgData 'postmaster.pid')) {
    $pgArgs = '-D "{0}" -m fast -w stop' -f $pgData
    $pgStop = Start-Process -FilePath (Join-Path $PostgresBin 'pg_ctl.exe') -ArgumentList $pgArgs -WindowStyle Hidden -PassThru
    $pgStop.WaitForExit()
    if ($pgStop.ExitCode -ne 0) { throw 'PostgreSQL shutdown failed. Check .local/postgres/server.log.' }
}
Write-Output 'Verified local services stopped.'
