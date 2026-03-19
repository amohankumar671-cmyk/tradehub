# TradeHub v4 — Setup Checklist

## 1. Install & run locally

```bash
npm install --legacy-peer-deps
npm start
```

---

## 2. Firebase setup (15 min)

### Create project
1. https://console.firebase.google.com → Add project → name "tradehub"
2. Disable Google Analytics (not needed) → Create project

### Enable Authentication
1. Build → Authentication → Get started
2. Sign-in method → Enable **Google**
3. Sign-in method → Enable **Email/Password**
4. Authorised domains → add your Cloudflare Pages domain when ready

### Create Firestore database
1. Build → Firestore Database → Create database
2. Start in **production mode**
3. Location → **asia-south1** (Mumbai — lowest latency for India)
4. Create

### Apply security rules
1. Firestore → Rules tab
2. Paste the contents of `docs/firestore.rules`
3. Publish

### Get your config keys
1. Project Settings (gear icon) → Your apps → Add app → Web
2. Register app → copy the firebaseConfig object

### Add keys to your project
```bash
cp .env.example .env.local
# Edit .env.local and fill in all REACT_APP_FIREBASE_* values
```

---

## 3. NSE live data (optional)

### Option A — Free proxies (no setup)
Works out of the box. Tries allorigins.win then corsproxy.io.
May be slow during peak hours. Simulation fallback always active.

### Option B — Your own Cloudflare Worker (recommended)
1. dash.cloudflare.com → Workers & Pages → Create Worker
2. Paste `docs/cf-worker.js` → Deploy
3. Copy your worker URL
4. Add to .env.local:
   REACT_APP_NSE_PROXY_URL=https://your-worker.workers.dev/proxy?url=
5. Add same env var to Cloudflare Pages environment variables

---

## 4. Deploy to Cloudflare Pages

```bash
# Push to GitHub
git init
git add .
git commit -m "TradeHub v4 — auth + live signals"
git remote add origin https://github.com/YOUR_USERNAME/tradehub.git
git push -u origin main
```

1. dash.cloudflare.com → Pages → Create application → Connect to Git
2. Select your repo
3. Build settings:
   - Framework: Create React App
   - Build command: npm run build
   - Output directory: build
   - Node.js version: 18
4. Environment variables → add all REACT_APP_* values from .env.local
5. Save and Deploy

### Add Firebase domain to Auth
After deployment:
- Firebase Console → Authentication → Settings → Authorised domains
- Add your `*.pages.dev` domain and your custom domain

---

## 5. Feature summary

| Feature | How it works |
|---|---|
| Google sign-in | Firebase Auth popup — one click |
| Email/password | Firebase Auth — sign up creates Firestore profile |
| Save strategies | Firestore `users/{uid}.savedStrategies` array |
| Profile page | /profile — shows all saved strategies, stats |
| Save button | Bookmark icon on every strategy card and detail page |
| Live signals | NSE API via CORS proxy → C+V+C signal engine → sim fallback |
| Data source badge | Shows LIVE / SIM / ERR so you always know the source |
