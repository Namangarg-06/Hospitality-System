@echo off
title NG DineAI
color 0A

echo ========================================================
echo              Starting NG DineAI Platform...
echo ========================================================
echo.

cd /d "%~dp0"

echo 1. Starting FastAPI Backend on http://localhost:8000...
if exist ".\venv\Scripts\python.exe" (
    start "DineAI Backend API" /min cmd /c ".\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --port 8000 --reload"
) else (
    start "DineAI Backend API" /min cmd /c "cd /d %~dp0backend && python -m uvicorn app.main:app --port 8000 --reload"
)

echo 2. Starting React Frontend on http://localhost:5173...
start "DineAI Frontend UI" /min cmd /c "cd /d %~dp0frontend && npm run dev"

echo 3. Waiting 3 seconds for boot...
timeout /t 3 >nul

echo 4. Opening Browser to http://localhost:5173...
start http://localhost:5173

echo.
echo ========================================================
echo   App chal gayi hai! Browser check karein.
echo   Demo Login: owner@dineai.com / DineAI@2026
echo   QR Menu:    http://localhost:5173/m/the-royal-saffron
echo ========================================================
exit
