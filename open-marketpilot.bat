@echo off
SETLOCAL

echo ===============================================
echo MarketPilot AI - Hackathon Launcher
echo ===============================================
echo.

echo This script will:
echo  1. Start Docker Desktop Service (if stopped)
echo  2. Start all services (backend + frontend)
echo  3. Open ONLY Chrome with the running website
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0run-hackathon.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Launch script exited with an error.
    echo If Docker Desktop is not installed, please install it first.
    echo Then run: docker-compose up -d
    echo Then open Chrome to http://localhost:3000
)

pause