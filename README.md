# Intervuex

Interview scheduling platform for **Admin** and **HR** teams — workspaces, panel rounds, pipeline, and analytics.

**Live app:** [intervuex-nine.vercel.app](https://intervuex-nine.vercel.app)  
**UI demo:** [intervuex-demo.vercel.app](https://intervuex-demo.vercel.app) (click Admin or HR on login to browse sample data)

---

## What it does

- **Admin** — create company workspaces (Space codes), manage HR users, audit log  
- **HR** — schedule interviews, track pipeline, view analytics for their company  
- **Scheduling** — 4-step wizard, panel interviewers, conflict checks, manual meeting link (Zoom / Meet / Teams URL)  
- **Optional** — SMTP emails, Google sign-in (when env vars are set)

Login roles: **Admin** and **HR** only. Candidates and interviewers are emails on each interview — they do not sign in.

---

## Tech stack

React · Vite · Tailwind · Node.js · Express · MongoDB · JWT · Vercel · Railway

---

## Screenshots

| Landing | Dashboard | Workspaces | Schedule |
|---------|-----------|------------|----------|
| ![Landing](./docs/screenshots/01-landing.png) | ![Dashboard](./docs/screenshots/03-admin-dashboard.png) | ![Workspaces](./docs/screenshots/04-workspaces.png) | ![Schedule](./docs/screenshots/06-schedule-panel.png) |

More in [`docs/screenshots/`](docs/screenshots/).

---

## Quick start (local)

```bash
git clone https://github.com/Mahammad1500/Intervuex.git
cd Intervuex
npm run install:all
npm run setup:env
# Edit backend/.env and frontend/.env — see .env.example files
npm run dev
```

- App → http://localhost:3000  
- API health → http://localhost:5000/api/health  

---

## Deploy overview

| Site | Frontend | Backend | Database |
|------|----------|---------|----------|
| Production | Vercel (`frontend/`) | Railway (`backend/`) | MongoDB Atlas `intervuex` |
| UI demo | Vercel (`frontend/`, `VITE_UI_DEMO_MODE=true`) | None | Sample data in frontend |

Copy env var names from `backend/.env.example` and `frontend/.env.example`. Never commit `.env` files.

---

## License

MIT — see [LICENSE](LICENSE).
