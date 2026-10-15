@echo off
title NG DineAI — Luxury Hospitality SaaS
color 0A

cd /d "%~dp0"

echo ========================================================
echo        Starting NG DineAI (Unified Single-Port Mode)
echo ========================================================
echo.

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
