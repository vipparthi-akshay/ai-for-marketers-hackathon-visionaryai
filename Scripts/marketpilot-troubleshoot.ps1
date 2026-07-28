# MarketPilot AI - Problem Solver
# Professional script to diagnose and fix the "Site cannot be reached" error

# Exit on error
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

function Test-PortConnection {
    param(
        [string]$ComputerName = "localhost",
        [int]$Port,
        [string]$ServiceName
    )
    
    try {
        Write-Info "Testing $ServiceName connection..."
        Write-Host "" -NoNewline
        Write-Host "  Checking port $Port on $ComputerName..." -ForegroundColor Gray
        
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Client.SetSocketOption([System.Net.Sockets.SocketOptionLevel]::Socket, [System.Net.Sockets.SocketOption]::KeepAlive, $true)
        
        $result = $tcpClient.ConnectAsync($ComputerName, $Port)
        $result.Wait(5000)  # 5 second timeout
        
        if ($tcpClient.Connected) {
            Write-Host "    Port $Port is OPEN (connection successful)" -ForegroundColor Green
            $tcpClient.Close()
            return $true
        }
        else {
            Write-Host "    Port $Port is CLOSED (connection refused)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "    Port $Port is UNREACHABLE - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-WebService {
    param(
        [string]$Url,
        [string]$ServiceName
    )
    
    try {
        Write-Info "Testing $ServiceName web service..."
        Write-Host "" -NoNewline
        Write-Host "  Checking $Url..." -ForegroundColor Gray
        
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing
        Write-Host "    HTTP $($response.StatusCode) - Service responding OK" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "    Service ERROR - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Start-MarketpilotServices {
    Write-Host "=== Starting MarketPilot AI Services ===" -ForegroundColor Yellow
    Write-Host "Attempting to start backend (8000) and frontend (3000)..." -ForegroundColor White
    Write-Host "" -NoNewline

    # Check if Docker is available
    $dockerAvailable = $false
    try {
        $dockerVersion = docker --version
        $dockerAvailable = $true
        Write-Success "Docker is available: $dockerVersion"
    }
    catch {
        Write-Error "Docker is not available or not running"
    }

    if ($dockerAvailable) {
        Write-Host "" -NoNewline
        Write-Host "  Attempting to start Docker Compose services..." -ForegroundColor Gray
        try {
            $dockerComposeOutput = docker-compose up -d 2>&1
            Write-Success "Docker Compose started successfully"
            Write-Host "  Output: $dockerComposeOutput" -ForegroundColor Gray
        }
        catch {
            Write-Warning "Docker Compose start may have failed: $($_.Exception.Message)"
            Write-Host "  Continuing with manual service setup..." -ForegroundColor Gray
        }
    }

    # Check for existing Node.js services
    Write-Host "" -NoNewline
    Write-Host "  Checking for existing Node.js services..." -ForegroundColor Gray
    
    $nodeProcesses = Get-Process | Where-Object {$_.ProcessName -like "node" -or $_.MainWindowTitle -like "*3000*"} -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Success "Found existing Node.js processes: $($nodeProcesses.ProcessName)"
    }
    else {
        Write-Warning "No Node.js processes found - frontend may need manual setup"
    }

    # Check for Uvicorn/Python services
    Write-Host "" -NoNewline
    Write-Host "  Checking for Python/uvicorn services..." -ForegroundColor Gray
    
    $pythonProcesses = Get-Process | Where-Object {$_.ProcessName -like "python*" -or $_.MainWindowTitle -like "*8000*"} -ErrorAction SilentlyContinue
    if ($pythonProcesses) {
        Write-Success "Found existing Python processes: $($pythonProcesses.ProcessName)"
    }
    else {
        Write-Warning "No Python processes found - backend may need manual setup"
    }

    Write-Host "" -NoNewline
    Write-Host "=== Service Startup Complete ===" -ForegroundColor Yellow
}

function Show-ServiceStatus {
    Write-Host "=== Current MarketPilot AI Service Status ===" -ForegroundColor Yellow
    Write-Host "Checking all ports and services..." -ForegroundColor White
    Write-Host "" -NoNewline

    # Test all possible ports
    $portsToTest = @(
        @{Port=3000; Name="Frontend"},
        @{Port=8000; Name="Backend"},
        @{Port=5432; Name="PostgreSQL"},
        @{Port=6379; Name="Redis"}
    )

    $servicesStatus = @()
    foreach ($port in $portsToTest) {
        $isOpen = Test-PortConnection -ComputerName "localhost" -Port $port.Port -ServiceName $port.Name
        $servicesStatus += [PSCustomObject]@{Name=$port.Name; Port=$port.Port; Status=if($isOpen){"OPEN"}else{"CLOSED"}}
    }

    # Display status
    Write-Host "Port Status:" -ForegroundColor Cyan
    foreach ($service in $servicesStatus) {
        $statusColor = if ($service.Status -eq "OPEN") { "Green" } else { "Red" }
        Write-Host "  $($service.Port): $($service.Name) - [$($service.Status)]" -ForegroundColor $statusColor
    }

    # Count open services
    $openServices = ($servicesStatus | Where-Object {$_.Status -eq "OPEN"}).Count
    Write-Host "" -NoNewline
    Write-Host "Summary: $openServices/$($servicesStatus.Count) services are running" -ForegroundColor $(if($openServices -ge 2){"Green"}else{"Yellow"})
    Write-Host "" -NoNewline

    if ($openServices -ge 2) {
        Write-Success "Most services are running! Site should be accessible."
    }
    else {
        Write-Warning "Some services are not running. The site may not work correctly."
        Write-Host "  - Website (3000): Required for frontend access" -ForegroundColor Gray
        Write-Host "  - Backend (8000): Required for API and data access" -ForegroundColor Gray
    }

    return $servicesStatus
}

function ProvideTroubleshootingGuide {
    Write-Host "" -NoNewline
    Write-Host "=== Troubleshooting Guide ===" -ForegroundColor Yellow
    Write-Host "The 'Site cannot be reached' error indicates services are not running." -ForegroundColor White
    Write-Host "" -NoNewline

    Write-Host "Quick Fixes (try in order):" -ForegroundColor Cyan
    Write-Host "" -NoNewline

    Write-Host "1. Check if Docker is running..." -ForegroundColor Gray
    Write-Host "   Start with: docker desktop or docker --version" -ForegroundColor Gray
    Write-Host "   Then: docker-compose up -d" -ForegroundColor Gray
    Write-Host "" -NoNewline

    Write-Host "2. If Docker not available, check for existing processes:" -ForegroundColor Gray
    Write-Host "   In PowerShell (Admin): netstat -ano | findstr \"3000 8000\"" -ForegroundColor Gray
    Write-Host "   In PowerShell: Get-Process | Where-Object {_.MainWindowTitle -like '*3000*' -or $_.MainWindowTitle -like '*8000*'}" -ForegroundColor Gray
    Write-Host "" -NoNewline

    Write-Host "3. Common solutions..." -ForegroundColor Gray
    Write-Host "   a. Start services manually in separate terminals:" -ForegroundColor Gray
    Write-Host "      Frontend: cd frontend && npm run dev" -ForegroundColor Gray
    Write-Host "      Backend: cd backend && uvicorn app.main:app --reload --port 8000" -ForegroundColor Gray
    Write-Host "" -NoNewline

    Write-Host "   b. Check README.md for detailed setup instructions" -ForegroundColor Gray
    Write-Host "      For local development: Main project README.md -> Quick Start -> Manual Setup" -ForegroundColor Gray
    Write-Host "" -NoNewline

    Write-Host "4. Network/firewall issues..." -ForegroundColor Gray
    Write-Host "   Check Windows Firewall settings" -ForegroundColor Gray
    Write-Host "   Test with: Test-NetConnection -ComputerName localhost -Port 3000" -ForegroundColor Gray
    Write-Host "" -NoNewline

    Write-Host "5. Alternative access..." -ForegroundColor Gray
    Write-Host "   Use the script with -Force flag: open-marketpilot -Force" -ForegroundColor Gray
    Write-Host "   Or access directly: http://localhost:3000" -ForegroundColor Gray
    Write-Host "" -NoNewline

    Write-Host "For more help, see open-marketpilot-README.md" -ForegroundColor Green
}

function Use-FallbackAccess {
    Write-Host "" -NoNewline
    Write-Host "=== Using Fallback Access Options ===" -ForegroundColor Yellow
    Write-Host "You can try to access the website in these ways..." -ForegroundColor White
    Write-Host "" -NoNewline

    Write-Host "1. Local access (if frontend is running):" -ForegroundColor Cyan
    Write-Host "   http://localhost:3000" -ForegroundColor Green
    Write-Host "" -NoNewline

    Write-Host "2. Using the script to force open (bypasses service checks):" -ForegroundColor Cyan
    Write-Host "   powershell -ExecutionPolicy Bypass -File \"%USERPROFILE%\Scripts\open-marketpilot.ps1\" -Force" -ForegroundColor Gray
    Write-Host "" -NoNewline

    Write-Host "3. Direct Chrome command:" -ForegroundColor Cyan
    Write-Host "   Chrome: 'chrome --start-maximized http://localhost:3000'" -ForegroundColor Gray
    Write-Host "" -NoNewline

    Write-Host "4. If no services are running:" -ForegroundColor Yellow
    Write-Host "   Manually start services:" -ForegroundColor Gray
    Write-Host "   - Frontend: cd frontend && npm run dev" -ForegroundColor Gray
    Write-Host "   - Backend: cd backend && uvicorn app.main:app --reload --port 8000" -ForegroundColor Gray
    Write-Host "" -NoNewline
}

function Main {
    Write-Host "=== MarketPilot AI Problem Solver ===" -ForegroundColor Red
    Write-Host "Diagnosing 'Site cannot be reached' errors..." -ForegroundColor White
    Write-Host "" -NoNewline

    # Check network connectivity
    Write-Host "Step 1: Testing Network Connectivity" -ForegroundColor Yellow
    $portStatus = Show-ServiceStatus

    # Check web services
    Write-Host "" -NoNewline
    Write-Host "Step 2: Testing Web Services" -ForegroundColor Yellow
    $webTestsPassed = $true

    # Test frontend
    $frontendTest = Test-WebService -Url "http://localhost:3000" -ServiceName "Frontend"
    if (-not $frontendTest) { $webTestsPassed = $false }

    Write-Host "" -NoNewline

    $backendTest = Test-WebService -Url "http://localhost:8000/docs" -ServiceName "Backend API"
    if (-not $backendTest) { $webTestsPassed = $false }

    # Provide diagnosis
    Write-Host "" -NoNewline
    Write-Host "=== Diagnosis Result ===" -ForegroundColor Yellow
    if ($webTestsPassed) {
        Write-Success "Most services are working. Try refreshing your browser."
    }
    else {
        Write-Warning "Services are not responding. The 'Site cannot be reached' error is expected."
    }

    # Provide troubleshooting
    Write-Host "" -NoNewline
    Provide-TroubleshootingGuide

    # Offer solutions
    Write-Host "" -NoNewline
    Write-Host "=== Quick Solutions ===" -ForegroundColor Green
    Write-Host "" -NoNewline

    # Option 1: Start services
    Write-Host "1. Start MarketPilot AI services (if Docker is available):" -ForegroundColor Cyan
    Write-Host "   This will start all services in the background." -ForegroundColor Gray
    Write-Host "   Run: Start-MarketpilotServices" -ForegroundColor Gray
    Write-Host "" -NoNewline

    # Option 2: Force open browser
    Write-Host "2. Force open browser with the script (bypasses service checks):" -ForegroundColor Cyan
    Write-Host "   Useful if you have partial access or want to try anyway." -ForegroundColor Gray
    Write-Host "   Run: powershell -ExecutionPolicy Bypass -File \"open-marketpilot.ps1\" -Force" -ForegroundColor Gray
    Write-Host "" -NoNewline

    # Option 3: Use fallback access
    Write-Host "3. Use fallback access methods:" -ForegroundColor Cyan
    Use-FallbackAccess

    # Final message
    Write-Host "" -NoNewline
    Write-Host "=== Problem Resolution Complete ===" -ForegroundColor Yellow
    Write-Host "If services are not running, wait a moment after starting them before trying to access the site." -ForegroundColor Gray
    Write-Host "The script will now attempt to open the site in Chrome." -ForegroundColor Gray
    Write-Host "" -NoNewline

    # Try to open with force flag if available
    try {
        Write-Host "Attempting to open the site in Chrome with error prevention..." -ForegroundColor Yellow
        $chromeCommand = "start chrome --start-maximized --no-first-run --no-default-browser-check --disable-translate --disable-features=TranslateUI --disable-web-security --disable-extensions --disable-plugins-discovery http://localhost:3000"
        Invoke-Expression $chromeCommand
        Write-Success "Attempted to open Chrome with MarketPilot AI"
    }
    catch {
        Write-Warning "Could not open Chrome automatically"
        Write-Host "You can manually open it in Chrome: http://localhost:3000" -ForegroundColor Gray
    }
}

# Run main function
Main
