#!/bin/bash

# Startup script for JewelWise with date filtering

echo "=================================="
echo "JewelWise Startup Script"
echo "=================================="
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.9+"
    exit 1
fi

PYTHON_CMD=$(command -v python3 || command -v python)

# Check if required Python packages are installed
echo "Checking Python dependencies..."
$PYTHON_CMD -c "import fastapi, pandas" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Missing Python dependencies"
    echo "Installing required packages..."
    pip install fastapi pandas uvicorn
fi

# Check if Node.js is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js"
    exit 1
fi

echo ""
echo "✅ All dependencies found"
echo ""
echo "=================================="
echo "Starting Backend Server"
echo "=================================="
echo ""

# Start backend in background
$PYTHON_CMD main.py &
BACKEND_PID=$!

echo "Backend started with PID: $BACKEND_PID"
echo "Waiting for backend to initialize..."
sleep 3

# Check if backend is running
curl -s http://localhost:8000/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backend is running on http://localhost:8000"
else
    echo "⚠️  Backend may still be starting..."
fi

echo ""
echo "=================================="
echo "Testing Date Filtering"
echo "=================================="
echo ""

$PYTHON_CMD test_date_filter.py

echo ""
echo "=================================="
echo "Starting Frontend"
echo "=================================="
echo ""
echo "Frontend will start on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start frontend (this will block)
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
