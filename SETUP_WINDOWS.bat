@echo off
title TradeHub Setup
color 0A
echo.
echo  ============================================================
echo    TradeHub - Complete Trading Strategy Website
echo    Automated Setup Script for Windows
echo  ============================================================
echo.

:: Check Node.js
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Node.js is not installed!
    echo.
    echo  Please install Node.js first:
    echo  1. Go to: https://nodejs.org
    echo  2. Download the LTS version ^(green button^)
    echo  3. Install it ^(just click Next, Next, Finish^)
    echo  4. Come back and run this script again
    echo.
    pause
    exit /b 1
)
echo  Node.js found: 
node --version
echo.

:: Check npm
echo [2/5] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: npm not found. Reinstall Node.js from nodejs.org
    pause
    exit /b 1
)
echo  npm found:
npm --version
echo.

:: Install dependencies
echo [3/5] Installing project dependencies...
echo  This takes 2-3 minutes on first run. Please wait...
echo.
cd /d "%~dp0"
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Installation failed. Check your internet connection.
    pause
    exit /b 1
)
echo.
echo  Dependencies installed successfully!
echo.

:: Check for .env.local
echo [4/5] Checking environment configuration...
if not exist ".env.local" (
    echo  Creating .env.local from template...
    copy ".env.example" ".env.local" >nul
    echo.
    echo  ============================================================
    echo   IMPORTANT: Firebase Setup Required
    echo  ============================================================
    echo.
    echo   To enable Login and Save Strategy features:
    echo   1. Go to: https://console.firebase.google.com
    echo   2. Create a project named "tradehub"
    echo   3. Enable Authentication ^(Google + Email/Password^)
    echo   4. Create a Firestore database
    echo   5. Copy your config keys into .env.local
    echo.
    echo   The app works WITHOUT Firebase ^(just no login/save^)
    echo   You can skip this step for now.
    echo  ============================================================
    echo.
    pause
)

:: Start the app
echo [5/5] Starting TradeHub...
echo.
echo  ============================================================
echo   TradeHub is starting!
echo   Your browser will open at: http://localhost:3000
echo   Press Ctrl+C in this window to stop the server
echo  ============================================================
echo.
start http://localhost:3000
call npm start
