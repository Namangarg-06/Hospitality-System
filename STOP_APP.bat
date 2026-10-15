@echo off
title Stop NG DineAI
color 0C

echo ========================================================
echo         Stopping NG DineAI Servers...
echo ========================================================
echo.

taskkill /f /im python.exe /fi "WINDOWTITLE eq DineAI Backend API*" 2>nul
taskkill /f /im node.exe /fi "WINDOWTITLE eq DineAI Frontend UI*" 2>nul
taskkill /f /im uvicorn.exe 2>nul

echo All backend and frontend processes stopped successfully.
echo.
pause
