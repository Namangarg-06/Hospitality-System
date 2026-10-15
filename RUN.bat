@echo off
title NG DineAI — Luxury Hospitality SaaS
color 0A

cd /d "%~dp0"

echo ========================================================
echo        Starting NG DineAI (Unified Single-Port Mode)
echo ========================================================
echo.

:: Clear any stale process on port 8000 (e.g., Vyapar or old server)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

if exist ".\venv\Scripts\python.exe" (
    ".\venv\Scripts\python.exe" run_app.py
) else (
    python run_app.py
    if errorlevel 1 (
        "C:\Users\Hp\AppData\Local\Programs\Python\Python313\python.exe" run_app.py
    )
)

if errorlevel 1 (
    echo.
    echo [Error] Failed to start. Press any key to exit.
    pause
)
