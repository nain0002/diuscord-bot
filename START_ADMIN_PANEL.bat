@echo off
:: ===================================
:: Admin Panel Startup Script
:: ===================================

title RAGE:MP Admin Panel

echo ===================================
echo RAGE:MP ADMIN PANEL
echo ===================================
echo.

:: Check if admin-panel folder exists
if not exist "admin-panel" (
    echo [ERROR] admin-panel folder not found!
    echo.
    echo This file must be run from C:\RAGEMP\server-files\
    echo.
    pause
    exit /b 1
)

:: Check if .env exists
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo.
    echo Please create .env file from .env.example
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists in root
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    echo.
    call npm install
    echo.
)

echo Starting Enhanced Admin Panel...
echo.
echo Admin Panel will be available at:
echo http://localhost:3000
echo.
echo Default login: admin / admin
echo (Change this after first login!)
echo.

:: Start the admin panel
node admin-panel/server-enhanced.js

pause
