@echo off
title Stop NG DineAI
color 0C

echo ========================================================
echo         Stopping NG DineAI Servers...
echo ========================================================
echo.

for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
taskkill /f /im uvicorn.exe >nul 2>&1

echo All NG DineAI processes on port 8000 stopped successfully.
echo.
pause
