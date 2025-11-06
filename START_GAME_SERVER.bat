@echo off
:: ===================================
:: RAGE:MP Server Startup Script
:: ===================================

title RAGE:MP Roleplay Server

echo ===================================
echo RAGE:MP ROLEPLAY SERVER
echo ===================================
echo.

:: Check if ragemp-server.exe exists
if not exist "ragemp-server.exe" (
    echo [ERROR] ragemp-server.exe not found!
    echo.
    echo This file must be run from C:\RAGEMP\server-files\
    echo.
    echo Please make sure you have:
    echo 1. Downloaded RAGE:MP Server from https://rage.mp/
    echo 2. Extracted all files to this directory
    echo 3. Copied workspace files here
    echo.
    pause
    exit /b 1
)

:: Check if packages folder exists
if not exist "packages\rp-server" (
    echo [ERROR] packages\rp-server folder not found!
    echo.
    echo Please copy the workspace files first!
    echo.
    pause
    exit /b 1
)

:: Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo.
    echo Please create .env file from .env.example
    echo and configure your database settings.
    echo.
    pause
)

:: Check if node_modules exists
if not exist "packages\rp-server\node_modules" (
    echo [INFO] Installing dependencies...
    echo.
    cd packages\rp-server
    call npm install
    cd ..\..
    echo.
)

echo Starting RAGE:MP Server...
echo.
echo Server will start in 3 seconds...
timeout /t 3 /nobreak >nul

:: Start the server
ragemp-server.exe

:: If server closes, pause so we can see any errors
pause
