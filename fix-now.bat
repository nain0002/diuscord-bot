@echo off
echo ================================================================
echo RAGE:MP Server - Quick Diagnosis and Fix
echo ================================================================
echo.

cd C:\RAGEMP\server-files

echo [CHECK 1] Does node.dll exist?
if exist node.dll (
    echo [OK] node.dll found
) else (
    echo [ERROR] node.dll NOT FOUND - RAGE:MP not installed properly!
    echo.
    echo You MUST download RAGE:MP from https://rage.mp/
    echo.
    pause
    exit /b 1
)

echo.
echo [CHECK 2] Does ragemp-server.exe exist?
if exist ragemp-server.exe (
    echo [OK] ragemp-server.exe found
) else (
    if exist server.exe (
        echo [OK] server.exe found
    ) else (
        echo [ERROR] No server executable found!
        echo Download RAGE:MP from https://rage.mp/
        pause
        exit /b 1
    )
)

echo.
echo [CHECK 3] Checking folder structure...
if exist packages\rp-server\index.js (
    echo [OK] packages\rp-server\index.js exists
) else (
    echo [ERROR] packages\rp-server\index.js NOT FOUND!
    echo Run setup-server.bat first
    pause
    exit /b 1
)

echo.
echo [CHECK 4] Checking conf.json...
if exist conf.json (
    echo [OK] conf.json exists
    findstr "enable-nodejs" conf.json | findstr "true"
    if errorlevel 1 (
        echo [ERROR] enable-nodejs is not set to true!
        echo.
        echo FIXING...
        echo Creating new conf.json...
        (
            echo {
            echo   "maxplayers": 100,
            echo   "name": "RAGE:MP Roleplay Server",
            echo   "gamemode": "freeroam/roleplay",
            echo   "stream-distance": 500.0,
            echo   "port": 22005,
            echo   "announce": false,
            echo   "bind": "0.0.0.0",
            echo   "language": "en",
            echo   "url": "http://localhost",
            echo   "allow-cef-debugging": true,
            echo   "enable-nodejs": true,
            echo   "csharp": false
            echo }
        ) > conf.json
        echo [FIXED] conf.json updated
    ) else (
        echo [OK] enable-nodejs is set to true
    )
) else (
    echo [ERROR] conf.json NOT FOUND!
    echo Creating conf.json...
    (
        echo {
        echo   "maxplayers": 100,
        echo   "name": "RAGE:MP Roleplay Server",
        echo   "gamemode": "freeroam/roleplay",
        echo   "stream-distance": 500.0,
        echo   "port": 22005,
        echo   "announce": false,
        echo   "bind": "0.0.0.0",
        echo   "language": "en",
        echo   "url": "http://localhost",
        echo   "allow-cef-debugging": true,
        echo   "enable-nodejs": true,
        echo   "csharp": false
        echo }
    ) > conf.json
    echo [OK] conf.json created
)

echo.
echo ================================================================
echo DIAGNOSIS COMPLETE
echo ================================================================
echo.

if not exist node.dll (
    echo PROBLEM: You don't have RAGE:MP installed!
    echo.
    echo SOLUTION:
    echo 1. Go to https://rage.mp/
    echo 2. Download "Server Package for Windows"
    echo 3. Extract EVERYTHING to C:\RAGEMP\server-files\
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo Your RAGE:MP installation looks OK, but 'mp' global is not available.
echo This means your RAGE:MP version is TOO OLD or CORRUPTED.
echo.
echo SOLUTION:
echo 1. Download LATEST RAGE:MP from https://rage.mp/
echo 2. Delete everything in C:\RAGEMP\server-files\
echo 3. Extract fresh RAGE:MP files
echo 4. Run setup-server.bat to restore your code
echo.
echo The warning you're seeing means your RAGE:MP is outdated!
echo.
pause
