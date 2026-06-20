# How to test Intervuex

This guide explains **every way to test** the project: what each command does, why you use it, and how to know if you passed or failed.

---

## Quick answer: what each command does

| Command | What it does | Does it test your app? |
|---------|--------------|-------------------------|
| `npm test` | Runs **automated** Jest tests on backend code | ✅ Yes — logic & API routes (in memory) |
| `npm run dev` | Starts app **locally** on your Mac | ✅ Yes — you test in browser yourself |
| `npm run build` | **Compiles** frontend to static files | ⚠️ Only checks “does it build?” — not if features work |
| `npm start` | Runs backend like **production** (one server) | ✅ Yes — if you then call API or use frontend against it |
| Browser on live URLs | Tests **real** production & demo | ✅ Yes — most important for go-live |

**`npm run build` alone is NOT enough.** It only proves the React app compiles. You still need `npm test`, local `npm run dev`, or live browser tests.

---

## Level 1 — Automated tests (Terminal, ~10 seconds)

### Run from project root

```bash
cd ~/Projects/Intervuex
npm test
```

Or from backend only:

```bash
cd backend
npm test
```

### What runs

| Test file | What it checks |
|-----------|----------------|
| `health.test.js` | *(live health checked via `npm run test:smoke`)* |
| `companyEmail.test.js` | Email domain parsing for workspaces (8 tests) |

### How to evaluate

| Output | Meaning |
|--------|---------|
| `Tests: X passed` | ✅ Automated tests passed |
| `FAIL` or red errors | ❌ Something broke — read the error line |
| `No tests found` | Tests not installed — pull latest code |

Example pass:

```
Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
```

---

## Level 2 — Smoke tests (live sites, 1 minute)

Proves production servers are online.

```bash
# Backend + database
curl -s https://intervuex-production-5e78.up.railway.app/api/health

# Websites respond
curl -s -o /dev/null -w "Production: %{http_code}\n" https://intervuex-nine.vercel.app/
curl -s -o /dev/null -w "Demo: %{http_code}\n" https://intervuex-demo.vercel.app/
```

| Pass | Fail |
|------|------|
| `"status":"ok"`, `"database":"connected"` | Check Railway + MongoDB Atlas |
| Both URLs print `200` | Redeploy Vercel |

---

## Level 3 — Local manual test (browser, ~15 minutes)

Best when you **changed code** before pushing.

### Start the app

```bash
cd ~/Projects/Intervuex
npm run dev
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:5000/api/health  

### First-time setup (if not done)

```bash
npm run setup          # creates .env files
# Edit backend/.env — add MONGODB_URI and JWT_SECRET
curl -X POST http://localhost:5000/api/seed   # demo users (local only)
```

### Checklist

| Step | Action | Pass if |
|------|--------|---------|
| 1 | Open http://localhost:3000 | Landing page loads |
| 2 | Login demo admin / 12345678 | Dashboard loads |
| 3 | Workspaces → create (name ≥ 2 chars) | Saves or shows clear error |
| 4 | Schedule one interview | Appears in Pipeline |

**Why local?** Faster than deploy; does not affect production data if using local or dev DB.

---

## Level 4 — Production manual test (browser, ~15 minutes)

URL: https://intervuex-nine.vercel.app  
Login: **your real admin email**

| Step | Action | Pass if |
|------|--------|---------|
| 1 | Login | Dashboard, no network error |
| 2 | Workspaces → create company | Appears in list |
| 3 | Invalid name (1 letter) or short space code | **Error message or toast** |
| 4 | Schedule interview | Shows in Pipeline |
| 5 | Logout + login again | Still works |

**Evaluate:** If all pass → production is ready for your daily use.

---

## Level 5 — Demo manual test (browser, ~10 minutes)

URL: https://intervuex-demo.vercel.app/login

| Step | Action | Pass if |
|------|--------|---------|
| 1 | Login page | Admin + HR cards with email and `12345678` |
| 2 | Click Admin → Enter | Sample dashboard |
| 3 | Workspaces / Pipeline | Fake data visible |
| 4 | Try create/save | Blocked — preview message |
| 5 | Production login page | **No** demo passwords shown |

**Evaluate:** If all pass → safe to share demo link on portfolio/README.

---

## Level 6 — Build test (optional)

Checks frontend compiles (no syntax/build errors).

```bash
cd ~/Projects/Intervuex
npm run build
```

| Pass | Fail |
|------|------|
| Ends with `built in ...` / no errors | Fix errors shown in Terminal |

Vercel runs this on every deploy. Useful before push if you changed frontend.

---

## Recommended order (do this today)

```
1. npm test                    → automated (8 tests)
2. npm run test:smoke          → live API + both websites
3. Production browser checklist → your real account
4. Demo browser checklist      → portfolio site
5. npm run build (optional)    → frontend compiles
```

---

## Scorecard (fill in after testing)

| Level | Tool | Pass? | Notes |
|-------|------|-------|-------|
| 1 Automated | `npm test` | ☐ | ___ / ___ tests |
| 2 Smoke | `curl` | ☐ | |
| 3 Local | `npm run dev` + browser | ☐ | skip if only testing live |
| 4 Production | browser | ☐ | ___ / 5 steps |
| 5 Demo | browser | ☐ | ___ / 5 steps |
| 6 Build | `npm run build` | ☐ | optional |

**Ready for portfolio:** Level 1 + 2 + 4 + 5 all pass.  
**Ready for daily use:** Level 4 all pass.

---

## If something fails

| Problem | Check |
|---------|--------|
| `npm test` fails | Read failing test name; fix that file |
| Login network error | Vercel `VITE_API_URL`, Railway running |
| Demo no password cards | Vercel demo → `VITE_UI_DEMO_MODE=true` → Redeploy |
| Workspace no error on bad input | Pull latest code (validation fix) |

---

See also: [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) for architecture and deployment.
