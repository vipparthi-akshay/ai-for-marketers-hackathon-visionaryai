#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

function Write-Success([string]$Message) { Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-ErrorMsg([string]$Message) { Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-WarningMsg([string]$Message) { Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Write-InfoMsg([string]$Message) { Write-Host "[INFO] $Message" -ForegroundColor Cyan }

function Test-Port {
    param([int]$Port, [int]$TimeoutMs = 5000)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Client.SetSocketOption([System.Net.Sockets.SocketOptionLevel]::Socket, [System.Net.Sockets.SocketOption]::KeepAlive, $true)
        $ar = $tcpClient.BeginConnect("localhost", $Port, $null, $null)
        $wait = $ar.AsyncWaitHandle.WaitOne($TimeoutMs, $false)
        if ($wait) { $tcpClient.EndConnect($ar); $tcpClient.Close(); return $true }
        $tcpClient.Close()
        return $false
    }
    catch { return $false }
}

function Start-BackgroundService {
    param([string]$Name, [string]$WorkingDir, [string]$Command)
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "powershell.exe"
    $psi.Arguments = "-NoProfile -WindowStyle Hidden -Command $Command"
    $psi.WorkingDirectory = $WorkingDir
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo = $psi
    $proc.Start() | Out-Null
    return $proc
}

function Start-Services {
    Write-InfoMsg "Checking Docker Desktop Service..."
    $svc = Get-Service -Name "Docker Desktop Service" -ErrorAction SilentlyContinue
    if ($svc -and $svc.Status -eq "Stopped") {
        Write-WarningMsg "Docker Desktop Service is stopped."
        Write-InfoMsg "Attempting to start Docker Desktop Service..."
        try {
            Start-Service -Name "Docker Desktop Service" -ErrorAction Stop
            Start-Sleep -Seconds 15
            Write-Success "Docker Desktop Service started."
        }
        catch {
            Write-WarningMsg "Could not start Docker Desktop Service automatically: $($_.Exception.Message)"
            Write-InfoMsg "Please start Docker Desktop manually and re-run this script."
            return $false
        }
    }

    Write-InfoMsg "Running docker-compose up -d..."
    $output = docker-compose up -d 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-WarningMsg "Docker Compose start may have issues: $output"
    }

    Write-InfoMsg "Waiting for services to be ready..."
    $i = 0
    while ($i -lt 40) {
        if ((Test-Port 8000) -and (Test-Port 3000)) {
            Write-Success "All services are up and running."
            return $true
        }
        Start-Sleep -Seconds 2
        $i++
    }

    if (-not (Test-Port 8000)) { Write-WarningMsg "Backend (port 8000) is not responding." }
    if (-not (Test-Port 3000)) { Write-WarningMsg "Frontend (port 3000) is not responding." }
    return $false
}

function Open-MarketpilotWebsite {
    Write-Host "=========== MarketPilot AI ===========" -ForegroundColor Magenta

    $backendOK = Test-Port 8000
    $frontendOK = Test-Port 3000

    if (-not $backendOK -or -not $frontendOK) {
        Write-InfoMsg "Starting services..."
        $started = Start-Services
        Start-Sleep -Seconds 3
        $backendOK = Test-Port 8000
        $frontendOK = Test-Port 3000
    }

    if (-not $frontendOK) {
        Write-ErrorMsg "Frontend (port 3000) is not available yet."
        Write-InfoMsg "Please start frontend manually, then run this script again."
        Write-InfoMsg "Or start Docker Desktop and run: docker-compose up -d"
        return
    }

    $chromeExe = "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
    if (-not (Test-Path $chromeExe)) {
        $chromeExe = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
    }

    if (-not (Test-Path $chromeExe)) {
        Write-ErrorMsg "Google Chrome not found."
        return
    }

    Write-InfoMsg "Opening ONLY Chrome with the running website..."
    $chromeArgs = "--start-maximized --new-window --disable-extensions --disable-plugins-discovery"
    Start-Process -FilePath $chromeExe -ArgumentList "$chromeArgs http://localhost:3000" -WindowStyle Normal

    Write-Success "MarketPilot AI is now open in Chrome ONLY."
    Write-Host ""
    Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "  Backend:  http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Close this window - Chrome is the only application open." -ForegroundColor Gray
}

# Main execution
$Force = $args -contains "-Force" -or $args -contains "--force"
Open-MarketpilotWebsite