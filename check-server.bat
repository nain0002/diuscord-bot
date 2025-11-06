@echo off
echo ================================================================
echo RAGE:MP Server Diagnostic Tool
echo ================================================================
echo.

echo [1/8] Checking current directory...
echo Current Directory: %CD%
echo.

echo [2/8] Checking if server.exe exists...
if exist "server.exe" (
    echo [OK] server.exe found!
    dir server.exe
) else (
    echo [ERROR] server.exe NOT FOUND!
    echo You need to download RAGE:MP server from https://rage.mp/
)
echo.

echo [3/8] Checking if conf.json exists...
if exist "conf.json" (
    echo [OK] conf.json found!
) else (
    echo [ERROR] conf.json NOT FOUND!
)
echo.

echo [4/8] Checking if .env exists...
if exist ".env" (
    echo [OK] .env found!
) else (
    echo [ERROR] .env NOT FOUND!
    echo Copy .env file to this directory
)
echo.

echo [5/8] Checking if packages folder exists...
if exist "packages\" (
    echo [OK] packages\ folder found!
    dir packages
) else (
    echo [ERROR] packages\ folder NOT FOUND!
)
echo.

echo [6/8] Checking if client_packages folder exists...
if exist "client_packages\" (
    echo [OK] client_packages\ folder found!
) else (
    echo [ERROR] client_packages\ folder NOT FOUND!
)
echo.

echo [7/8] Checking if node_modules exists...
if exist "node_modules\" (
    echo [OK] node_modules\ folder found!
) else (
    echo [WARNING] node_modules\ folder NOT FOUND!
    echo Run: npm install
)
echo.

echo [8/8] Checking if MySQL is running...
tasklist | findstr /I "mysql" > nul
if %errorlevel% equ 0 (
    echo [OK] MySQL appears to be running!
    tasklist | findstr /I "mysql"
) else (
    echo [WARNING] MySQL does not appear to be running!
    echo Start MySQL service before running the server
)
echo.

echo ================================================================
echo Diagnostic Complete!
echo ================================================================
echo.
echo If all checks passed, try running: server.exe
echo.
echo If server.exe is missing:
echo 1. Download from https://rage.mp/
echo 2. Extract to this directory
echo 3. Run this diagnostic again
echo.
pause
