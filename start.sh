#!/usr/bin/env bash
echo "======================================================================"
echo "  Hunar Setu - Agentic AI Rural Employment Platform"
echo "  Team The Bridge Coders - Jadavpur University"
echo "======================================================================"
echo ""

# Find Python
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "Error: Python 3 is not installed. Please install Python 3.10+."
    exit 1
fi

echo "Using Python: $($PYTHON_CMD --version)"
echo "Installing dependencies..."
$PYTHON_CMD -m pip install -r requirements.txt --quiet

echo "Starting Hunar Setu Web Server on http://127.0.0.1:8000 ..."
$PYTHON_CMD run.py
