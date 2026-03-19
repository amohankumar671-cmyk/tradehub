#!/bin/bash

echo ""
echo "============================================================"
echo "  TradeHub - Complete Trading Strategy Website"
echo "  Automated Setup Script for Mac / Linux"
echo "============================================================"
echo ""

# Check Node.js
echo "[1/5] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo ""
    echo "  ERROR: Node.js is not installed!"
    echo ""
    echo "  Please install Node.js first:"
    echo "  Mac:   https://nodejs.org  (download LTS version)"
    echo "  Linux: sudo apt install nodejs npm"
    echo ""
    echo "  Then run this script again: bash setup.sh"
    exit 1
fi
echo "  Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "[2/5] Installing project dependencies..."
echo "  This takes 2-3 minutes on first run. Please wait..."
echo ""
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo ""
    echo "  ERROR: Installation failed. Check your internet connection."
    exit 1
fi
echo ""
echo "  ✅ Dependencies installed!"
echo ""

# Check for .env.local
echo "[3/5] Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo ""
    echo "  ============================================================"
    echo "   OPTIONAL: Firebase Setup (for Login + Save Strategy)"
    echo "  ============================================================"
    echo "  1. Go to: https://console.firebase.google.com"
    echo "  2. Create project → Enable Auth (Google + Email)"
    echo "  3. Create Firestore database"
    echo "  4. Fill in .env.local with your Firebase keys"
    echo ""
    echo "  The app works WITHOUT Firebase — skip for now if you want."
    echo "  ============================================================"
    echo ""
fi

# Start
echo "[4/5] Starting TradeHub..."
echo ""
echo "  ============================================================"
echo "   ✅ TradeHub is starting!"
echo "   Open your browser at: http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo "  ============================================================"
echo ""
npm start
