@echo off
chcp 65001 >nul
echo.
echo ============================================
echo   MarketPilot AI - Hackathon Launch
echo ============================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is running.

REM Start services
echo [INFO] Starting services with docker-compose...
docker-compose up -d

REM Wait for services
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Open browser
echo [INFO] Opening MarketPilot AI in browser...
start http://localhost:3000

echo.
echo ============================================
echo   MarketPilot AI is now running!
echo ============================================
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000/docs
echo   Health:   http://localhost:8000/health
echo.
echo   Close this window to stop all services.
echo.
pause
