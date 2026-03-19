# Firebase Setup Guide — Step by Step

This guide sets up Login and Save Strategy features. Takes ~10 minutes.

---

## Part 1 — Create Firebase Project

1. Open your browser, go to: **https://console.firebase.google.com**

2. Sign in with your Google account (or create one free at google.com)

3. Click **"Add project"** (big blue/white button in the middle)

4. Project name: type `tradehub` → click **Continue**

5. Google Analytics: click **"Disable"** → click **Create project**

6. Wait ~30 seconds → click **Continue**

---

## Part 2 — Enable Authentication (Login)

1. In the left sidebar, click **Build** → **Authentication**

2. Click **"Get started"** button

3. You'll see a list of "Sign-in providers". Click **Google**
   - Toggle the **Enable** switch to ON (it turns blue)
   - Project support email: select your email from dropdown
   - Click **Save**

4. Go back to the list, click **Email/Password**
   - Toggle the first **Enable** switch to ON
   - Click **Save**

You should now see Google and Email/Password listed as enabled.

---

## Part 3 — Create Firestore Database (to save strategies)

1. In the left sidebar, click **Build** → **Firestore Database**

2. Click **"Create database"** button

3. Choose **"Start in production mode"** → click **Next**

4. Location dropdown: select **asia-south1 (Mumbai)** → click **Enable**

5. Wait ~30 seconds for it to create

---

## Part 4 — Apply Security Rules

1. You should be on the Firestore page. Click the **"Rules"** tab at the top

2. You'll see some default rules. **Delete all of them**

3. Open the file `docs/firestore.rules` from the tradehub folder in Notepad

4. **Copy all the text** from that file

5. **Paste it** into the Firestore Rules editor (replacing what was there)

6. Click **"Publish"** button

---

## Part 5 — Get Your Config Keys

1. Click the **gear icon** (⚙) at the top left, next to "Project Overview"

2. Click **"Project settings"**

3. Scroll down to **"Your apps"** section

4. Click the **Web icon** ( `</>` ) to add a web app

5. App nickname: type `tradehub-web` → click **"Register app"**

6. You'll see a code block like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy_SOMETHING_LONG",
     authDomain: "tradehub-abc12.firebaseapp.com",
     projectId: "tradehub-abc12",
     storageBucket: "tradehub-abc12.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```

7. **Keep this page open** — you need these values in the next step

---

## Part 6 — Add Keys to TradeHub

1. Open the `tradehub` folder on your computer

2. Find the file called **`.env.example`**
   > Note: Files starting with `.` may be hidden on Windows. 
   > In File Explorer: View → check "Hidden items"

3. **Copy** `.env.example` and rename the copy to **`.env.local`**

4. Open **`.env.local`** in Notepad (right-click → Open with → Notepad)

5. Replace each value with what you got from Firebase. Example:

   ```
   REACT_APP_FIREBASE_API_KEY=AIzaSy_SOMETHING_LONG
   REACT_APP_FIREBASE_AUTH_DOMAIN=tradehub-abc12.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=tradehub-abc12
   REACT_APP_FIREBASE_STORAGE_BUCKET=tradehub-abc12.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
   REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

   Leave `REACT_APP_NSE_PROXY_URL=` empty (blank after the = sign is fine)

6. **Save the file** (Ctrl+S)

---

## Part 7 — Restart and Test

1. If the website is already running, **close the terminal/command window**

2. Run the setup script again: double-click `SETUP_WINDOWS.bat`

3. Go to http://localhost:3000

4. Click **"Get Started"** or **"Log In"** in the top right

5. Try signing in with Google — a popup should appear ✅

6. After signing in, go to any strategy and click the **bookmark icon** to save it ✅

7. Click your name in the top right → **"My Saved Strategies"** to see your profile ✅

---

## Troubleshooting

**"Firebase: Error (auth/unauthorized-domain)"**
→ Go to Firebase Console → Authentication → Settings → Authorized domains
→ Add `localhost` if it's not there already

**Login popup closes immediately**
→ Check your `.env.local` file — make sure all values are filled in correctly

**"Permission denied" when saving**
→ Check that you pasted the Firestore rules correctly (Part 4 above)

**Can't find .env.example**
→ In Windows File Explorer: View menu → check "Hidden items" checkbox

---

*Questions? The app works fine without Firebase — Login just won't be available.*
