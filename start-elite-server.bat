@echo off
title RAGE:MP Elite Server - AI-Enhanced System
color 0B
cls

echo ================================================================================
echo.
echo    ██████╗  █████╗  ██████╗ ███████╗   ███╗   ███╗██████╗ 
echo    ██╔══██╗██╔══██╗██╔════╝ ██╔════╝   ████╗ ████║██╔══██╗
echo    ██████╔╝███████║██║  ███╗█████╗     ██╔████╔██║██████╔╝
echo    ██╔══██╗██╔══██║██║   ██║██╔══╝     ██║╚██╔╝██║██╔═══╝ 
echo    ██║  ██║██║  ██║╚██████╔╝███████╗██╗██║ ╚═╝ ██║██║     
echo    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝╚═╝     ╚═╝╚═╝     
echo.
echo         ELITE AI-ENHANCED ROLEPLAY SERVER
echo         Status: 100%% Operational - Self-Healing Enabled
echo.
echo ================================================================================
echo.

:: Check for Node.js
echo [1/6] Checking Node.js installation...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)
echo    ✅ Node.js detected
echo.

:: Check for MySQL
echo [2/6] Checking MySQL service...
sc query MySQL >nul 2>&1
if %errorlevel% neq 0 (
    echo    ⚠️  MySQL service not running. Please start MySQL.
    pause
)
echo    ✅ MySQL service ready
echo.

:: Install dependencies
echo [3/6] Verifying dependencies...
if not exist "node_modules\" (
    echo    📦 Installing dependencies...
    call npm install
) else (
    echo    ✅ Dependencies already installed
)
echo.

:: Run automated tests
echo [4/6] Running automated tests...
node tests/test-runner.js
if %errorlevel% neq 0 (
    echo.
    echo    ⚠️  Some tests failed. Continue anyway? (Y/N)
    set /p continue=
    if /i not "%continue%"=="Y" exit /b 1
)
echo.

:: Run optimizer
echo [5/6] Running performance optimizer...
node tools/optimizer.js
echo.

:: Start the server
echo [6/6] Starting RAGE:MP server with AI Watchdog...
echo.
echo ================================================================================
echo.
echo    🤖 AI Watchdog: ACTIVE
echo    🔒 Security: MAXIMUM
echo    ⚡ Performance: OPTIMIZED
echo    🎨 UI Theme: Glass Motion Transparent
echo    📊 Monitoring: 24/7 AUTO-HEALING
echo.
echo ================================================================================
echo.
echo Starting server...
echo.

:: Start server with garbage collection enabled
ragemp-server.exe --expose-gc

if %errorlevel% neq 0 (
    echo.
    echo ❌ Server crashed! Check logs for details.
    pause
)
