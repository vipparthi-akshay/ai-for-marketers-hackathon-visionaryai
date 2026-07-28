# MarketPilot AI - Professional Setup Instructions
# Comprehensive guide for setting up the MarketPilot AI website opener system

## Overview

This document provides complete, professional instructions for setting up the MarketPilot AI website opener system. The system ensures that the MarketPilot AI website loads correctly in Google Chrome with optimized error-prevention settings every time you need to refresh or access the site.

The setup includes a PowerShell script that:
- Checks backend and frontend service availability
- Opens Google Chrome with security-hardened arguments
- Provides detailed status feedback
- Supports multiple deployment methods

## Quick Start

### Method 1: Quick Setup Script (Recommended)

The easiest way to set up the entire system is using the provided setup script:

1. **Download the setup script**
   Save this script as `setup-marketpilot.ps1` in your preferred location (e.g., Desktop)

2. **Run the setup script**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
   .
setup-marketpilot.ps1
   ```

3. **Follow the prompts**
   The script will guide you through:
   - Environment checks
   - Directory creation
   - File installation
   - Desktop shortcut creation
   - Basic testing

### Method 2: Manual Setup

Follow the detailed steps below for manual installation:

## Pre-Setup Requirements

### 1. Check System Requirements

- **Operating System**: Windows 10 or later (64-bit recommended)
- **PowerShell Version**: Windows PowerShell 5.1 or PowerShell 7+
- **Google Chrome**: Latest version installed and accessible
- **Administrator Access**: Optional, for system-wide installations

### 2. Verify Environment

Run these commands in PowerShell to verify your environment:

```powershell
# Check PowerShell version
$PSVersionTable.PSVersion

# Check Chrome installation
Test-Path "${env:ProgramFiles(x86)}\\Google\\Chrome\\Application\\chrome.exe"

# Check current execution policy
Get-ExecutionPolicy -Scope CurrentUser
```

## Directory Structure

After setup, your directory structure will look like this:

```
%USERPROFILE%\
└── Scripts\
    ├── open-marketpilot.ps1              # Main PowerShell script
    ├── open-marketpilot.bat               # Batch configuration file
    ├── open-marketpilot-README.md         # Setup documentation
    └── marketpilot-config.ps1              # Configuration management (advanced)
```

## Setup Step-by-Step Guide

### Step 1: Create Scripts Directory

**Method A: Using PowerShell**
```powershell
# Create the Scripts directory
mkdir "%USERPROFILE%\Scripts" -Force

# Navigate to the directory
cd "%USERPROFILE%\Scripts"
```

**Method B: Using File Explorer**
1. Open File Explorer
2. Navigate to: `%USERPROFILE%\Documents`
3. Right-click → New → Folder
4. Name it: `Scripts`
5. Right-click → Properties
6. Go to “Security” tab → Edit
7. Ensure your user account has “Modify” and “Read & Execute" permissions

### Step 2: Download and Save the Main Script

Save the **`open-marketpilot.ps1`** script to your Scripts directory using one of these methods:

#### Method A: Manual Copy

1. Open the script file in a text editor
2. Copy the entire content
3. Save it as `open-marketpilot.ps1` in your Scripts directory

#### Method B: Using PowerShell

```powershell
# Navigate to Scripts directory
cd "%USERPROFILE%\Scripts"

# Download directly (if internet access available)
Invoke-WebRequest -Uri "https://your-repo-url/open-marketpilot.ps1" -OutFile "open-marketpilot.ps1"

# Or copy from current location
copy "path\to\open-marketpilot.ps1" "%USERPROFILE%\Scripts\" -Force
```

### Step 3: Set PowerShell Execution Policy

Important: PowerShell scripts require proper execution policy for security:

```powershell
# Set policy to Bypass (allows all scripts)
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser

# Verify the policy is set correctly
Get-ExecutionPolicy -Scope CurrentUser
```

**Alternative policies (choose based on your security needs):**
- `RemoteSigned`: Scripts from internet require signature (default)
- `Bypass`: All scripts can run (convenient for development)
- `Unrestricted`: Maximum flexibility (highest risk)

### Step 4: Create Desktop Shortcut (Recommended)

Creating a desktop shortcut makes quick access easy:

#### Method A: Using PowerShell

```powershell
# Use the Setup Script (Method 1)
# The setup script automatically creates a desktop shortcut

# Or create manually
Add-Type -AssemblyName "System.Windows.Forms"
$shortcutPath = "$env:USERPROFILE\Desktop\MarketPilot AI.lnk"

$shell = New-Object -ComObject "WScript.Shell"
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-ExecutionPolicy Bypass -File \"%USERPROFILE%\Scripts\open-marketpilot.ps1\""
$shortcut.WorkingDirectory = "%USERPROFILE%\Scripts"
$shortcut.Description = "Open MarketPilot AI website with error prevention"
$shortcut.Save()

