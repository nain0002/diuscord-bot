@echo off
:: ===================================
:: Start Both Servers (Game + Admin Panel)
:: ===================================

title RAGE:MP Server Manager

echo ===================================
echo RAGE:MP SERVER MANAGER
echo ===================================
echo.
echo This will start both:
echo 1. Game Server (RAGE:MP)
echo 2. Admin Panel (Web Interface)
echo.
echo Press any key to continue...
pause >nul

:: Start Admin Panel in new window
start "RAGE:MP Admin Panel" cmd /k "START_ADMIN_PANEL.bat"

:: Wait 2 seconds
timeout /t 2 /nobreak >nul

:: Start Game Server in new window
start "RAGE:MP Game Server" cmd /k "START_GAME_SERVER.bat"

echo.
echo ===================================
echo SERVERS STARTING
echo ===================================
echo.
echo Game Server: Starting in new window
echo Admin Panel: http://localhost:3000
echo.
echo You can close this window now.
echo.
pause
