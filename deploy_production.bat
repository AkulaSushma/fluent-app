@echo off
echo =======================================================================
echo              ENGURA ENTERPRISE PRODUCTION DEPLOYMENT
echo =======================================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Node.js and NPM are required for Expo and PM2.
    exit /b 1
)

:: Check for PM2
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] PM2 process manager not found. Installing globally...
    npm install -g pm2
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install PM2. Please run 'npm install -g pm2' manually in an administrator command prompt.
        exit /b 1
    )
)

echo [INFO] Running database seeding and migrations...
cd d:\Lingura\fluent\backend
call .venv\Scripts\python.exe -m app.seed.seed_data

echo [INFO] Starting all services permanently in the background via PM2...
cd d:\Lingura\fluent
pm2 start ecosystem.config.js

echo.
echo =======================================================================
echo [SUCCESS] ENGURA FULL STACK SUITE DEPLOYED SUCCESSFULLY!
echo =======================================================================
echo.
echo Current process status:
pm2 status
echo.
echo Useful management commands:
echo   - View real-time logs:     pm2 logs
echo   - Monitor all processes:   pm2 monit
echo   - Stop all services:       pm2 stop all
echo   - Restart backend:         pm2 restart fluent-backend
echo   - Restart Metro bundler:   pm2 restart fluent-mobile
echo.
pause