Write-Host "Desktop shortcut created successfully!"
```

#### Method B: Using Graphical Interface

1. Right-click on Desktop
2. Select: New → Shortcut
3. In the "Create Shortcut" window:
   - **For Windows PowerShell**: `powershell -ExecutionPolicy Bypass -File "%USERPROFILE%\Scripts\open-marketpilot.ps1"`
   - **For PowerShell 6+**: `pwsh -ExecutionPolicy Bypass -File "%USERPROFILE%\Scripts\open-marketpilot.ps1"`
4. Name the shortcut: "MarketPilot AI"
5. Optional: Right-click shortcut → Properties → Advanced → Run as administrator

### Step 5: Test the Script

Before using in production, verify the script works:

#### Basic Test

```powershell
# Navigate to Scripts directory
cd "%USERPROFILE%\Scripts"

# Test script syntax (no output expected if successful)
powershell -ExecutionPolicy Bypass -File "open-marketpilot.ps1" -Command "Write-Host 'Script syntax OK'"
```

#### Service Check Test (requires running services)

```powershell
# Check if services are available (this will fail if services aren't running)
powershell -ExecutionPolicy Bypass -File "open-marketpilot.ps1" -Command "
Write-Host 'Testing service connectivity...'

# The script will attempt to connect to:
# - Backend: http://localhost:8000/docs
# - Frontend: http://localhost:3000

Write-Host 'If you see connectivity messages, the script is working correctly.'
"
```

### Step 6: Configure Additional Settings (Optional)

Advanced users can customize the script's behavior by modifying configuration files:

#### Modify Service URLs

Change the endpoints if your services run on different ports:

```powershell
# Navigate to Scripts directory
cd "%USERPROFILE%\Scripts"

# Edit the script with your custom URLs
notepad "open-marketpilot.ps1"

# Replace these lines in the script:
#   param(
#       [switch]\$Force,
#       [string]\$BackendUrl = \"http://localhost:8000/docs\",
#       [string]\$FrontendUrl = \"http://localhost:3000\"
#   )

# With your custom URLs:
#   param(
#       [switch]\$Force,
#       [string]\$BackendUrl = \"http://localhost:8080/api/docs\",
#       [string]\$FrontendUrl = \"http://localhost:3001\"
#   )
```

#### Advanced Configuration

For advanced configuration options, use the configuration script:

```powershell
# Navigate to Scripts directory
cd "%USERPROFILE%\Scripts"

# Run configuration script
powershell -ExecutionPolicy Bypass -File "marketpilot-config.ps1"

# Available commands:
# - Set-MarketpilotConfig : Update configuration
# - Show-CurrentConfig   : Display current settings
# - Reset-MarketpilotConfig : Reset to defaults
# - Test-MarketpilotConnections : Test service connectivity
```

## Usage Guide

### Basic Commands

Once set up, you can use the script in several ways:

#### Using PowerShell

```powershell
# Navigate to Scripts directory
cd "%USERPROFILE%\Scripts"

# Check services and open browser (if available)
Open-MarketpilotWebsite

# Force open browser (bypass service checks)
Open-MarketpilotWebsite -Force

# Custom URLs
Open-MarketpilotWebsite -BackendUrl "http://localhost:8080/docs" -FrontendUrl "http://localhost:3001"
```

#### Using Desktop Shortcut

1. Click the "MarketPilot AI" desktop shortcut
2. If prompted by UAC, click "Yes"
3. The script will run with default settings

### Automation Setup

For automated website refreshes, set up a Scheduled Task:

#### Using Task Scheduler (Graphical Interface)

1. Press: `Win + R` → Type: `taskschd.msc` → Press Enter
2. In the Task Scheduler window:
   - Click: "Action" → "Create Basic Task..."
3. **Create Basic Task Wizard**:
   - **Name**: "MarketPilot AI Auto-Refresh"
   - **Description**: "Automatically refreshes MarketPilot AI website every 5 minutes"

4. **Trigger Setup**:
   - Select: "On a schedule"
   - **Settings**:
     - Start: "Now"
     - Begin the task: "On a schedule"
     - Daily
     - Repeats every: "5 minutes"

5. **Action Setup**:
   - Select: "Start a program"
   - **Program/script**: `powershell.exe`
   - **Add arguments (optional)**: `-ExecutionPolicy Bypass -File "%USERPROFILE%\Scripts\open-marketpilot.ps1" -Force`
   - **Start in**: `%USERPROFILE%\Scripts`
   - **Configure for**: Your Windows version (e.g., Windows 10)

6. **Completion**:
   - Check: "Open the Properties dialog for this task when I click Finish"
   - Click: "Finish"

#### Using PowerShell (Command Line)

```powershell
# Create Scheduled Task using PowerShell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File '%USERPROFILE%\Scripts\open-marketpilot.ps1' -Force" -WorkingDirectory "%USERPROFILE%\Scripts"
$trigger = New-ScheduledTaskTrigger -Daily -At 9am -Repetition.Interval "PT5M" -Repetition.Duration "P1D"
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -AllowStartIfOnBatteries

