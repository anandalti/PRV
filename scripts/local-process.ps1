# Process identity helpers shared by the local start/stop scripts.
function Get-VerifiedLocalNodeProcess {
    param([string]$Runtime, [string]$Name, [string]$EntryPoint)
    $metadataFile = Join-Path $Runtime ($Name + '.process.json')
    if (!(Test-Path -LiteralPath $metadataFile)) { return $null }
    try {
        $metadata = Get-Content -LiteralPath $metadataFile -Raw | ConvertFrom-Json
        $process = Get-Process -Id ([int]$metadata.Id) -ErrorAction SilentlyContinue
        if (!$process -or $metadata.EntryPoint -ne $EntryPoint -or
            $process.Path -ne $metadata.ExecutablePath -or
            $process.StartTime.ToUniversalTime().ToString('o') -ne $metadata.StartTimeUtc) { return $null }
        $details = Get-CimInstance Win32_Process -Filter "ProcessId = $($process.Id)"
        if (!$details.CommandLine -or $details.CommandLine.IndexOf($EntryPoint, [StringComparison]::OrdinalIgnoreCase) -lt 0) { return $null }
        return $process
    } catch { return $null }
}

function Save-LocalNodeProcess {
    param([string]$Runtime, [string]$Name, [string]$EntryPoint, [System.Diagnostics.Process]$Process, [string]$ExecutablePath)
    $running = Get-Process -Id $Process.Id
    if ($running.Path) { $ExecutablePath = $running.Path }
    if (!$ExecutablePath) { throw 'Cannot record the local Node executable path.' }
    $metadata = [ordered]@{
        Id = $Process.Id
        StartTimeUtc = $Process.StartTime.ToUniversalTime().ToString('o')
        ExecutablePath = $ExecutablePath
        EntryPoint = $EntryPoint
    }
    $metadata | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $Runtime ($Name + '.process.json'))
    Set-Content -LiteralPath (Join-Path $Runtime ($Name + '.pid')) -Value $Process.Id
}
