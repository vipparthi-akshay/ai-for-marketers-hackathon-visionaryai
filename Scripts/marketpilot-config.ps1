#!/usr/bin/env pwsh
# MarketPilot AI - Chrome Auto-Refresh Configuration
# This file contains configuration settings and environment variables for the MarketPilot AI website opener script.

# ============================================================================
# ENVIRONMENT CONFIGURATION
# ============================================================================

# Default service endpoints - modify these to match your deployment
$env:MARKETPILOT_FRONTEND_URL = "http://localhost:3000"
$env:MARKETPILOT_BACKEND_URL = "http://localhost:8000/docs"

# Chrome optimization settings
$env:MARKETPILOT_CHROME_ARGS = "--start-maximized --no-first-run --no-default-browser-check --disable-translate --disable-features=TranslateUI --disable-web-security --disable-extensions --disable-plugins-discovery"

# Script behavior settings
$env:MARKETPILOT_TIMEOUT_SECONDS = "5"
$env:MARKETPILOT_RETRY_ATTEMPTS = "3"
$env:MARKETPILOT_RETRY_DELAY_SECONDS = "2"

# Output and logging
$env:MARKETPILOT_LOG_LEVEL = "INFO"  # DEBUG, INFO, WARNING, ERROR
$env:MARKETPILOT_ENABLE_COLOR_OUTPUT = "$true"

# Logging configuration
if (-not (Test-Path "%USERPROFILE%\Logs")) {
    New-Item -ItemType Directory -Path "%USERPROFILE%\Logs" -Force | Out-Null
}

$env:MARKETPILOT_LOG_FILE = "%USERPROFILE%\Logs\marketpilot-webopener-$(Get-Date -Format 'yyyyMMdd').log"

# ============================================================================
# CUSTOMIZATION FUNCTIONS
# ============================================================================

function Set-MarketpilotConfig {
    param(
        [string]$FrontendUrl,
        [string]$BackendUrl,
        [string]$ChromeArgs,
        [int]$TimeoutSeconds,
        [int]$RetryAttempts,
        [int]$RetryDelaySeconds,
        [string]$LogLevel,
        [bool]$EnableColorOutput
    )

    Write-Host "Updating MarketPilot AI configuration..." -ForegroundColor Cyan

    if ($FrontendUrl) { $env:MARKETPILOT_FRONTEND_URL = $FrontendUrl }
    if ($BackendUrl) { $env:MARKETPILOT_BACKEND_URL = $BackendUrl }
    if ($ChromeArgs) { $env:MARKETPILOT_CHROME_ARGS = $ChromeArgs }
    if ($TimeoutSeconds) { $env:MARKETPILOT_TIMEOUT_SECONDS = $TimeoutSeconds }
    if ($RetryAttempts) { $env:MARKETPILOT_RETRY_ATTEMPTS = $RetryAttempts }
    if ($RetryDelaySeconds) { $env:MARKETPILOT_RETRY_DELAY_SECONDS = $RetryDelaySeconds }
    if ($LogLevel) { $env:MARKETPILOT_LOG_LEVEL = $LogLevel }
    if ($EnableColorOutput) { $env:MARKETPILOT_ENABLE_COLOR_OUTPUT = $EnableColorOutput }

    Write-Host "Configuration updated successfully!" -ForegroundColor Green
    Show-CurrentConfig
}

function Show-CurrentConfig {
    Write-Host "`n=== Current MarketPilot AI Configuration ===" -ForegroundColor Yellow
    Write-Host "Frontend URL: $($env:MARKETPILOT_FRONTEND_URL)" -ForegroundColor White
    Write-Host "Backend URL: $($env:MARKETPILOT_BACKEND_URL)" -ForegroundColor White
    Write-Host "Chrome Args: $($env:MARKETPILOT_CHROME_ARGS)" -ForegroundColor White
    Write-Host "Timeout (seconds): $($env:MARKETPILOT_TIMEOUT_SECONDS)" -ForegroundColor White
    Write-Host "Retry Attempts: $($env:MARKETPILOT_RETRY_ATTEMPTS)" -ForegroundColor White
    Write-Host "Retry Delay (seconds): $($env:MARKETPILOT_RETRY_DELAY_SECONDS)" -ForegroundColor White
    Write-Host "Log Level: $($env:MARKETPILOT_LOG_LEVEL)" -ForegroundColor White
    Write-Host "Color Output: $($env:MARKETPILOT_ENABLE_COLOR_OUTPUT)" -ForegroundColor White
    Write-Host "===========================================`n" -ForegroundColor Yellow
}

function Reset-MarketpilotConfig {
    Write-Host "Resetting MarketPilot AI configuration to defaults..." -ForegroundColor Yellow

    $env:MARKETPILOT_FRONTEND_URL = "http://localhost:3000"
    $env:MARKETPILOT_BACKEND_URL = "http://localhost:8000/docs"
    $env:MARKETPILOT_CHROME_ARGS = "--start-maximized --no-first-run --no-default-browser-check --disable-translate --disable-features=TranslateUI --disable-web-security --disable-extensions --disable-plugins-discovery"
    $env:MARKETPILOT_TIMEOUT_SECONDS = "5"
    $env:MARKETPILOT_RETRY_ATTEMPTS = "3"
    $env:MARKETPILOT_RETRY_DELAY_SECONDS = "2"
    $env:MARKETPILOT_LOG_LEVEL = "INFO"
    $env:MARKETPILOT_ENABLE_COLOR_OUTPUT = "$true"

    Write-Host "Configuration reset to defaults!" -ForegroundColor Green
}

function Test-MarketpilotConnections {
    Write-Host "Testing MarketPilot AI service connections..." -ForegroundColor Cyan

    $frontendUrl = $env:MARKETPILOT_FRONTEND_URL
    $backendUrl = $env:MARKETPILOT_BACKEND_URL

    # Test frontend
    try {
        $frontendResponse = Invoke-WebRequest -Uri $frontendUrl -Method Get -TimeoutSec 5 -UseBasicParsing
        Write-Success "Frontend connection successful: HTTP $($frontendResponse.StatusCode)"
    }
    catch {
        Write-Error "Frontend connection failed: $($_.Exception.Message)"
    }

    # Test backend
    try {
        $backendResponse = Invoke-WebRequest -Uri $backendUrl -Method Get -TimeoutSec 5 -UseBasicParsing
        Write-Success "Backend connection successful: HTTP $($backendResponse.StatusCode)"
    }
    catch {
        Write-Error "Backend connection failed: $($_.Exception.Message)"
    }
}

# Initialize logging function
function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("DEBUG", "INFO", "WARNING", "ERROR")]
        [string]$Level = "INFO"
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"

    if ($env:MARKETPILOT_LOG_LEVEL -eq "DEBUG" -or $Level -eq "ERROR") {
        Write-Host $logEntry -ForegroundColor Red
    }
    elseif ($env:MARKETPILOT_LOG_LEVEL -eq "INFO" -or $Level -eq "WARNING") {
        Write-Host $logEntry -ForegroundColor Yellow
    }
    else {
        Write-Host $logEntry -ForegroundColor Gray
    }

    if ($env:MARKETPILOT_ENABLE_COLOR_OUTPUT -eq "$true") {
        Add-Content -Path $env:MARKETPILOT_LOG_FILE -Value $logEntry -Force
    }
}

# Load configuration when script is imported
if ($MyInvocation.Line) {
    . "$PSCommandPath"
}