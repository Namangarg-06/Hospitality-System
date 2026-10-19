@echo off
title NG DineAI — Luxury Hospitality SaaS
color 0A

cd /d "%~dp0"

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
