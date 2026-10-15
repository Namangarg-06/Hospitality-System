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
echo   [1] RUN UNIFIED APP (Single Python Server on http://127.0.0.1:8000 via run_app.py)
echo   [2] RUN DEV SERVERS (FastAPI on 8000 + Vite on 5173 with Hot Reload)
echo   [3] STOP APPLICATION (Close all running servers)
echo   [4] RUN AUTOMATED TESTS (Verify pytest test suite)
echo   [5] OPEN DIGITAL QR MENU IN BROWSER
echo   [6] UPDATE GITHUB (Commit and push changes to repo)
echo   [7] EXIT
echo.
echo ========================================================
set /p choice="Apna option select karein [1, 2, 3, 4, 5, 6, 7]: "

if "%choice%"=="1" goto run_unified
if "%choice%"=="2" goto run_dev
if "%choice%"=="3" goto stop_app
if "%choice%"=="4" goto run_tests
if "%choice%"=="5" goto open_qr
if "%choice%"=="6" goto update_git
if "%choice%"=="7" goto exit_menu
echo Invalid choice. Kripya 1 se 7 ke beech number chunein.
timeout /t 2 >nul
goto menu

:run_unified
cls
color 0A
echo ========================================================
echo   Starting NG DineAI (Unified Single-Port Launcher)...
echo ========================================================
echo.
if exist "%~dp0venv\Scripts\python.exe" (
    "%~dp0venv\Scripts\python.exe" run_app.py
) else (
    python run_app.py
)
pause
goto menu

:run_dev
cls
color 0A
echo ========================================================
echo   Starting NG DineAI Dev Servers (FastAPI + Vite)...
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
echo   Dev servers chal rahe hain!
echo   Demo Login: owner@royalsaffron.com / RoyalPass123!
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

:open_qr
start http://127.0.0.1:8000/m/the-royal-saffron
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

:exit_menu
exit
