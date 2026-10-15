@echo off
title NG DineAI Runner
echo ===================================================
echo Starting NG DineAI (Backend + Frontend)
echo ===================================================

cd /d "%~dp0"

echo [1/2] Launching Backend on http://localhost:8000 ...
start "NG DineAI Backend" cmd /k ".\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Frontend on http://localhost:5173 ...
cd frontend
start "NG DineAI Frontend" cmd /k "npm run dev"

echo.
echo ===================================================
echo Done! Both servers are now running.
echo Open your browser at: http://localhost:5173
echo ===================================================
timeout /t 5
