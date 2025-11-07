@echo off
color 0A
cls

echo ================================================================
echo            RAGE:MP ROLEPLAY SERVER - CLEAN INSTALL
echo ================================================================
echo.
echo This will set up your server from scratch.
echo.
echo BEFORE RUNNING THIS:
echo 1. Make sure you have MySQL installed and running
echo 2. Make sure you have Node.js installed
echo 3. Download RAGE:MP Server from https://rage.mp/
echo.
echo Press any key to continue, or Ctrl+C to cancel...
pause > nul

cls
echo ================================================================
echo STEP 1: Creating folder structure...
echo ================================================================
echo.

REM Create directories
if not exist "C:\RAGEMP\server-files" mkdir "C:\RAGEMP\server-files"
if not exist "C:\RAGEMP\backup" mkdir "C:\RAGEMP\backup"

echo [OK] Folders created
echo.
pause

cls
echo ================================================================
echo STEP 2: Checking RAGE:MP installation...
echo ================================================================
echo.

cd C:\RAGEMP\server-files

if not exist "ragemp-server.exe" (
    if not exist "server.exe" (
        echo [ERROR] RAGE:MP Server not found!
        echo.
        echo You MUST download RAGE:MP Server first:
        echo.
        echo 1. Open browser and go to: https://rage.mp/
        echo 2. Click "Downloads"
        echo 3. Download "Server Package for Windows"
        echo 4. Extract ALL files to: C:\RAGEMP\server-files\
        echo 5. Run this script again
        echo.
        echo Press any key to open the download page...
        pause > nul
        start https://rage.mp/
        exit /b 1
    )
)

if not exist "node.dll" (
    echo [ERROR] node.dll not found!
    echo Your RAGE:MP installation is incomplete.
    echo.
    echo Please re-download from https://rage.mp/
    echo Make sure to extract ALL files!
    echo.
    pause
    exit /b 1
)

echo [OK] RAGE:MP Server found!
echo.
pause

cls
echo ================================================================
echo STEP 3: Copying server code...
echo ================================================================
echo.

REM Copy packages
echo Copying packages...
xcopy "%~dp0packages" "C:\RAGEMP\server-files\packages" /E /I /Y /Q
echo [OK] Packages copied

echo Copying client_packages...
xcopy "%~dp0client_packages" "C:\RAGEMP\server-files\client_packages" /E /I /Y /Q
echo [OK] Client packages copied

echo Copying conf.json...
copy "%~dp0conf.json" "C:\RAGEMP\server-files\conf.json" /Y > nul
echo [OK] conf.json copied

echo.
pause

cls
echo ================================================================
echo STEP 4: Creating .env file...
echo ================================================================
echo.

if not exist "C:\RAGEMP\server-files\.env" (
    echo Creating .env file...
    (
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=ragemp_server
        echo DB_PORT=3306
        echo.
        echo # Admin Panel
        echo ADMIN_PORT=3000
        echo SESSION_SECRET=your-secret-key-change-this
    ) > "C:\RAGEMP\server-files\.env"
    
    echo [OK] .env file created
    echo.
    echo IMPORTANT: Edit C:\RAGEMP\server-files\.env
    echo Set your MySQL password!
    echo.
    notepad "C:\RAGEMP\server-files\.env"
) else (
    echo [OK] .env file already exists
)

echo.
pause

cls
echo ================================================================
echo STEP 5: Installing dependencies...
echo ================================================================
echo.

cd "C:\RAGEMP\server-files\packages\rp-server"

if not exist "package.json" (
    echo Creating package.json...
    copy "%~dp0package.json" "package.json" > nul
)

echo Installing Node.js packages (this may take a few minutes)...
echo.
call npm install

if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed!
    echo Make sure Node.js is installed.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed!
echo.
pause

cls
echo ================================================================
echo STEP 6: Verifying installation...
echo ================================================================
echo.

cd "C:\RAGEMP\server-files"

set ERRORS=0

echo Checking files...
if exist "ragemp-server.exe" (echo [OK] ragemp-server.exe) else (if exist "server.exe" (echo [OK] server.exe) else (echo [FAIL] Server executable & set ERRORS=1))
if exist "node.dll" (echo [OK] node.dll) else (echo [FAIL] node.dll & set ERRORS=1)
if exist "conf.json" (echo [OK] conf.json) else (echo [FAIL] conf.json & set ERRORS=1)
if exist ".env" (echo [OK] .env) else (echo [FAIL] .env & set ERRORS=1)
if exist "packages\rp-server\index.js" (echo [OK] packages\rp-server\index.js) else (echo [FAIL] Server code & set ERRORS=1)
if exist "packages\rp-server\node_modules" (echo [OK] node_modules) else (echo [FAIL] node_modules & set ERRORS=1)
if exist "client_packages\index.js" (echo [OK] client_packages\index.js) else (echo [FAIL] Client code & set ERRORS=1)

echo.

if %ERRORS% GTR 0 (
    echo [ERROR] Some files are missing!
    echo Please check the errors above.
    pause
    exit /b 1
)

echo [SUCCESS] All files verified!
echo.
pause

cls
echo ================================================================
echo STEP 7: Creating database...
echo ================================================================
echo.

echo Checking MySQL connection...
mysql -u root -e "SELECT 1" > nul 2>&1

if errorlevel 1 (
    echo [WARNING] Cannot connect to MySQL
    echo.
    echo Make sure MySQL is running!
    echo The database will be created automatically when server starts.
    echo.
) else (
    echo Creating database...
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS ragemp_server;"
    if errorlevel 1 (
        echo [WARNING] Could not create database
        echo You may need to create it manually or set MySQL password
    ) else (
        echo [OK] Database created!
    )
)

echo.
pause

cls
echo ================================================================
echo             INSTALLATION COMPLETE!
echo ================================================================
echo.
echo Your RAGE:MP Roleplay Server is ready!
echo.
echo IMPORTANT NOTES:
echo ════════════════════════════════════════════════════════════════
echo.
echo 1. Make sure MySQL is running
echo.
echo 2. Edit .env file if needed:
echo    C:\RAGEMP\server-files\.env
echo    (Set your MySQL password)
echo.
echo 3. To START the game server:
echo    cd C:\RAGEMP\server-files
echo    ragemp-server.exe
echo.
echo 4. To START the admin panel (optional):
echo    cd C:\RAGEMP\workspace
echo    npm run admin
echo    (Access at http://localhost:3000)
echo    (Login: admin / admin123)
echo.
echo 5. Connect with RAGE:MP Client:
echo    Direct Connect: localhost:22005
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo Would you like to start the server now? (Y/N)
set /p START=

if /i "%START%"=="Y" (
    echo.
    echo Starting server...
    echo.
    cd "C:\RAGEMP\server-files"
    ragemp-server.exe
) else (
    echo.
    echo Server not started.
    echo Run: cd C:\RAGEMP\server-files
    echo Then: ragemp-server.exe
    echo.
    pause
)
