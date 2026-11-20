@echo off
title Hunar Setu - Verified skills. Trusted jobs.
echo ======================================================================
echo   Hunar Setu - Agentic AI Rural Employment Platform
echo   Team The Bridge Coders - Jadavpur University
echo ======================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python was not found in PATH!
    echo Checking local embedded python...
    if exist "..\python311\python.exe" (
        set PYTHON_CMD=..\python311\python.exe
    ) else (
        echo Please install Python 3.10+ from https://www.python.org/
        pause
        exit /b 1
    )
) else (
    set PYTHON_CMD=python
)

echo Using Python: %PYTHON_CMD%
echo Installing dependencies from requirements.txt...
%PYTHON_CMD% -m pip install -r requirements.txt --quiet

echo.
echo Starting Hunar Setu Web Server on http://127.0.0.1:8000 ...
%PYTHON_CMD% run.py
pause
