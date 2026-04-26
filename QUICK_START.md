# ⚡ Intervuex — Quick Start Guide (5 Minutes)

> **For AI Agents & Developers**: This guide gets Intervuex running in under 5 minutes with zero configuration.

---

## 🎯 What You Get

- ✅ **Backend API** running on `http://localhost:5000`
- ✅ **Frontend React App** running on `http://localhost:3000`
- ✅ **In-memory MongoDB** (auto-starts, no installation needed)
- ✅ **2 Demo Accounts** pre-seeded and ready to login

---

## 📋 Prerequisites Check

```bash
# Check Node.js (need v18+)
node --version

# Check npm
npm --version

# If missing, install from: https://nodejs.org/
```

---

## 🚀 Run the Project (3 Commands)

### Step 1: Install Dependencies (one-time, ~2 minutes)

```bash
cd /Users/dudekulamahammad.h/Projects/Intervuex
npm run install:all
```

**What this does**: Installs all packages for root, backend, and frontend.

---

### Step 2: Start Backend (Terminal 1)

```bash
cd /Users/dudekulamahammad.h/Projects/Intervuex
npm run dev:backend
```

**Expected output**:
```
✅ In-memory MongoDB started: 127.0.0.1
🚀 Intervuex API running on port 5000 [development]
```

**If you see errors**:
- ❌ `MongoDB connection error` → **Ignore it**, in-memory MongoDB will auto-start
- ❌ `Port 5000 already in use` → Kill existing process: `pkill -f "node backend"`

**Leave this terminal running** ⚠️

---

### Step 3: Seed Demo Users (Terminal 2, one-time)

```bash
curl -X POST http://localhost:5000/api/seed
```

**Expected output**:
```json
{
  "success": true,
  "results": [
    {"email": "admin@intervuex.com", "status": "created as admin"},
    {"email": "hr@intervuex.com", "status": "created as hr"}
  ]
}
```

---

### Step 4: Start Frontend (Terminal 2)

```bash
cd /Users/dudekulamahammad.h/Projects/Intervuex
npm run dev:frontend
```

**Expected output**:
```
VITE v5.4.21  ready in 212 ms
➜  Local:   http://localhost:3000/
```

**If you see errors**:
- ❌ `Port 3000 already in use` → Kill existing: `pkill -f vite`
- ❌ `Cannot find module` → Re-run: `npm install --prefix frontend`

**Leave this terminal running** ⚠️

---

## ✅ Verify It's Working

Open browser: **http://localhost:3000**

You should see the **Intervuex Landing Page**.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | What You Can Do |
|------|-------|----------|-----------------|
| **Admin** | `admin@intervuex.com` | `Admin@12345` | Everything (user management, analytics, scheduling) |
| **HR** | `hr@intervuex.com` | `Hr@123456` | Schedule interviews, view pipeline, analytics |

**Note**: Only **HR accounts** can self-register. The app now supports only **Admin** and **HR** login accounts.

---

## 🔧 Common Issues & Fixes

### Issue 1: Backend crashes with "MongoDB connection error"

**Solution**: The backend auto-starts in-memory MongoDB. Wait 10 seconds for it to download MongoDB binaries (first time only).

**Check logs for**:
```
Downloading MongoDB "8.2.1": 100%
✅ In-memory MongoDB started
```

---

### Issue 2: Frontend shows blank page or "Cannot connect"

**Checklist**:
1. ✅ Backend running? Check: `curl http://localhost:5000/api/health`
2. ✅ Demo users seeded? Run: `curl -X POST http://localhost:5000/api/seed`
3. ✅ Frontend running? Check: `curl http://localhost:3000`

**Fix**: Restart both servers:
```bash
# Kill all
pkill -f "node\|vite"

# Restart backend (Terminal 1)
cd /Users/dudekulamahammad.h/Projects/Intervuex
npm run dev:backend

# Wait for "MongoDB started", then seed (Terminal 2)
curl -X POST http://localhost:5000/api/seed

# Start frontend (Terminal 2)
npm run dev:frontend
```

---

### Issue 3: "Data disappeared after restart"

**Explanation**: In-memory MongoDB resets on every restart.

**Solution**: Re-seed after each backend restart:
```bash
curl -X POST http://localhost:5000/api/seed
```

**Permanent fix** (install real MongoDB):
```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Then restart backend — it will auto-connect to local MongoDB
```

---

### Issue 4: Login fails with "Invalid credentials"

**Checklist**:
1. ✅ Did you seed users? Run: `curl -X POST http://localhost:5000/api/seed`
2. ✅ Using correct password? See table above
3. ✅ Backend restarted? Re-seed after every backend restart

**Test login via API**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@intervuex.com","password":"Admin@12345"}'
```

**Expected**: `"success": true`

---

### Issue 5: Port already in use

**Kill all Node processes**:
```bash
pkill -f "node"
pkill -f "vite"
```

**Or kill specific port**:
```bash
# Kill port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

---

## 📁 File Locations Reference

