@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ========================================
echo     TG Web App React - Development
echo ========================================
echo.

cd /d "C:\Users\User\source\repos\43m04ka\tg-web-app-react"

if not exist "node_modules" (
    echo [1/2] Installing dependencies...
    echo Please wait, this may take a few minutes...
    echo.
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo.
        pause
        exit /b 1
    )
) else (
    echo [1/2] Dependencies already installed ✓
)

echo.
echo [2/2] Starting build...
echo.
call npm run build

pause
