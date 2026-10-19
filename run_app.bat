@echo off
title NG DineAI — Single-Click Launcher
color 0A

cd /d "%~dp0"

echo ========================================================
echo        Starting NG DineAI (run_app.py)...
echo ========================================================
echo.

if exist "%~dp0venv\Scripts\python.exe" (
    "%~dp0venv\Scripts\python.exe" run_app.py
) else (
    python run_app.py
)

if errorlevel 1 (
    echo.
    echo [Error] Failed to start. Press any key to exit.
    pause
)
