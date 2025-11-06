@echo off
echo ================================================================
echo RAGE:MP Server - Automated Setup
echo ================================================================
echo.
echo This script will:
echo 1. Copy files to server-files directory
echo 2. Install dependencies
echo 3. Verify configuration
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo ================================================================
echo [1/5] Copying server code...
echo ================================================================
echo.

if not exist "C:\RAGEMP\server-files\packages\rp-server\" mkdir "C:\RAGEMP\server-files\packages\rp-server\"
if not exist "C:\RAGEMP\server-files\client_packages\" mkdir "C:\RAGEMP\server-files\client_packages\"

xcopy "%~dp0packages" "C:\RAGEMP\server-files\packages" /E /I /Y
xcopy "%~dp0client_packages" "C:\RAGEMP\server-files\client_packages" /E /I /Y

echo [OK] Code copied!

echo.
echo ================================================================
echo [2/5] Copying configuration files...
echo ================================================================
echo.

copy "%~dp0conf.json" "C:\RAGEMP\server-files\conf.json" /Y
copy "%~dp0.env" "C:\RAGEMP\server-files\.env" /Y

echo [OK] Configuration copied!

echo.
echo ================================================================
echo [3/5] Checking if package.json exists...
echo ================================================================
echo.

if not exist "C:\RAGEMP\server-files\packages\rp-server\package.json" (
    echo package.json not found, copying from workspace...
    copy "%~dp0package.json" "C:\RAGEMP\server-files\packages\rp-server\package.json" /Y
)

echo [OK] package.json ready!

echo.
echo ================================================================
echo [4/5] Installing dependencies...
echo ================================================================
echo.
echo This may take a few minutes...
echo.

cd "C:\RAGEMP\server-files\packages\rp-server"
call npm install

echo.
echo [OK] Dependencies installed!

echo.
echo ================================================================
echo [5/5] Verifying setup...
echo ================================================================
echo.

cd "C:\RAGEMP\server-files"

echo Checking required files:
echo.

if exist "ragemp-server.exe" (
    echo [OK] ragemp-server.exe found
) else (
    echo [ERROR] ragemp-server.exe NOT FOUND!
    echo Download from https://rage.mp/
)

if exist "conf.json" (
    echo [OK] conf.json found
) else (
    echo [ERROR] conf.json NOT FOUND!
)

if exist ".env" (
    echo [OK] .env found
) else (
    echo [ERROR] .env NOT FOUND!
)

if exist "packages\rp-server\index.js" (
    echo [OK] packages\rp-server\index.js found
) else (
    echo [ERROR] packages\rp-server\index.js NOT FOUND!
)

if exist "packages\rp-server\node_modules\" (
    echo [OK] node_modules folder found
) else (
    echo [ERROR] node_modules NOT FOUND!
)

if exist "client_packages\index.js" (
    echo [OK] client_packages\index.js found
) else (
    echo [ERROR] client_packages\index.js NOT FOUND!
)

echo.
echo ================================================================
echo Setup Complete!
echo ================================================================
echo.
echo IMPORTANT: Before starting the server:
echo.
echo 1. Make sure MySQL is running
echo 2. Update .env file with your MySQL password
echo 3. Make sure ragemp-server.exe exists in server-files
echo.
echo To start the server:
echo   cd C:\RAGEMP\server-files
echo   ragemp-server.exe
echo.
echo To start admin panel (optional):
echo   cd C:\RAGEMP\workspace
echo   npm run admin
echo.
pause