Register-ScheduledTask -TaskName "MarketPilot AI Auto-Refresh" -Action $action -Trigger $trigger -Settings $settings -RunLevel "Highest"
```

### Advanced Usage

#### Custom Shortcuts with Arguments

Create multiple shortcuts for different use cases:

**Shortcut 1: Standard Check**
```powershell
# Arguments: -ExecutionPolicy Bypass -File "%USERPROFILE%\Scripts\open-marketpilot.ps1"
```

**Shortcut 2: Force Open**
```powershell
# Arguments: -ExecutionPolicy Bypass -File "%USERPROFILE%\Scripts\open-marketpilot.ps1" -Force
```

**Shortcut 3: Custom URLs**
```powershell
# Arguments: -ExecutionPolicy Bypass -File "%USERPROFILE%\Scripts\open-marketpilot.ps1" -BackendUrl "http://localhost:8080/docs" -FrontendUrl "http://localhost:3001"
```

#### PowerShell Profile Integration

Add the script to your PowerShell profile for global availability:

```powershell
# Edit PowerShell profile
notepad "%USERPROFILE%\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"

# Add the following lines:
if (Test-Path "%USERPROFILE%\Scripts\open-marketpilot.ps1") {
    . "%USERPROFILE%\Scripts\open-marketpilot.ps1"
}

# Create convenient aliases
New-Alias -Name "mp" -Value "Open-MarketpilotWebsite" -Scope Global
New-Alias -Name "marketpilot" -Value "Open-MarketpilotWebsite" -Scope Global
```

After updating the profile, reload it:
```powershell
. "%USERPROFILE%\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"
```

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Windows PowerShell does not recognize the alias ..." 

**Cause**: Script not added to PowerShell profile
**Solution**:
1. Verify script is in Scripts directory
2. Check profile path: `%USERPROFILE%\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`
3. Add script to profile if not already present
4. Reload profile: `.` followed by profile path

#### Issue 2: Script execution fails with "The system cannot find the file specified"

**Cause**: Incorrect working directory or PowerShell execution policy
**Solution**:
1. Ensure Scripts directory exists
2. Set proper execution policy: `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser`
3. Check desktop shortcut arguments:
   - Target should be: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "%USERPROFILE%\Scripts\open-marketpilot.ps1"`

#### Issue 3: Chrome doesn't open or opens with errors

**Cause**: Chrome arguments or permissions
**Solution**:
1. Verify Chrome is installed in standard location
2. Try running script manually from PowerShell
3. Check Chrome options: `chrome://settings/` → "Advanced" → "System" → "Open Chrome’s hardware acceleration settings"
4. Disable browser extensions temporarily
5. Clear Chrome cache: `chrome://settings/clearBrowserData`

#### Issue 4: Service connectivity checks fail

**Cause**: Backend or frontend services not running
**Solution**:
1. Check if services are running:
   ```powershell
   # Backend (API)
   Test-NetConnection -ComputerName localhost -Port 8000
   
   # Frontend
   Test-NetConnection -ComputerName localhost -Port 3000
   ```

2. For production environments:
   - Verify service URLs in script
   - Check network connectivity
   - Ensure firewall allows connections

#### Issue 5: Multiple Chrome instances open

**Cause**: Script called multiple times
**Solution**:
1. Check for duplicate scheduled tasks or shortcuts
2. Modify script to kill existing Chrome instances before opening new ones
3. Use script with `-Force` flag to open new instances with different profiles

### Diagnostic Commands

#### Quick Service Status
```powershell
# Check all MarketPilot-related services
Get-Process | Where-Object {$_.ProcessName -like "*chrome*" -or $_.MainWindowTitle -like "*3000*" -or $_.MainWindowTitle -like "*8000*"}

# Network connectivity tests
Test-NetConnection -ComputerName localhost -Port 3000
Test-NetConnection -ComputerName localhost -Port 8000
```

#### Script Information
```powershell
# Get help about script parameters
Get-Help open-marketpilot.ps1 -Detailed

# View script metadata
powershell -ExecutionPolicy Bypass -File "%USERPROFILE%\Scripts\open-marketpilot.ps1" -Command "$PSCmdlet.Help"
```

