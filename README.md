# Intervuex

Intervuex is a full stack interview scheduling application for hiring teams. Company admins create workspaces and manage HR users. HR staff schedule interviews, move candidates through a pipeline, and view analytics. The product supports panel interviews, scheduling conflict checks, and optional email notifications.

Only **Admin** and **HR** roles can log in. Candidate and interviewer emails are stored on each interview record; those people are not app users.

---

## Live application

Both links below are public on the internet. Anyone can open them in a browser.

### 1. Production website (full application)

**URL:** https://intervuex-nine.vercel.app

This is the main live deployment. The React frontend runs on Vercel. The API runs on Railway. Data is stored in MongoDB Atlas.

**What you will see when you open it:**

- The **landing page** with product information
- A **login page** for Admin and HR accounts
- After sign in: dashboard, workspaces, scheduling, pipeline, analytics (based on role)

**How to sign in:** Use an Admin or HR account that already exists in the system. HR users can also **register** if they have a workspace **Space code** from their company admin.

This is a real running application, not a mockup.

---

### 2. UI demo (try the interface)

**URL:** https://intervuex-demo.vercel.app

This is a separate deployment for visitors who want to **explore the UI** without a real account or database.

**What you will see:**

- The same login and app screens as production
- **Admin** and **HR** buttons on the login page with demo credentials visible
- Sample companies, interviews, and charts (fake data built into the frontend)

**How to try it:**

1. Open the link above  
2. On the login page, click **Admin** or **HR**  
3. Browse dashboards, workspaces, pipeline, and other pages  
4. Saving or editing data is disabled in preview mode  

Demo credentials (also shown on the site): `admin@intervuex.com` / `12345678`

---

### 3. API health check (backend status)

**URL:** https://intervuex-production-5e78.up.railway.app/api/health

This is not a web page for end users. It returns a small JSON response from the production API.

**What to check:**

- `"status": "ok"` means the API server is running  
- `"database": "connected"` means MongoDB is reachable  

Use this link to confirm the backend is online after deployment or troubleshooting.

---

## Features

**Workspaces**  
Admins create a company workspace and receive an 8 character Space code. HR joins with that code or is added from the Team page.

**Scheduling**  
Four step wizard: people and role, date and time (conflict check), meeting link, review. Supports a lead interviewer and optional panel emails. Paste a Zoom, Meet, Teams, or other meeting URL.

**Pipeline and analytics**  
Kanban pipeline by interview status. Dashboards and charts for hiring activity.

**Admin tools**  
Team management, audit log, settings, light and dark theme.

**Optional**  
SMTP email and Google sign-in when configured in environment variables (see `backend/.env.example`).

---

## Tech stack

React, Vite, Tailwind CSS, Node.js, Express, MongoDB, JWT, Vercel, Railway

---

## Screenshots

### Public and auth

Landing page

![Landing](./docs/screenshots/01-landing.png)

Login

![Login](./docs/screenshots/02-login.png)

HR registration with Space code

![Register](./docs/screenshots/02b-register.png)

### Admin views

Dashboard

![Admin dashboard](./docs/screenshots/03-admin-dashboard.png)

Workspaces

![Workspaces](./docs/screenshots/04-workspaces.png)

Team

![Team](./docs/screenshots/05-team.png)

Schedule with panel interviewers

![Schedule panel](./docs/screenshots/06-schedule-panel.png)

Schedule review step

![Schedule review](./docs/screenshots/06b-schedule-review.png)

Analytics

![Admin analytics](./docs/screenshots/08-analytics-admin.png)

Audit log

![Audit log](./docs/screenshots/09-audit-log.png)

Settings

![Admin settings](./docs/screenshots/10-settings-admin.png)

### HR views

Dashboard

![HR dashboard](./docs/screenshots/08-hr-dashboard.png)

Interviews list

![HR interviews](./docs/screenshots/11-hr-interviews.png)

Pipeline

![HR pipeline](./docs/screenshots/12-hr-pipeline.png)

Schedule

![HR schedule](./docs/screenshots/13-hr-schedule.png)

Analytics

![HR analytics](./docs/screenshots/hr-analytics.png)

Settings

![HR settings](./docs/screenshots/14-hr-settings.png)

---

## Run locally (developers)

**Step 1.** Clone the repository

```bash
git clone https://github.com/Mahammad1500/Intervuex.git
cd Intervuex
```

**Step 2.** Install dependencies

```bash
npm run install:all
```

**Step 3.** Create environment files

```bash
npm run setup:env
```

Copy values into `backend/.env` and `frontend/.env` from the `.env.example` files in each folder. You need at least `MONGODB_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` on the backend, and `VITE_API_URL` on the frontend.

**Step 4.** Start the app

```bash
npm run dev
```

Open http://localhost:3000 in your browser.  
API health: http://localhost:5000/api/health

**Step 5 (optional).** Seed demo users for local testing only

```bash
curl -X POST http://localhost:5000/api/seed
```

**Step 6 (optional).** Run automated tests

```bash
npm test
```

---

## Deploy to production (developers)

**Step 1.** Push this repository to GitHub.

**Step 2.** Create a Railway project. Set root directory to `backend`. Add environment variables from `backend/.env.example`.

**Step 3.** Create a Vercel project. Set root directory to `frontend`. Set `VITE_API_URL` to your Railway URL plus `/api`.

**Step 4.** Set Railway `CLIENT_URL` to your Vercel frontend URL.

**Step 5.** Use MongoDB Atlas with database name `intervuex`.

For a public UI demo only, create a second Vercel project with `VITE_UI_DEMO_MODE=true`. No Railway or database required for that demo.

Never commit `.env` files to GitHub.

---

## License

This project is open source under the **MIT License**. You can use, modify, and distribute the code with attribution. Full text: [LICENSE](./LICENSE).
