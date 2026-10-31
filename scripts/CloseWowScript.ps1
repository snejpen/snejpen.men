$selection = Read-Host "Select version, 1 = Modern, 2 = Classic, 3 = Forever"

switch ($selection) {
    "1" { $processName = "Wow" }
    "2" { $processName = "WowClassic" }
    "3" { $processName = "WowB" }
    default {
        Write-Host "Invalid selection. Please run the script again."
        exit
    }
}

$minInput = Read-Host "Enter minimum interval in minutes (suggested: 15)"
$maxInput = Read-Host "Enter maximum interval in minutes (suggested: 35)"

if ([string]::IsNullOrWhiteSpace($minInput)) {
    $minMinutes = 15
} else {
    $minMinutes = 0
    if (-not [int]::TryParse($minInput, [ref]$minMinutes) -or $minMinutes -lt 1) {
        Write-Host "Invalid minimum interval. Please run the script again."
        exit
    }
}

if ([string]::IsNullOrWhiteSpace($maxInput)) {
    $maxMinutes = 35
} else {
    $maxMinutes = 0
    if (-not [int]::TryParse($maxInput, [ref]$maxMinutes) -or $maxMinutes -lt 1) {
        Write-Host "Invalid maximum interval. Please run the script again."
        exit
    }
}

if ($minMinutes -gt $maxMinutes) {
    Write-Host "Minimum interval cannot be greater than maximum interval."
    exit
}

$minSeconds = $minMinutes * 60
$maxSeconds = ($maxMinutes * 60) + 1

Write-Host "Script is now running"

while ($true) {
    $seconds = Get-Random -Minimum $minSeconds -Maximum $maxSeconds
    Start-Sleep -Seconds $seconds

    Get-Process -Name $processName -ErrorAction SilentlyContinue |
        Stop-Process -Force -ErrorAction SilentlyContinue
}
