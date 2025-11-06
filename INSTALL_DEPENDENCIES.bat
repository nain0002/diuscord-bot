@echo off
:: ===================================
:: Install All Dependencies
:: ===================================

title Installing Dependencies

echo ===================================
echo INSTALLING DEPENDENCIES
echo ===================================
echo.

:: Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.
echo NPM version:
npm --version
echo.

:: Install root dependencies (for admin panel)
echo ===================================
echo Installing Admin Panel Dependencies
echo ===================================
echo.
call npm install
echo.

:: Install rp-server dependencies
echo ===================================
echo Installing Game Server Dependencies
echo ===================================
echo.
cd packages\rp-server
call npm install
cd ..\..
echo.

echo ===================================
echo INSTALLATION COMPLETE!
echo ===================================
echo.
echo All dependencies have been installed.
echo You can now start the servers.
echo.
pause
