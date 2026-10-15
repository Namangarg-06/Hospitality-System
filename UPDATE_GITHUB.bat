@echo off
title NG DineAI — Update GitHub
color 0D

cd /d "%~dp0"
echo ========================================================
echo   Updating GitHub (Namangarg-06/Hospitality-System)...
echo ========================================================
echo.
set /p commit_msg="Commit message (Enter for 'update'): "
if "%commit_msg%"=="" set commit_msg=update

git add .
git commit -m "%commit_msg%"
git push origin main

echo.
echo Code pushed to GitHub successfully!
pause