| What | Path |
|------|------|
| Backend entry | `/Users/dudekulamahammad.h/Projects/Intervuex/backend/server.js` |
| Frontend entry | `/Users/dudekulamahammad.h/Projects/Intervuex/frontend/src/main.jsx` |
| Backend env | `/Users/dudekulamahammad.h/Projects/Intervuex/backend/.env` |
| Frontend env | `/Users/dudekulamahammad.h/Projects/Intervuex/frontend/.env` |
| API routes | `/Users/dudekulamahammad.h/Projects/Intervuex/backend/src/routes/` |
| React pages | `/Users/dudekulamahammad.h/Projects/Intervuex/frontend/src/pages/` |

---

## 🔍 Quick Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend health
curl http://localhost:3000

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@intervuex.com","password":"Admin@12345"}'

# Check demo users exist
curl -X POST http://localhost:5000/api/seed
```

---

## 🛠 Environment Variables (Already Configured)

### Backend `.env` (already set)
```bash
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/intervuex
JWT_SECRET=intervuex_jwt_secret_key_super_secure_2024_prod
JWT_REFRESH_SECRET=intervuex_refresh_secret_key_super_secure_2024
ENCRYPTION_KEY=intervuex_enc_key_32chars!!
```

### Frontend `.env` (already set)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Intervuex
```

**No changes needed** — these are pre-configured for local development.

---

## 📧 Email & Calendar Integration (Optional)

The app works **without** these. To enable:

### Gmail SMTP (for emails)
1. Enable 2FA on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `backend/.env`:
   ```
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

### Google Calendar (for availability checking)
1. Go to: https://console.cloud.google.com/
2. Create project → Enable "Google Calendar API"
3. Create OAuth 2.0 credentials
4. Update `backend/.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

**Without these**: Emails are logged to console, calendar features are disabled.

---

## 🎬 One-Command Run (Alternative)

If you want both servers in one terminal:

```bash
cd /Users/dudekulamahammad.h/Projects/Intervuex
npm run dev
```

**Then in another terminal**:
```bash
curl -X POST http://localhost:5000/api/seed
```

---

## 📊 Project Structure Quick Reference

```
Intervuex/
├── backend/              ← Express API (port 5000)
│   ├── server.js         ← Entry point
│   ├── .env              ← Config (JWT secrets, MongoDB URI)
│   └── src/
│       ├── models/       ← MongoDB schemas (User, Interview, Feedback)
│       ├── routes/       ← API endpoints (/auth, /interviews, /users)
│       ├── controllers/  ← Business logic
│       ├── services/     ← Scheduling, notifications, calendar sync
│       └── middleware/   ← Auth, validation, error handling
│
├── frontend/             ← React app (port 3000)
│   ├── src/
│   │   ├── pages/        ← Dashboard, Login, Interviews, etc.
│   │   ├── components/   ← UI components (Button, Card, Modal)
│   │   ├── store/        ← Zustand auth store
│   │   └── services/     ← Axios API wrapper
│   └── vite.config.js    ← Dev server + proxy config
│
├── package.json          ← Root scripts (npm run dev)
├── README.md             ← Full documentation
├── SYSTEM_FLOW.md        ← Architecture deep-dive
└── QUICK_START.md        ← This file
```

---

## 🐛 Debugging Tips

### Enable verbose logging

**Backend** (already enabled in dev):
- Check: `/Users/dudekulamahammad.h/Projects/Intervuex/backend/logs/combined.log`
- Errors: `/Users/dudekulamahammad.h/Projects/Intervuex/backend/logs/error.log`

**Frontend** (browser console):
- Open DevTools → Console tab
- All API calls logged with axios interceptor

### Test API directly

```bash
# Get auth token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@intervuex.com","password":"Admin@12345"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

# Use token for protected routes
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/analytics/dashboard
```

---

## ⏱ Estimated Times

| Task | Time |
|------|------|
| First-time setup (install deps) | 2-3 min |
| Start backend | 10-15 sec |
| Seed users | 1 sec |
| Start frontend | 5-10 sec |
| **Total first run** | **~3-4 min** |
| **Subsequent runs** | **~20 sec** |

---

## 🆘 Still Having Issues?

1. **Check both terminals are running** (backend + frontend)
2. **Verify ports are free**: `lsof -i:5000` and `lsof -i:3000`
3. **Re-seed users**: `curl -X POST http://localhost:5000/api/seed`
4. **Clear browser cache** and refresh
5. **Check logs**: `backend/logs/error.log`

**Nuclear option** (clean restart):
```bash
# Kill everything
pkill -f "node\|vite"

# Clean install
cd /Users/dudekulamahammad.h/Projects/Intervuex
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all

# Start fresh
npm run dev:backend  # Terminal 1
# Wait for MongoDB to start, then:
curl -X POST http://localhost:5000/api/seed  # Terminal 2
npm run dev:frontend  # Terminal 2
```

---

## ✅ Success Checklist

- [ ] Backend shows: `🚀 Intervuex API running on port 5000`
- [ ] Backend shows: `✅ In-memory MongoDB started`
- [ ] Seed returns: `"success": true` with 2 users
- [ ] Frontend shows: `VITE v5.4.21 ready`
- [ ] Browser opens: `http://localhost:3000`
- [ ] Landing page loads with Intervuex branding
- [ ] Login with `admin@intervuex.com` / `Admin@12345` works
- [ ] Dashboard shows greeting and stats

**If all checked** → You're ready to use Intervuex! 🎉

---

**Last Updated**: March 20, 2026  
**Tested On**: macOS, Node.js v18+
