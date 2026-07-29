#!/usr/bin/env bash
set -e

echo ""
echo "============================================"
echo "  MarketPilot AI - Hackathon Launch"
echo "============================================"
echo ""

# Step 1: Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed. Please install Docker Desktop first."
    echo "  Mac: https://www.docker.com/products/docker-desktop/"
    echo "  Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

echo "[OK] Docker is available: $(docker --version)"

# Step 2: Check if Docker is running
if ! docker info &> /dev/null; then
    echo "[WARN] Docker is not running. Starting Docker Desktop..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open -a Docker
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start docker
    fi
    echo "[INFO] Waiting for Docker to initialize (15 seconds)..."
    sleep 15
fi

echo "[OK] Docker is running."

# Step 3: Start services with docker-compose
echo "[INFO] Starting services with docker-compose..."
docker-compose up -d

# Step 4: Wait for services to be ready
echo "[INFO] Waiting for services to be ready..."
MAX_WAIT=60
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1 && curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "[OK] Both frontend (3000) and backend (8000) are up!"
        break
    fi
    if [ $((WAITED % 10)) -eq 0 ] && [ $WAITED -gt 0 ]; then
        echo "[INFO] Still waiting... ($WAITED seconds elapsed)"
    fi
    sleep 2
    WAITED=$((WAITED + 2))
done

# Step 5: Check if services are ready
FRONTEND_OK=$(curl -s http://localhost:3000 > /dev/null 2>&1 && echo "true" || echo "false")
BACKEND_OK=$(curl -s http://localhost:8000/health > /dev/null 2>&1 && echo "true" || echo "false")

if [ "$FRONTEND_OK" = "false" ] && [ "$BACKEND_OK" = "false" ]; then
    echo "[ERROR] Neither frontend (3000) nor backend (8000) is responding."
    echo "[INFO] Check docker-compose logs: docker-compose logs"
    exit 1
fi

if [ "$FRONTEND_OK" = "false" ]; then
    echo "[WARN] Frontend (port 3000) is not responding yet."
    echo "[INFO] Backend (port 8000) is available - API docs at http://localhost:8000/docs"
fi

if [ "$BACKEND_OK" = "false" ]; then
    echo "[WARN] Backend (port 8000) is not responding yet."
    echo "[INFO] Frontend (port 3000) may be available."
fi

# Step 6: Open browser
echo ""
echo "[INFO] Opening MarketPilot AI in browser..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi

echo ""
echo "============================================"
echo "  MarketPilot AI is now running!"
echo "============================================"
echo ""
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000/docs"
echo "  Health:   http://localhost:8000/health"
echo ""
echo "  Press Ctrl+C to stop all services."
echo ""

# Keep script running so user can see status
read -p "Press Enter to stop all services..."