## Maintenance

### Regular Tasks

#### Monthly Cleanup
1. **Clear Chrome cache**
   ```powershell
   # Clear history, cookies, cache for MarketPilot AI
   # Using Chrome's internal command-line options
   ```

2. **Review Scheduled Tasks**
   - Check Task Scheduler for stale "MarketPilot AI" tasks
   - Remove old or unnecessary tasks

3. **Update Script**
   - Check for updates to the main script
   - Back up current settings before updating

#### Quarterly Updates
1. **Test Automation**
   - Verify scheduled tasks are running
   - Test service connectivity

2. **Update Security**
   - Update Chrome to latest version
   - Review and update execution policy if needed

3. **Performance Optimization**
   - Check system resources
   - Review script performance if slow

### Backup and Recovery

#### Creating Backups
```powershell
# Create backup of scripts directory
$backupPath = "%USERPROFILE%\Backups\marketpilot-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -Path "%USERPROFILE%\Scripts\*" -Destination $backupPath -Recurse -Force

Write-Host "Backup created at: $backupPath" -ForegroundColor Green
```

#### Restoring from Backup
```powershell
# Identify your backup path
$backupPath = "%USERPROFILE%\Backups\marketpilot-backup-20240315-143022"

# Restore scripts
Copy-Item -Path "$backupPath\*" -Destination "%USERPROFILE%\Scripts\" -Recurse -Force

Write-Host "Scripts restored from backup" -ForegroundColor Green
```

## Common Error Messages and Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "The file or assembly could not be loaded" | Script syntax error or missing dependencies | Check script syntax and fix errors |
| "Access to the path 'X' is denied" | Permission issues | Run as administrator or adjust permissions |
| "The system cannot find the file specified" | Incorrect file paths | Verify script location and paths |
| "Windows cannot access the specified file" | File in use | Close other instances or restart |
| "The request was aborted: Could not connect to proxy server" | Network/proxy issues | Check network connectivity | |

## Final Verification

After setup, perform these final checks:

### 1. Desktop Shortcut Test
1. Double-click the "MarketPilot AI" desktop shortcut
2. Verify Chrome opens with expected arguments
3. Check that MarketPilot AI loads correctly

### 2. PowerShell Command Test
```powershell
# Run from command prompt
powershell -ExecutionPolicy Bypass -File "%USERPROFILE%\Scripts\open-marketpilot.ps1" -Command "Write-Host 'Test successful'"
```

### 3. Service Availability Test
1. Navigate to Scripts directory
2. Run: `Test-MarketpilotConnections` (from configuration script)
3. Verify services respond correctly

### 4. Automation Test
1. Wait for scheduled task to run (if configured)
2. Check Task Scheduler logs
3. Verify Chrome opens as expected

## Support

For issues beyond these documentation sections:

### Online Resources
- Visit the MarketPilot AI documentation website
- Check the MarketPilot AI GitHub repository for script updates
- Review MarketPilot AI community forums

### Contact Information
- For technical support: Contact MarketPilot AI support team
- For feature requests: Submit through MarketPilot AI feature request system
- For bug reports: Submit through MarketPilot AI issue tracker

### Emergency Procedures

If the script completely fails:

1. **Emergency Recovery**
   ```powershell
   # Emergency script restoration
   if (-not (Test-Path "%USERPROFILE%\Scripts\open-marketpilot.ps1")) {
       Write-Host "Emergency: Restoring script from backup..." -ForegroundColor Red
       # Restore from backup or re-download
   }
   ```

2. **Alternative Access**
   - Access MarketPilot AI directly at `http://localhost:3000`
   - Use backup website URLs if available

## Version Information

- **Script Version**: 1.0.0
- **Setup Script Version**: 2.0.0
- **Documentation Version**: 2.0.0
- **Last Updated**: July 28, 2026
- **Compatibility**: Windows 10+, PowerShell 5.1+, PowerShell 7+

---

## Legal and Security Notes

### Security Considerations

- **Execution Policy**: Setting execution policy to Bypass reduces security but increases convenience
- **Script Content**: This script is provided as-is for MarketPilot AI users
- **Browser Arguments**: Chrome arguments modify browser behavior for error prevention
- **Local Access**: Script assumes local access to services on localhost

### Usage Guidelines

- Use this script in trusted environments only
- Do not distribute to untrusted users
- Consider security implications before automating browser access
- Keep scripts and configuration files secure

### License

This setup documentation and script are provided as-is for MarketPilot AI users. While care has been taken to ensure the script works correctly, always test in a development environment before deploying to production.

---

**Document Version**: 2.0.0 - Professional Edition
**Last Updated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Compatible Systems**: Windows 10/11, PowerShell 5.1+
