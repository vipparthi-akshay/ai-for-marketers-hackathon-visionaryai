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

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  MarketPilot AI - Hackathon Launch" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# Step 1: Check if Docker Desktop is running
Write-InfoMsg "Step 1: Checking Docker Desktop..."
$dockerRunning = $false
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
        Write-Success "Docker is available: $dockerVersion"
    }
}
catch {
    Write-WarningMsg "Docker command failed: $($_.Exception.Message)"
}

# Step 2: Start Docker Desktop Service if needed
if (-not (Test-Port 8000) -and -not (Test-Port 3000)) {
    $svc = Get-Service -Name "Docker Desktop Service" -ErrorAction SilentlyContinue
    if ($svc -and $svc.Status -eq "Stopped") {
        Write-InfoMsg "Starting Docker Desktop Service..."
        try {
            Start-Service -Name "Docker Desktop Service" -ErrorAction Stop
            Write-InfoMsg "Waiting for Docker Desktop to initialize (15 seconds)..."
            Start-Sleep -Seconds 15
            Write-Success "Docker Desktop Service started."
        }
        catch {
            Write-WarningMsg "Could not start Docker Desktop Service automatically."
            Write-WarningMsg "Please launch Docker Desktop manually and re-run this script."
            Write-Host ""
            Write-Host "  1. Press Ctrl+C to stop this script" -ForegroundColor Yellow
            Write-Host "  2. Open Docker Desktop from Start Menu" -ForegroundColor Yellow
            Write-Host "  3. Wait for Docker Desktop to be ready" -ForegroundColor Yellow
            Write-Host "  4. Run this script again" -ForegroundColor Yellow
            Write-Host ""
            pause
            exit 1
        }
    }
    elseif ($svc -and $svc.Status -eq "Running") {
        Write-Success "Docker Desktop Service is already running."
    }
}

# Step 3: Start services with docker-compose
Write-InfoMsg "Step 2: Starting services with docker-compose..."
$composeOutput = docker-compose up -d 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-WarningMsg "docker-compose output: $composeOutput"
}
else {
    Write-Success "docker-compose up -d succeeded."
}

# Step 4: Wait for services to be ready
Write-InfoMsg "Step 3: Waiting for services to be ready..."
$maxWait = 60
$waited = 0
while ($waited -lt $maxWait) {
    if ((Test-Port 8000) -and (Test-Port 3000)) {
        Write-Success "Both frontend (3000) and backend (8000) are up!"
        break
    }
    if ($waited % 10 -eq 0 -and $waited -gt 0) {
        Write-InfoMsg "Still waiting... ($waited seconds elapsed)"
    }
    Start-Sleep -Seconds 2
    $waited += 2
}

# Step 5: Check if services are ready
$frontendOK = Test-Port 3000
$backendOK = Test-Port 8000

if (-not $frontendOK -and -not $backendOK) {
    Write-ErrorMsg "Neither frontend (3000) nor backend (8000) is responding."
    Write-InfoMsg "Please check docker-compose logs: docker-compose logs"
    Write-InfoMsg "Make sure Docker Desktop is running and has enough resources."
    pause
    exit 1
}

if (-not $frontendOK) {
    Write-WarningMsg "Frontend (port 3000) is not responding yet."
    Write-InfoMsg "Backend (port 8000) is available - API docs at http://localhost:8000/docs"
}
if (-not $backendOK) {
    Write-WarningMsg "Backend (port 8000) is not responding yet."
    Write-InfoMsg "Frontend (port 3000) may be available."
}

# Step 6: Open Chrome ONLY
$chromeExe = "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromeExe)) {
    $chromeExe = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
}

if (-not (Test-Path $chromeExe)) {
    Write-ErrorMsg "Google Chrome not found at expected location."
    Write-InfoMsg "Please open Chrome manually and navigate to:"
    Write-Host "  http://localhost:3000" -ForegroundColor White
    pause
    exit 1
}

Write-Host ""
Write-InfoMsg "Opening MarketPilot AI in Chrome ONLY..."
$chromeArgs = "--start-maximized --new-window --disable-extensions --disable-plugins-discovery"
Start-Process -FilePath $chromeExe -ArgumentList "$chromeArgs http://localhost:3000" -WindowStyle Normal

Write-Host ""
Write-Success "MarketPilot AI is now running in Chrome!"
Write-Host ""
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Health:   http://localhost:8000/health" -ForegroundColor White
Write-Host ""
Write-Host "  Close this PowerShell window to stop." -ForegroundColor Gray
Write-Host "  Chrome is the only application open." -ForegroundColor Gray
Write-Host ""

# Keep window open so evaluator can see status
Write-Host "Press Ctrl+C to stop all services." -ForegroundColor Gray
pause