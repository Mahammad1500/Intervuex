# Intervuex — Complete Project Guide

This document explains **how the whole project works**: production vs demo, one codebase for both sites, why demo passwords appear on one URL and not the other, and how each part connects.

---

## Table of contents

1. [What is Intervuex?](#1-what-is-intervuex)
2. [Tech stack](#2-tech-stack)
3. [Two live websites, one GitHub repo](#3-two-live-websites-one-github-repo)
4. [Production — how it works](#4-production--how-it-works)
5. [Demo website — how it works](#5-demo-website--how-it-works)
6. [Why demo passwords show on demo but NOT on production](#6-why-demo-passwords-show-on-demo-but-not-on-production)
7. [How UI demo mode was built (same code, different behaviour)](#7-how-ui-demo-mode-was-built-same-code-different-behaviour)
8. [Environment variables — full comparison](#8-environment-variables--full-comparison)
9. [What happens when a visitor uses each site](#9-what-happens-when-a-visitor-uses-each-site)
10. [User roles (Admin vs HR)](#10-user-roles-admin-vs-hr)
11. [Folder structure (important paths)](#11-folder-structure-important-paths)
12. [Local development on your Mac](#12-local-development-on-your-mac)
13. [How code changes reach production or demo](#13-how-code-changes-reach-production-or-demo)
14. [Security notes](#14-security-notes)
15. [Things you can improve later](#15-things-you-can-improve-later)
16. [Quick reference](#16-quick-reference)

---

## 1. What is Intervuex?

Intervuex is a **full-stack web application** for interview scheduling:

- **Admin** creates company **workspaces** and manages HR users
- **HR** schedules interviews, uses a pipeline (kanban), and views analytics
- Candidates and interviewers are **email addresses on each interview** — they do **not** log in to the app

You built and deployed:

| Site | URL | Purpose |
|------|-----|---------|
| **Production** | https://intervuex-nine.vercel.app | Your real work — real data, your login |
| **Demo (UI preview)** | https://intervuex-demo.vercel.app | Public portfolio — visitors browse the UI with sample data |

---

## 2. Tech stack

| Layer | Technology | Where it runs |
|-------|------------|---------------|
| Frontend | React 18, Vite, Tailwind CSS | Vercel |
| Backend API | Node.js, Express | Railway (production only) |
| Database | MongoDB Atlas | Cloud (production only) |
| Auth | JWT tokens, bcrypt passwords | Backend + browser storage |

**Demo site exception:** The demo uses **only Vercel** (frontend). It does **not** use Railway or MongoDB. Sample data lives inside the frontend code.

---

## 3. Two live websites, one GitHub repo

```
GitHub: github.com/Mahammad1500/Intervuex  (single source code)
                    │
        ┌───────────┴───────────┐
        ▼                         ▼
   VERCEL PROJECT 1          VERCEL PROJECT 2
   "intervuex-nine"          "intervuex-demo"
   (production)              (UI preview)
        │                         │
        │                         └── No backend — mock data in browser
        ▼
   RAILWAY (backend API)
        │
        ▼
   MONGODB ATLAS (database: intervuex)
```

**You do NOT need two GitHub repos.**  
The **same code** is deployed twice on Vercel with **different environment variables**. That is what changes behaviour.

---

## 4. Production — how it works

### 4.1 Flow

1. User opens **intervuex-nine.vercel.app**
2. React app loads in the browser
3. Login form sends email + password to **Railway API** (`/api/auth/login`)
4. Railway checks **MongoDB Atlas** — real user, real password hash
5. API returns JWT token; frontend stores it and loads real data from API
6. Every page (Dashboard, Workspaces, Schedule, etc.) calls Railway for **real data**

### 4.2 Production services

| Service | Role |
|---------|------|
| **Vercel** | Builds `frontend/` folder, serves the website |
| **Railway** | Runs `backend/` folder, Node server 24/7 |
| **MongoDB Atlas** | Stores users, companies, interviews, audit logs |

### 4.3 Production login

- You use **your real admin email** (e.g. `mahammadhussain1500@gmail.com`)
- **No demo buttons** on the login page
- **No demo passwords** displayed
- Demo env vars are **not set** on production Vercel

### 4.4 Health check

Backend alive:

```bash
curl https://intervuex-production-5e78.up.railway.app/api/health
```

Expected: `"status":"ok"` and `"database":"connected"`

---

## 5. Demo website — how it works

### 5.1 Purpose

Visitors (recruiters, portfolio viewers) can:

- See how Intervuex **looks and feels**
- Click **Admin** or **HR** on login and explore all pages
- **Not** change or save anything (preview only)

They do **not** need a real account. They do **not** touch your production database.

### 5.2 Flow

1. User opens **intervuex-demo.vercel.app**
2. Same React code loads as production
3. Because `VITE_UI_DEMO_MODE=true` was set at **build time** on this Vercel project:
   - Login page shows **demo credential cards** (email + password visible)
   - Clicking **Admin** or **HR** logs in **without calling Railway**
   - All API requests are answered by **mock data** inside the browser (no network to your backend)
4. User browses Dashboard, Workspaces, Pipeline, etc. with **fake sample data**
5. If they try to create/edit/delete → blocked with “Preview mode” message

### 5.3 Demo services

| Service | Used? |
|---------|-------|
| Vercel | ✅ Yes — frontend only |
| Railway | ❌ No |
| MongoDB | ❌ No |

### 5.4 Demo credentials (shown on login page only)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@intervuex.com` | `12345678` |
| HR | `hr@intervuex.com` | `12345678` |

These accounts exist only in **demo mock data**. They are **not** your production users (unless you manually created the same email in production — keep production separate).

---

## 6. Why demo passwords show on demo but NOT on production

This is controlled by **one environment variable** on Vercel.

### 6.1 The switch: `VITE_UI_DEMO_MODE`

| Vercel project | `VITE_UI_DEMO_MODE` | Login page behaviour |
|----------------|---------------------|----------------------|
| **intervuex-nine** (production) | **Not set** (or `false`) | Normal login only — no demo cards, no passwords shown |
| **intervuex-demo** | **`true`** | Demo section visible — emails and passwords shown, click to enter |

### 6.2 Why this is safe

- Environment variables are set **per Vercel project**, not in GitHub
- Secrets and demo flags never need to be in source code
- Production build **never** includes `VITE_UI_DEMO_MODE=true` unless you set it on that project by mistake
- Demo passwords are **public by design** on the demo site — they only work in preview mode with fake data

### 6.3 Code that checks this

File: `frontend/src/demo/config.js`

```javascript
export const isUiDemoMode = () => import.meta.env.VITE_UI_DEMO_MODE === 'true';

export const isDemoSite = () =>
  isUiDemoMode()
  || import.meta.env.VITE_SHOW_DEMO_LOGIN === 'true'
  || import.meta.env.DEV;
```

File: `frontend/src/pages/Login.jsx`

- If `isDemoSite()` is true → show demo credential cards
- On production Vercel (no flags) → `isDemoSite()` is false → cards hidden

**Local dev:** `npm run dev` also shows demo cards because `import.meta.env.DEV` is true — useful for testing.

---

## 7. How UI demo mode was built (same code, different behaviour)

### 7.1 Files added for demo

| File | Purpose |
|------|---------|
| `frontend/src/demo/config.js` | Detects UI demo mode; lists demo accounts |
| `frontend/src/demo/demoAuth.js` | Fake login (no API) for Admin/HR |
| `frontend/src/demo/mockData.js` | Sample companies, interviews, users, charts |
| `frontend/src/demo/mockApi.js` | Intercepts API calls and returns mock JSON |

### 7.2 Step-by-step: what happens on demo login

1. User clicks **Admin** on login page
2. `authStore.demoEnterAs('admin')` runs
3. Sets fake user object from `mockData.js` in browser memory
4. Sets fake token `demo-token` (no server)
5. Navigates to `/dashboard`
6. Dashboard calls `analyticsAPI.getDashboard()`
7. `api.js` uses **demo adapter** instead of real HTTP — returns mock stats from `mockData.js`

### 7.3 Step-by-step: what happens on production login

1. User enters email + password, clicks Sign In
2. `authStore.login()` sends POST to Railway `/api/auth/login`
3. Railway validates against MongoDB
4. Real JWT returned; real API calls fetch real data

### 7.4 Blocking saves on demo

File: `frontend/src/demo/mockApi.js`

- **GET** requests → return sample data
- **POST / PATCH / DELETE** → return error: “Preview mode — sample data only”

Plus yellow **DemoBanner** at top after login: “UI preview mode — sample data only”.

### 7.5 Diagram: same Login component, two modes

```
                    Login.jsx (same file)
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    VITE_UI_DEMO_MODE=true      Not set (production)
              │                         │
              ▼                         ▼
    Show demo cards              Hide demo cards
    Click → demoEnterAs()        Form → login() → Railway
    mockApi returns fake data    Real API + MongoDB
```

---

## 8. Environment variables — full comparison

### 8.1 Production Vercel (`intervuex-nine`)

| Variable | Example value | Required? |
|----------|---------------|-----------|
| `VITE_API_URL` | `https://intervuex-production-5e78.up.railway.app/api` | ✅ Yes |
| `VITE_UI_DEMO_MODE` | **Do not set** | ❌ |
| `VITE_SHOW_DEMO_LOGIN` | **Do not set** | ❌ |

### 8.2 Demo Vercel (`intervuex-demo`)

| Variable | Value | Required? |
|----------|-------|-----------|
| `VITE_UI_DEMO_MODE` | `true` | ✅ Yes |
| `VITE_API_URL` | Not needed for UI demo | ❌ |

### 8.3 Production Railway (backend)

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection → database `intervuex` |
| `JWT_SECRET` | Signs login tokens |
| `JWT_REFRESH_SECRET` | Refresh tokens |
| `CLIENT_URL` | `https://intervuex-nine.vercel.app` (CORS) |
| `ALLOW_DEMO_USERS` | **false** or unset on production |
| `DEMO_READ_ONLY_MODE` | **false** or unset on production |

### 8.4 Local `.env` files (your Mac only — never commit)

- `backend/.env` — copy from `backend/.env.example`
- `frontend/.env` — copy from `frontend/.env.example`

---

## 9. What happens when a visitor uses each site

### Production visitor (you)

1. Open production URL
2. Login with your email
3. Create workspaces, schedule interviews, manage team
4. Data saved in MongoDB Atlas
5. Changes persist forever (until you delete them)

### Demo visitor (public)

1. Open demo URL
2. See Admin/HR cards with passwords
3. Click Admin → explore UI
4. See sample companies and interviews (fake)
5. Try to create workspace → error toast, nothing saved
6. Close browser → no impact on your production data

---

## 10. User roles (Admin vs HR)

Only **two** login roles exist in the database:

| Role | Can do |
|------|--------|
| **Admin** | Workspaces, Team, Audit log, everything HR can do |
| **HR** | Schedule interviews, pipeline, analytics — scoped to their company |

There are **no** Interviewer or Candidate login accounts. Those names on interviews are just email fields.

---

## 11. Folder structure (important paths)

```
Intervuex/
├── frontend/                 # React app (Vercel deploys this)
│   ├── src/
│   │   ├── pages/            # Login, Dashboard, Workspaces, Schedule, etc.
│   │   ├── components/       # UI pieces, WorkspacePanel, DemoBanner
│   │   ├── demo/             # UI demo mode (mock data + fake API)
│   │   ├── services/api.js   # HTTP client to backend
│   │   └── store/authStore.js
│   └── .env.example
├── backend/                  # Express API (Railway deploys this)
│   ├── src/
│   │   ├── routes/           # auth, interviews, companies, users, audit
│   │   ├── models/           # User, Company, Interview (MongoDB)
│   │   └── middleware/       # auth, demoReadOnly (for full-stack demo option)
│   └── .env.example
├── docs/
│   ├── PROJECT_GUIDE.md      # This file
│   └── screenshots/          # App screenshots for README
└── README.md                 # Public overview on GitHub
```

---

## 12. Local development on your Mac

```bash
cd ~/Projects/Intervuex
npm run install:all
cp backend/.env.example backend/.env    # fill MongoDB URI, JWT secrets
cp frontend/.env.example frontend/.env    # VITE_API_URL=http://localhost:5000/api

# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

- App: http://localhost:3000  
- API: http://localhost:5000/api/health  

Local dev shows demo login buttons automatically (`DEV` mode). To test UI demo locally:

```bash
# frontend/.env
VITE_UI_DEMO_MODE=true
```

---

## 13. How code changes reach production or demo

1. Edit code on your machine
2. Commit and push to GitHub `main` from **Terminal**:

```bash
cd ~/Projects/Intervuex
git add .
git commit -m "your message"
git push origin main
```

3. **Both** Vercel projects watch the same repo:
   - Production rebuilds with production env vars
   - Demo rebuilds with `VITE_UI_DEMO_MODE=true`
4. Railway rebuilds backend (production API only)
5. Usually live in 1–3 minutes

**Important:** Env vars are baked into the frontend at **build time**. If you change `VITE_UI_DEMO_MODE`, you must **redeploy** on Vercel.

---

## 14. Security notes

| Topic | Practice |
|-------|----------|
| Passwords in GitHub | Never commit `backend/.env` or `frontend/.env` |
| Production JWT secrets | Only on Railway |
| Demo passwords public | OK on demo site — fake accounts only |
| Your production password | Never shown on demo; not in source code |
| CORS | Railway `CLIENT_URL` must match production Vercel URL exactly |

---

## 15. Things you can improve later

| Priority | Improvement | Why |
|----------|-------------|-----|
| High | Add automated tests (`backend/npm test`) | Catch bugs before deploy |
| High | Hide/disable Save buttons in UI demo mode | Clearer UX than error after click |
| Medium | More sample data in `mockData.js` | Richer demo (more interviews, audit entries) |
| Medium | SMTP on production | Welcome emails, interview invites, password reset |
| Medium | Separate public demo link in README badge | Already have demo URL — keep README updated |
| Low | Hide “Create account” on demo login | Visitors should not register on preview site |
| Low | Mobile polish on Pipeline kanban | Better phone experience |
| Low | Second full-stack demo (Railway + `intervuex_demo` DB) | Only if you need real API with read-only demo — UI demo is enough for portfolio |

---

## 16. Quick reference

### URLs

| | URL |
|--|-----|
| Production frontend | https://intervuex-nine.vercel.app |
| Demo frontend | https://intervuex-demo.vercel.app |
| Production API health | https://intervuex-production-5e78.up.railway.app/api/health |
| GitHub | https://github.com/Mahammad1500/Intervuex |

### One-sentence summary

**One GitHub repo → two Vercel sites → production uses Railway + MongoDB with your login; demo uses `VITE_UI_DEMO_MODE=true` with fake login and sample data, no backend.**

### Demo deploy checklist (Vercel only)

1. New Vercel project from same repo  
2. Root directory: `frontend`  
3. Set `VITE_UI_DEMO_MODE=true`  
4. Deploy  
5. Login page shows Admin/HR with passwords  
6. Click to browse — production unchanged  

---

*Last updated: June 2026 — matches Intervuex production + UI demo architecture.*
