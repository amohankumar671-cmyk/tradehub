# 📈 TradeHub — Your Complete Trading Strategy Website

A full trading strategy website with 34 proven strategies, live NSE F&O signals, calculators, candlestick encyclopedia, and user accounts.

## 🚀 Quick Start (3 steps)

### Step 1 — Install Node.js (one time only)
1. Go to **https://nodejs.org**
2. Click the big green **LTS** button to download
3. Open the downloaded file and click **Next → Next → Finish**
4. Restart your computer

### Step 2 — Run the setup

**Windows:** Double-click **`SETUP_WINDOWS.bat`**

**Mac/Linux:** Open Terminal in the tradehub folder and run: `bash setup.sh`

### Step 3 — Done!
Browser opens at **http://localhost:3000** ✅

---

## 📂 Pages

| Page | URL |
|---|---|
| Home | `/` |
| Strategy Library (34 strategies) | `/strategies` |
| Strategy Detail | `/strategies/[name]` |
| Candlestick Encyclopedia | `/candlesticks` |
| Live NSE Signals | `/signals` |
| Calculators | `/tools` |
| My Profile | `/profile` |

---

## 🔑 Optional: Enable Login + Save Strategy (Firebase)

1. Go to **https://console.firebase.google.com** → Add project → name "tradehub"
2. Build → Authentication → Enable **Google** and **Email/Password**
3. Build → Firestore Database → Create (production mode, asia-south1)
4. Project Settings → Your apps → Web → copy config values
5. Paste `docs/firestore.rules` into Firestore → Rules → Publish
6. Copy `.env.example` to `.env.local` and fill in your Firebase values
7. Restart with `npm start`

---

## 🌐 Deploy Online Free (Cloudflare Pages)

1. Push to GitHub repository
2. Connect at dash.cloudflare.com → Pages
3. Build command: `npm run build` | Output: `build` | Node: `18`
4. Add all REACT_APP_* env vars in Cloudflare settings

See **`docs/SETUP.md`** for complete step-by-step instructions.

---
*For educational purposes only. Not financial advice.*
