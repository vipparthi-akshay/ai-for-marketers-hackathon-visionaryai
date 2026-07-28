#!/usr/bin/env pwsh
# MarketPilot AI - Quick Setup Script
# Automated setup for the MarketPilot AI website opener system

# Error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Success([string]$Message) {
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error([string]$Message) {
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning([string]$Message) {
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info([string]$Message) {
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Test-PowerShellVersion {
    $version = $PSVersionTable.PSVersion.Major
    if ($version -lt 7) {
        Write-Warning "PowerShell $version detected. Version 7+ is recommended for better compatibility."
    }
    else {
        Write-Success "PowerShell $version detected. Good to go!"
    }
}

function Test-ChromeInstallation {
    try {
        $chromePath = "${env:ProgramFiles(x86)}\\Google\\Chrome\\Application\\chrome.exe"
        if (Test-Path $chromePath) {
            Write-Success "Google Chrome found at: $chromePath"
            return $true
        }
        else {
            Write-Error "Google Chrome not found. Please install Google Chrome first."
            return $false
        }
    }
    catch {
        Write-Error "Error checking Chrome installation: $($_.Exception.Message)"
        return $false
    }
}

function New-ScriptsDirectory {
    $scriptsPath = "$env:USERPROFILE\Scripts"
    try {
        if (-not (Test-Path $scriptsPath)) {
            New-Item -ItemType Directory -Path $scriptsPath -Force | Out-Null
            Write-Success "Created Scripts directory: $scriptsPath"
        }
        else {
            Write-Info "Scripts directory already exists: $scriptsPath"
        }
    }
    catch {
        Write-Error "Failed to create Scripts directory: $($_.Exception.Message)"
        return $false
    }
    return $scriptsPath
}

function Copy-ScriptFiles {
    param([string]$DestinationPath)

    $scriptFiles = @(
        "open-marketpilot.ps1",
        "open-marketpilot.bat",
        "open-marketpilot-README.md"
    )

    foreach ($file in $scriptFiles) {
        $sourceFile = Join-Path $PSScriptRoot $file
        $destFile = Join-Path $DestinationPath $file

        if (Test-Path $sourceFile) {
            Copy-Item -Path $sourceFile -Destination $destFile -Force
            Write-Success "Copied $file to $DestinationPath"
        }
        else {
            Write-Error "Source file not found: $sourceFile"
            return $false
        }
    }
    return $true
}

function Set-ExecutionPolicy {
    try {
        $currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
        if ($currentPolicy -ne "Bypass") {
            Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
            Write-Success "Set PowerShell execution policy to Bypass"
        }
        else {
            Write-Info "PowerShell execution policy is already set to Bypass"
        }
    }
    catch {
        Write-Error "Failed to set execution policy: $($_.Exception.Message)"
        return $false
    }
    return $true
}

function Create-DesktopShortcut {
    try {
        Add-Type -AssemblyName "System.Drawing"
        $targetPath = "$env:USERPROFILE\Scripts\open-marketpilot.ps1"
        $shortcutPath = "$env:USERPROFILE\Desktop\MarketPilot AI.lnk"

        $shell = New-Object -ComObject "WScript.Shell"
        $shortcut = $shell.CreateShortcut($shortcutPath)
        $shortcut.TargetPath = "powershell.exe"
        $shortcut.Arguments = "-ExecutionPolicy Bypass -File \"$targetPath\""
        $shortcut.WorkingDirectory = "$env:USERPROFILE\Scripts"
        $shortcut.Description = "Open MarketPilot AI website with error prevention"
        $shortcut.IconLocation = "$targetPath,0"
        $shortcut.Save()

        Write-Success "Created desktop shortcut: $shortcutPath"
        return $true
    }
    catch {
        Write-Error "Failed to create desktop shortcut: $($_.Exception.Message)"
        return $false
    }
}

function Test-ScriptFunctionality {
    param([string]$ScriptsPath)

    try {
        $scriptPath = Join-Path $ScriptsPath "open-marketpilot.ps1"
        $result = powershell -ExecutionPolicy Bypass -File $scriptPath -Command "Write-Host 'Script test successful'" -ErrorAction SilentlyContinue

        if ($result -match "Script test successful") {
            Write-Success "Script functionality test passed"
            return $true
        }
        else {
            Write-Error "Script functionality test failed"
            return $false
        }
    }
    catch {
        Write-Error "Script test failed: $($_.Exception.Message)"
        return $false
    }
}

function Show-SetupSummary {
    Write-Host "`n=== Setup Summary ===" -ForegroundColor Yellow
    Write-Host "The MarketPilot AI website opener system has been successfully set up!" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "Available commands:" -ForegroundColor Cyan
    Write-Host "  - open-marketpilot    : Check services and open browser" -ForegroundColor Gray
    Write-Host "  - open-marketpilot -Force    : Force open browser (bypass checks)" -ForegroundColor Gray
    Write-Host "  - mp                : Alias for open-marketpilot" -ForegroundColor Gray
    Write-Host "" -ForegroundColor White
    Write-Host "Setup files location:" -ForegroundColor Cyan
    Write-Host "  - Scripts directory: %USERPROFILE%\Scripts" -ForegroundColor Gray
    Write-Host "  - Desktop shortcut: MarketPilot AI.lnk" -ForegroundColor Gray
    Write-Host "" -ForegroundColor White
    Write-Host "Troubleshooting:" -ForegroundColor Cyan
    Write-Host "  - For issues, visit: open-marketpilot-README.md" -ForegroundColor Gray
    Write-Host "  - Check: Get-Help open-marketpilot -Detailed" -ForegroundColor Gray
    Write-Host "" -ForegroundColor White
    Write-Host "===========================================`n" -ForegroundColor Yellow
}

function Main {
    Write-Host "=== MarketPilot AI Setup Script ===" -ForegroundColor Magenta
    Write-Host "Starting automated setup for MarketPilot AI website opener...`n" -ForegroundColor White

    $setupSuccess = $true

    # Step 1: Check PowerShell version
    Write-Host "Step 1: Checking PowerShell environment..." -ForegroundColor Yellow
    Test-PowerShellVersion

    # Step 2: Check Chrome installation
    Write-Host "`nStep 2: Checking Chrome installation..." -ForegroundColor Yellow
    if (-not (Test-ChromeInstallation)) {
        $setupSuccess = $false
        Write-Warning "Chrome installation check failed. Some features may not work correctly."
    }

    # Step 3: Create Scripts directory
    Write-Host "`nStep 3: Creating Scripts directory..." -ForegroundColor Yellow
    $scriptsPath = New-ScriptsDirectory
    if (-not $scriptsPath) {
        $setupSuccess = $false
        Write-Error "Failed to create Scripts directory. Aborting setup."
        return
    }

    # Step 4: Set execution policy
    Write-Host "`nStep 4: Setting PowerShell execution policy..." -ForegroundColor Yellow
    if (-not (Set-ExecutionPolicy)) {
        $setupSuccess = $false
        Write-Error "Failed to set execution policy. Some features may not work."
    }

    # Step 5: Copy script files
    Write-Host "`nStep 5: Copying PowerShell script files..." -ForegroundColor Yellow
    if (-not (Copy-ScriptFiles -DestinationPath $scriptsPath)) {
        $setupSuccess = $false
        Write-Error "Failed to copy script files. Aborting setup."
        return
    }

    # Step 6: Create desktop shortcut
    Write-Host "`nStep 6: Creating desktop shortcut..." -ForegroundColor Yellow
    if (-not (Create-DesktopShortcut)) {
        $setupSuccess = $false
        Write-Warning "Failed to create desktop shortcut. You can manually create one."
    }

    # Step 7: Test script functionality
    Write-Host "`nStep 7: Testing script functionality..." -ForegroundColor Yellow
    if (-not (Test-ScriptFunctionality -ScriptsPath $scriptsPath)) {
        $setupSuccess = $false
        Write-Error "Script functionality test failed. Please check the script manually."
    }

    # Final summary
    Write-Host "`n=== Setup Process Complete ===" -ForegroundColor Yellow
    if ($setupSuccess) {
        Write-Success "Setup completed successfully with all major components installed!"
        Show-SetupSummary
    }
    else {
        Write-Warning "Setup completed with some issues. Please review the errors above."
        Write-Host "`nBasic setup was completed, but some optional components failed.`n" -ForegroundColor Yellow
        Write-Host "You can manually install missing components from the Scripts directory:" -ForegroundColor Gray
        Write-Host "  - Check: open-marketpilot-README.md for detailed instructions" -ForegroundColor Gray
    }

    Write-Host "`nSetup script finished." -ForegroundColor Gray
}

# Run main function
Main
