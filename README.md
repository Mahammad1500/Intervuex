# Intervuex

Intervuex is a full stack interview scheduling app built for hiring teams. Admins set up company workspaces and invite HR users. HR schedules interviews, tracks candidates in a pipeline, and reviews analytics. The app supports panel rounds (multiple interviewers), conflict checks before booking, and optional email notifications.

**Login accounts:** Admin and HR only. Candidates and interviewers appear as email addresses on each interview. They do not sign in to the app.

---

## Live links

| Link | URL | Who it is for |
|------|-----|----------------|
| **Production** | [intervuex-nine.vercel.app](https://intervuex-nine.vercel.app) | Real app with live data (Railway API + MongoDB). Use your own admin account. |
| **UI demo** | [intervuex-demo.vercel.app](https://intervuex-demo.vercel.app) | Public preview with sample data. No backend. On the login page, click **Admin** or **HR** to explore. Demo login: `admin@intervuex.com` / `12345678` (also shown on the demo site). |

API health (production): [intervuex-production-5e78.up.railway.app/api/health](https://intervuex-production-5e78.up.railway.app/api/health)

---

## Features

**Workspaces**  
Admin creates a company workspace and gets an 8 character Space code. HR can join with that code or be added from the Team page. Optional allowed email domains per workspace.

**Scheduling**  
Four step wizard: candidate and interviewer details, date and time (with conflict detection), meeting link, review. Lead interviewer plus optional panel emails. Meeting links are pasted manually (Zoom, Google Meet, Teams, or any URL).

**Pipeline and analytics**  
HR sees interviews on a kanban board (Scheduled, Confirmed, Completed, Cancelled). Dashboards and charts show activity and trends.

**Admin tools**  
Team management, audit log, workspace settings, light/dark theme.

**Optional integrations**  
SMTP for welcome and interview emails. Google sign-in on the login page when OAuth env vars are configured (see `backend/.env.example`). Google Calendar and auto Meet generation are not required for the current workflow.

---

## Tech stack

Frontend: React 18, Vite, Tailwind CSS, Zustand, React Router  
Backend: Node.js, Express, MongoDB, Mongoose, JWT  
Deploy: Vercel (frontend), Railway (backend), MongoDB Atlas

---

## Screenshots

### Public and auth

**Landing page**  
Marketing page with product overview.

![Landing](./docs/screenshots/01-landing.png)

**Login**  
Email and password sign in. Optional Google button when configured.

![Login](./docs/screenshots/02-login.png)

**Register**  
HR registration with a workspace Space code.

![Register](./docs/screenshots/02b-register.png)

### Admin

**Dashboard**  
Platform stats and recent activity.

![Admin dashboard](./docs/screenshots/03-admin-dashboard.png)

**Workspaces**  
Create companies, Space codes, and allowed domains.

![Workspaces](./docs/screenshots/04-workspaces.png)

**Team**  
Manage HR users per workspace.

![Team](./docs/screenshots/05-team.png)

**Schedule (panel)**  
Scheduling wizard with multiple panel interviewers.

![Schedule panel step](./docs/screenshots/06-schedule-panel.png)

**Schedule review**  
Final review before confirming an interview.

![Schedule review](./docs/screenshots/06b-schedule-review.png)

**Analytics**  
Charts and hiring metrics.

![Admin analytics](./docs/screenshots/08-analytics-admin.png)

**Audit log**  
Record of admin actions.

![Audit log](./docs/screenshots/09-audit-log.png)

**Settings**  
Profile and preferences.

![Admin settings](./docs/screenshots/10-settings-admin.png)

### HR

**HR dashboard**  
Company scoped overview.

![HR dashboard](./docs/screenshots/08-hr-dashboard.png)

**Interviews list**  
Filter and manage interviews.

![HR interviews](./docs/screenshots/11-hr-interviews.png)

**Pipeline**  
Kanban view by status.

![HR pipeline](./docs/screenshots/12-hr-pipeline.png)

**Schedule**  
HR scheduling flow.

![HR schedule](./docs/screenshots/13-hr-schedule.png)

**HR analytics**

![HR analytics](./docs/screenshots/hr-analytics.png)

**HR settings**

![HR settings](./docs/screenshots/14-hr-settings.png)

---

## Local setup

**Requirements:** Node.js 18+, npm 9+, MongoDB (local or Atlas)

```bash
git clone https://github.com/Mahammad1500/Intervuex.git
cd Intervuex
npm run install:all
npm run setup:env
```

Edit `backend/.env` and `frontend/.env` using the matching `.env.example` files. At minimum set `MONGODB_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` on the backend, and `VITE_API_URL` on the frontend.

```bash
npm run dev
```

Frontend: http://localhost:3000  
API health: http://localhost:5000/api/health  

Local dev can seed demo users (development only):

```bash
curl -X POST http://localhost:5000/api/seed
```

Run backend tests:

```bash
npm test
```

---

## Deployment

Production uses two services plus a database:

1. **Railway** runs the backend (`backend/` folder). Set variables from `backend/.env.example` (MongoDB URI, JWT secrets, `CLIENT_URL` pointing to your Vercel URL).
2. **Vercel** hosts the frontend (`frontend/` folder). Set `VITE_API_URL` to your Railway API URL with `/api` suffix.
3. **MongoDB Atlas** database name: `intervuex`.

The public UI demo is a second Vercel project from the same repo with root directory `frontend` and `VITE_UI_DEMO_MODE=true`. It does not need Railway or MongoDB.

Do not commit `.env` files. Keep secrets in Railway, Vercel, or your local machine only.

---

## License

MIT. See [LICENSE](LICENSE).
