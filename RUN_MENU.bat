@echo off
title NG DineAI — Control Center
:menu
cls
color 0B
echo ========================================================
echo             NG DINEAI — CONTROL CENTER
echo        Smarter Dining. Smarter Operations.
echo ========================================================
echo.
echo   [1] RUN APPLICATION (Start Backend, Frontend & Open Browser)
echo   [2] STOP APPLICATION (Close all running servers)
echo   [3] RUN AUTOMATED TESTS (Verify pytest test suite)
echo   [4] UPDATE GITHUB (Commit and push changes to repo)
echo   [5] OPEN DIGITAL QR MENU IN BROWSER
echo   [6] EXIT
echo.
echo ========================================================
set /p choice="Apna option select karein [1, 2, 3, 4, 5, 6]: "

if "%choice%"=="1" goto run_app
if "%choice%"=="2" goto stop_app
if "%choice%"=="3" goto run_tests
if "%choice%"=="4" goto update_git
if "%choice%"=="5" goto open_qr
if "%choice%"=="6" goto exit_menu
echo Invalid choice. Kripya 1 se 6 ke beech number chunein.
timeout /t 2 >nul
goto menu

:run_app
cls
color 0A
echo ========================================================
echo   Starting NG DineAI Platform...
echo ========================================================
echo.
echo 1. Starting Backend API on http://localhost:8000...
if exist "%~dp0venv\Scripts\python.exe" (
    start "DineAI Backend API" cmd /k "cd /d %~dp0 && .\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --port 8000 --reload"
) else (
    start "DineAI Backend API" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --port 8000 --reload"
)

echo 2. Starting Frontend UI on http://localhost:5173...
start "DineAI Frontend UI" cmd /k "cd /d %~dp0frontend && npm run dev"

echo 3. Waiting 3 seconds for boot...
timeout /t 3 /nobreak >nul

echo 4. Opening Browser to http://localhost:5173...
start http://localhost:5173

echo.
echo ========================================================
echo   App chal rahi hai!
echo   Demo Login: owner@dineai.com / DineAI@2026
echo   QR Menu:    http://localhost:5173/m/the-royal-saffron
echo ========================================================
pause
goto menu

:stop_app
cls
color 0C
echo ========================================================
echo   Stopping NG DineAI Servers...
echo ========================================================
taskkill /f /im python.exe /fi "WINDOWTITLE eq DineAI Backend API*" 2>nul
taskkill /f /im node.exe /fi "WINDOWTITLE eq DineAI Frontend UI*" 2>nul
taskkill /f /im uvicorn.exe 2>nul
echo All servers stopped!
pause
goto menu

:run_tests
cls
color 0E
echo ========================================================
echo   Running Automated Test Suite (Pytest)...
echo ========================================================
cd /d "%~dp0backend"
if exist "%~dp0venv\Scripts\pytest.exe" (
    "%~dp0venv\Scripts\pytest.exe" -v
) else (
    python -m pytest -v
)
cd /d "%~dp0"
echo.
pause
goto menu

:update_git
cls
color 0D
echo ========================================================
echo   Updating GitHub & Triggering Live Deploy...
echo ========================================================
set /p commit_msg="Commit message (Enter for 'update'): "
if "%commit_msg%"=="" set commit_msg=update
git add .
git commit -m "%commit_msg%"
git push origin main
echo.
echo Done! Code pushed to GitHub (Namangarg-06/Hospitality-System).
pause
goto menu

:open_qr
start http://localhost:5173/m/the-royal-saffron
goto menu

:exit_menu
exit
