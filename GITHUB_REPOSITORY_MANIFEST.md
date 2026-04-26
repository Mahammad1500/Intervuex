# What is published to GitHub

**Repository:** [https://github.com/Mahammad1500/Intervuex](https://github.com/Mahammad1500/Intervuex)

This file is a **snapshot of paths tracked by Git** so you can see at a glance what the remote contains. Regenerate the exact list anytime with:

```bash
git ls-files | sort
```

---

## Commits (see `git log`)

- Run `git log --oneline -5` for recent history. After each push, the remote matches your latest local `main` (unless you use other branches).

---

## Root

| Path | Note |
|------|------|
| `package.json`, `package-lock.json` | Monorepo / workspace root scripts (if any) |
| `.gitignore` | Defines what is **not** committed (see bottom of this file) |
| `README.md` | Project overview |
| `QUICK_START.md` | Local quick start |
| `DATABASE_AND_LOCAL_SETUP.md` | DB, Compass, local vs Atlas |
| `MONGODB_ATLAS_SETUP.md` | Cloud MongoDB checklist |
| `EMAIL_AND_AUTOMATION.md` | Email-related notes |
| `POST_DEPLOYMENT_CHECKLIST.md` | Post-deploy checks |
| `SYSTEM_FLOW.md` | System flow documentation |
| `LOGIN_DEBUG_GUIDE.md` | Login troubleshooting |
| `LOGIN_FIX_SUMMARY.md` | Login fix notes |

---

## Backend (`backend/`)

- **Config:** `server.js`, `src/config/database.js`, `src/config/passport.js`
- **Env template:** `backend/.env.example` (copy to `backend/.env` locally — **never commit real `.env`**)
- **Entry / tooling:** `package.json`, `package-lock.json`, `seed.js`
- **Controllers:** `src/controllers/*` (auth, analytics, calendar, companies, feedback, interviews, users)
- **Middleware:** `src/middleware/*` (auth, error, rate limit, roles, validation)
- **Models:** `src/models/*` (User, Company, Interview, Feedback, etc.)
- **Routes:** `src/routes/*`
- **Services:** `src/services/*` (analytics, calendar sync, meeting, notifications, scheduling)
- **Utils:** `src/utils/*`
- **Scripts:** `src/scripts/*`

---

## Frontend (`frontend/`)

- **Config:** `package.json`, `package-lock.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`
- **Env template:** `frontend/.env.example`
- **Public:** `public/assets/IntervuexLogo.png`
- **App:** `src/main.jsx`, `src/App.jsx`, `src/index.css`
- **Layout / UI:** `src/components/layout/*`, `src/components/ui/*`, `src/components/common/*`
- **Pages:** `src/pages/*` (Landing, Login, Register, dashboards, Interviews, Settings, etc.)
- **Data:** `src/services/api.js`, `src/store/authStore.js`
- **Lib:** `src/lib/utils.js`

---

## What is **not** on GitHub (by design)

These paths are in `.gitignore` and are **not** pushed:

- `node_modules/` (all packages; install with `npm install`)
- `backend/.env`, `frontend/.env`, and other real env files with secrets
- Build outputs: `dist/`, `build/`
- Logs: `*.log`, `logs/`
- Editor / local: `.vscode/`, `.idea/`, `.claude/`, swap files
- Test coverage, caches, `*.pem`, and similar

Always keep **API keys, `MONGODB_URI` with password, and JWT secrets** in local or hosted env only.

---

*Generated for tracking; last updated when this file is committed with your codebase.*
