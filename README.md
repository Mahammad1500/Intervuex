<div align="center">

<img src="https://img.shields.io/badge/Intervuex-Automated%20Interview%20Scheduling-6366f1?style=for-the-badge&logo=lightning&logoColor=white" />

# ⚡ Intervuex

### Automated Interview Scheduling Platform

**Schedule interviews in seconds. Intervuex handles availability detection, real meeting links, calendar events, and email notifications — automatically.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

**Production app:** [https://intervuex-nine.vercel.app](https://intervuex-nine.vercel.app) (owner use — your admin account)

**UI demo (portfolio):** [https://intervuex-demo.vercel.app](https://intervuex-demo.vercel.app) — browse with sample data, no backend

📖 **Full project guide:** [docs/PROJECT_GUIDE.md](./docs/PROJECT_GUIDE.md) — production vs demo, env vars, how one repo powers both sites

[![Live Demo](https://img.shields.io/badge/Demo-intervuex--demo.vercel.app-6366f1?style=for-the-badge)](https://intervuex-demo.vercel.app)

Repository: [github.com/Mahammad1500/Intervuex](https://github.com/Mahammad1500/Intervuex)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Documentation](#-documentation)
- [Core Features](#-core-features)
- [Automation Workflow](#-automation-workflow)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Folder Structure](#-folder-structure)
- [Role-Based Access Control](#-role-based-access-control)
- [API Overview](#-api-overview)
- [Live Demo & Screenshots](#-live-demo--screenshots)
- [Setup Instructions](#-setup-instructions)

---

## 🧠 Overview

**Intervuex** is a MERN interview scheduling platform for **Admin** and **HR** users. Companies get isolated **workspaces** with Space codes; HR schedules interviews with optional **panel** rounds.

HR enters candidate email, lead interviewer email, role, type, and time — then pastes a **meeting link** (Zoom / Meet / Teams). The system:

1. Checks scheduling conflicts (database + optional panelists)
2. Saves the interview in MongoDB Atlas
3. Sends email invitations when SMTP is configured
4. Runs reminder cron jobs when email is enabled
5. Shows pipeline, analytics, and audit log

**Login roles:** only **Admin** and **HR** (there are no Interviewer or Candidate login accounts — those are email addresses on each interview record).

---

## 📖 Documentation

| Document | What it covers |
|----------|----------------|
| **[docs/PROJECT_GUIDE.md](./docs/PROJECT_GUIDE.md)** | **Start here** — production vs demo, one codebase, env vars, why demo passwords show on demo only, mock data, deploy checklist |
| [README.md](./README.md) | Features, setup, API overview, screenshots |

**Two live sites, one repo:**

| Site | URL | Backend | Login |
|------|-----|---------|-------|
| Production | [intervuex-nine.vercel.app](https://intervuex-nine.vercel.app) | Railway + MongoDB | Your real email — **no demo passwords shown** |
| UI demo | [intervuex-demo.vercel.app](https://intervuex-demo.vercel.app) | None (sample data in frontend) | `admin@intervuex.com` / `12345678` — **shown on login page** |

Demo passwords appear only where `VITE_UI_DEMO_MODE=true` is set on Vercel (demo project). Production does not set that variable.

---

## ✨ Core Features (what is actually built)

### 🏢 Company workspaces
- Admin creates companies with **Space codes**
- HR joins via `/register?code=…` or admin adds from Team
- Optional allowed email domains per workspace

### 📅 Interview scheduling
- 4-step wizard: details → time → meeting link → review
- **Panel interviewers** (multiple emails per round)
- Conflict detection against existing interviews
- Manual meeting URL (no auto Google Meet in current UI)

### 👥 Team & access
- Admin: Workspaces, Team, Audit log, full platform
- HR: Schedule, pipeline, interviews, analytics (scoped to company)

### 📧 Notifications (when SMTP configured)
- Welcome emails, interview invites, reminders via `node-cron`
- In-app notification center

### 📊 Analytics & pipeline
- Dashboard stats, trends, HR kanban pipeline
- Interviewer workload stats (by email on interviews)

### 🔐 Security
- JWT auth, bcrypt passwords, rate limiting, Helmet, audit log
- Optional **Continue with Google** (when OAuth env vars set)
- Light / dark theme toggle

### 🎨 UI
- React 18 + Tailwind CSS + Framer Motion
- Responsive sidebar, dashboard, workspaces, schedule wizard
- Screenshots in [`docs/screenshots/`](docs/screenshots/)

---

## 🔐 Roles (login accounts)

Only **two** user roles exist in the database:

| Role | Who | Can do |
|------|-----|--------|
| **Admin** | Platform owner | Workspaces, Team, Audit log, all HR features |
| **HR** | Company recruiter | Schedule interviews, pipeline, analytics for their workspace |

**Not login roles:** “Candidate” and “Interviewer” on old docs meant **emails on an interview** — they do not sign in to Intervuex.

---

## 🔄 Scheduling workflow (current)

```
HR opens Schedule wizard
         │
         ▼
Enter candidate email + lead interviewer + optional panel
         │
         ▼
Pick date/time → conflict check (DB + panelists)
         │
         ▼
Paste meeting link (Zoom / Meet / Teams URL)
         │
         ▼
Save interview → emails if SMTP configured → reminders via cron
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router 6 |
| **Styling** | Tailwind CSS 3, Radix UI primitives |
| **Animation** | Framer Motion 10 |
| **Charts** | Recharts |
| **State** | Zustand (with persist middleware) |
| **Forms** | React Hook Form |
| **Backend** | Node.js 18+, Express 4 |
| **Database** | MongoDB 7, Mongoose 7 |
| **Auth** | JWT (access + refresh tokens), Passport.js |
| **Calendar APIs** | Google Calendar API (googleapis), Microsoft Graph API |
| **Meeting APIs** | Google Meet, Microsoft Teams, Zoom Server-to-Server |
| **Email** | Nodemailer (SMTP) |
| **Scheduler** | node-cron |
| **Security** | Helmet, express-rate-limit, bcryptjs, CryptoJS (token encryption) |
| **Logging** | Winston |
| **Validation** | express-validator |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Dashboard│ │ Pipeline │ │ Calendar │ │  Analytics   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│                    Zustand Store + Axios                      │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JWT Bearer)
┌────────────────────────▼────────────────────────────────────┐
│                     EXPRESS SERVER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware: Helmet · CORS · Rate Limit · JWT Auth   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  /auth   │ │/interviews│ │/calendar │ │  /analytics  │   │
│  │  /users  │ │/feedback  │ │/meetings │ │/notifications│   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    SERVICES LAYER                    │   │
│  │  SchedulingEngine · CalendarSync · MeetingGeneration │   │
│  │  NotificationService · AnalyticsService             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────┬───────────────┬───────────────┬───────────────────┘
          │               │               │
    ┌─────▼─────┐   ┌─────▼─────┐  ┌─────▼───────────────────┐
    │  MongoDB  │   │   SMTP    │  │   External APIs          │
    │ (Mongoose)│   │  (Email)  │  │  Google · Microsoft · Zoom│
    └───────────┘   └───────────┘  └─────────────────────────┘
```

---

## 📁 Folder Structure

```
intervuex/
├── backend/
│   ├── server.js                    # Express app entry point
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── config/
│       │   ├── database.js          # MongoDB connection
│       │   └── passport.js          # JWT + Google OAuth strategies
│       ├── controllers/
│       │   ├── authController.js    # Register, login, refresh, me
│       │   ├── interviewController.js # Schedule, cancel, reschedule
│       │   ├── userController.js    # CRUD + interviewer/candidate lists
│       │   ├── calendarController.js # OAuth flows, availability
│       │   ├── analyticsController.js # Dashboard, trends, funnel
│       │   └── feedbackController.js # Submit, get, update feedback
│       ├── middleware/
│       │   ├── auth.js              # JWT authenticate + token generation
│       │   ├── roleCheck.js         # authorize() middleware
│       │   ├── rateLimiter.js       # General, auth, scheduling limiters
│       │   ├── validation.js        # express-validator schemas
│       │   └── errorHandler.js      # Centralized error handling
│       ├── models/
│       │   ├── User.js              # User schema with roles
│       │   ├── Interview.js         # Interview schema
│       │   ├── Feedback.js          # Feedback + ratings schema
│       │   ├── CalendarToken.js     # Encrypted OAuth tokens
│       │   └── Notification.js      # In-app notifications
│       ├── routes/
│       │   ├── auth.js
│       │   ├── interviews.js
│       │   ├── users.js
│       │   ├── calendar.js
│       │   ├── feedback.js
│       │   ├── analytics.js
│       │   ├── meetings.js
│       │   └── notifications.js
│       ├── services/
│       │   ├── schedulingEngine.js     # Conflict detection + slot suggestions
│       │   ├── calendarSyncService.js  # Google/Microsoft calendar CRUD
│       │   ├── meetingGenerationService.js # Meet/Teams/Zoom link generation
│       │   ├── notificationService.js  # Email + in-app + cron reminders
│       │   └── analyticsService.js     # Aggregation pipelines
│       └── utils/
│           ├── logger.js             # Winston logger
│           ├── tokenEncryption.js    # AES encrypt/decrypt for OAuth tokens
│           ├── emailTemplates.js     # HTML email templates
│           └── helpers.js           # Date, pagination, constants
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Routes + protected routes
│       ├── index.css                # Tailwind + CSS variables
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppLayout.jsx    # Shell with sidebar + topbar
│       │   │   ├── Sidebar.jsx      # Animated collapsible sidebar
│       │   │   └── Topbar.jsx       # Header with notifications
│       │   ├── ui/
│       │   │   ├── Button.jsx       # Variants: primary/secondary/ghost/danger
│       │   │   ├── Card.jsx         # Card + StatCard components
│       │   │   ├── Badge.jsx        # Status, type, role badges
│       │   │   ├── Input.jsx        # Input, Select, Textarea
│       │   │   ├── Modal.jsx        # Animated modal
│       │   │   └── Toaster.jsx      # Toast notifications (Zustand)
│       │   └── common/
│       │       └── LoadingScreen.jsx
│       ├── pages/
│       │   ├── Landing.jsx          # Public marketing page
│       │   ├── Login.jsx            # Auth + demo accounts
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx        # Stats, charts, upcoming interviews
│       │   ├── ScheduleInterview.jsx # 4-step scheduling wizard
│       │   ├── Interviews.jsx       # Filterable table with actions
│       │   ├── InterviewDetail.jsx  # Full detail + feedback + actions
│       │   ├── Pipeline.jsx         # Kanban-style pipeline board
│       │   ├── CalendarView.jsx     # Monthly calendar view
│       │   ├── Analytics.jsx        # Charts, funnel, performance table
│       │   ├── Feedback.jsx         # Star rating feedback form
│       │   ├── Users.jsx            # User management table
│       │   ├── Settings.jsx         # Profile, calendar integration, security
│       │   └── NotFound.jsx
│       ├── store/
│       │   └── authStore.js         # Zustand auth store (persisted)
│       ├── services/
│       │   └── api.js               # Axios instance + all API modules
│       └── lib/
│           └── utils.js             # cn(), formatters, status configs
│
├── package.json                     # Root monorepo scripts
├── .gitignore
└── README.md
```

---

## 👥 Role-Based Access Control (actual — login accounts only)

Intervuex has **two login roles**: **Admin** and **HR**. There are **no** Interviewer or Candidate login accounts.

“Interviewer” and “Candidate” in old docs meant **email addresses on an interview record** — those people get emails but do **not** sign in to the app.

| Feature | Admin | HR |
|---------|:-----:|:--:|
| Dashboard & analytics | ✅ | ✅ (own company) |
| Workspaces (create companies, Space codes) | ✅ | ❌ |
| Team / user management | ✅ | ❌ |
| Audit log | ✅ | ❌ |
| Schedule interview | ✅ | ✅ |
| Cancel / reschedule interview | ✅ | ✅ |
| View interviews & pipeline | ✅ | ✅ (own company) |
| Panel interviewers (emails on a round) | ✅ | ✅ |
| Settings (profile, password) | ✅ | ✅ |
| Toggle user active/inactive | ✅ | ❌ |

**HR scope:** HR only sees data for their **workspace** (`companyId`). Admin sees the whole platform.

**Public demo site:** When deployed with `DEMO_READ_ONLY_MODE=true`, demo accounts (`admin@intervuex.com`, `hr@intervuex.com`) can **browse every page** but **cannot** create, edit, or delete anything (blocked on the API).

---

## 📡 API Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate refresh token |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/update-password` | Change password |

### Interviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interviews` | Schedule new interview |
| GET | `/api/interviews` | List interviews (filtered by role/company) |
| GET | `/api/interviews/upcoming` | Get upcoming interviews |
| GET | `/api/interviews/:id` | Get interview detail |
| PATCH | `/api/interviews/:id` | Update interview |
| PATCH | `/api/interviews/:id/cancel` | Cancel interview |
| POST | `/api/interviews/:id/reschedule` | Reschedule interview |
| GET | `/api/interviews/confirm/:token` | Public attendance confirm link (email token) |

### Companies / Workspaces (admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List all workspaces (admin) |
| POST | `/api/companies` | Create workspace |
| GET | `/api/companies/workspace` | Current user’s workspace |
| PATCH | `/api/companies/:id/space-code` | Regenerate Space code |
| DELETE | `/api/companies/:id` | Delete workspace |

### Audit (admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit` | Admin audit log |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics/trends` | Interview trends over time |
| GET | `/api/analytics/funnel` | Hiring funnel by type/status |
| GET | `/api/analytics/interviewer-performance` | Interviewer stats |
| GET | `/api/analytics/feedback` | Feedback statistics |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback/interview/:id` | Submit interview feedback |
| GET | `/api/feedback/interview/:id` | Get feedback for interview |
| GET | `/api/feedback/mine` | Get my feedbacks |
| PUT | `/api/feedback/:id` | Update feedback |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js ≥ 18.0.0
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- npm ≥ 9.0.0

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/intervuex.git
cd intervuex
```

### 2. Install All Dependencies

```bash
npm run install:all
```

This installs dependencies for the root, backend, and frontend simultaneously.

### 3. Configure Environment Variables

```bash
npm run setup:env
```

This copies `.env.example` to `.env` for both backend and frontend. **Fill in your credentials** before starting:

```bash
# Edit backend environment
nano backend/.env

# Edit frontend environment
nano frontend/.env
```

### 4. Start Development Servers

```bash
npm run dev
```

- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:5000
- **Health Check** → http://localhost:5000/api/health

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/intervuex

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
JWT_REFRESH_EXPIRES_IN=30d

# Token Encryption (for stored OAuth tokens)
ENCRYPTION_KEY=your_32_char_encryption_key_here!!

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="Intervuex <noreply@intervuex.com>"

# Google OAuth & Calendar
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/google/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/calendar/microsoft/callback

# Zoom
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_REDIRECT_URI=http://localhost:5000/api/meetings/zoom/callback
ZOOM_ACCOUNT_ID=your_zoom_account_id
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Intervuex
```

---

## 🔗 Integration Setup

### Google Calendar & Google Meet

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → **Enable APIs**: `Google Calendar API`
3. Go to **Credentials** → **Create OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:5000/api/calendar/google/callback`
4. Copy **Client ID** and **Client Secret** to `backend/.env`
5. Go to **OAuth consent screen** → add test users (in development)

> Meeting links are automatically generated via `conferenceData` in the Calendar Events insert API.

### Microsoft Teams & Outlook

1. Go to [Azure Portal](https://portal.azure.com/) → **App Registrations** → New Registration
2. Redirect URI: `http://localhost:5000/api/calendar/microsoft/callback`
3. Under **API Permissions**, add:
   - `Calendars.ReadWrite` (Delegated)
   - `OnlineMeetings.ReadWrite` (Delegated)
   - `offline_access` (for refresh tokens)
4. Create a **Client Secret** under **Certificates & secrets**
5. Copy **Application (client) ID**, **Client Secret**, and **Directory (tenant) ID** to `backend/.env`

### Zoom (Server-to-Server OAuth)

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/) → **Develop** → **Build App**
2. Choose **Server-to-Server OAuth** app type
3. Activate the app and add scopes:
   - `meeting:write:admin`
   - `meeting:write`
4. Copy **Account ID**, **Client ID**, and **Client Secret** to `backend/.env`

### Email (SMTP via Gmail)

1. Go to your Google Account → **Security** → **2-Step Verification** (enable it)
2. Go to **App Passwords** → create a password for "Mail"
3. Use your Gmail address as `SMTP_USER` and the app password as `SMTP_PASS`

> For production, use [SendGrid](https://sendgrid.com), [Mailgun](https://mailgun.com), or [AWS SES](https://aws.amazon.com/ses/) by updating the SMTP config.

---

## 🚀 Running the Project

### Development

```bash
# Start both frontend and backend with hot reload
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend
```

### Production Build

```bash
# Build the frontend for production
npm run build

# Start the backend server (serves production API)
npm start
```

### Individual Commands

```bash
# Backend only (from root)
cd backend && npm run dev

# Frontend only (from root)
cd frontend && npm run dev

# Backend tests
cd backend && npm test
```

---

## 🚀 Deploy public demo (UI preview) — recommended

**Goal:** Visitors open a demo URL, see **Admin** and **HR** credentials on the login page, click to enter, and browse the full UI with **sample data**. No backend, no database, production untouched.

### Recommended: UI-only demo (Vercel only)

| | **Production** | **UI demo** |
|--|----------------|-------------|
| Vercel | `intervuex-nine.vercel.app` | `intervuex-demo.vercel.app` (new project) |
| Railway | ✅ Yes | ❌ **Not needed** |
| MongoDB | ✅ Yes | ❌ **Not needed** |
| Login | Your real email | `admin@intervuex.com` / `12345678` (shown on page) |
| Data | Real | Sample data built into frontend |

**Steps:**

1. [vercel.com](https://vercel.com) → **Add New Project** → same **Intervuex** repo  
2. Name: `intervuex-demo` · Root directory: **`frontend`**  
3. Environment variable:

| Name | Value |
|------|--------|
| `VITE_UI_DEMO_MODE` | `true` |

4. Deploy → open login page → click **Admin** or **HR** card (email + password visible)  
5. Browse Dashboard, Workspaces, Pipeline, etc. — all sample data; saves blocked  

**Demo credentials (shown on login page):**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@intervuex.com` | `12345678` |
| HR | `hr@intervuex.com` | `12345678` |

---

### Optional: full-stack demo (Railway + MongoDB)

Use this only if you need **real API** with read-only demo accounts. Same repo, second Railway service + `intervuex_demo` database. See [`frontend/.env.example`](frontend/.env.example) for `VITE_SHOW_DEMO_LOGIN` instead of `VITE_UI_DEMO_MODE`.

<details>
<summary>Full-stack demo steps (click to expand)</summary>

```
ONE GitHub repo → Production (Vercel + Railway + intervuex)
               → Demo (Vercel + Railway + intervuex_demo)
```

1. Atlas: database `intervuex_demo` on same cluster  
2. Railway: new project, root `backend`, set `ALLOW_DEMO_USERS=true`, `DEMO_READ_ONLY_MODE=true`  
3. Vercel demo: `VITE_API_URL`, `VITE_SHOW_DEMO_LOGIN=true`  

</details>

---

## 🌐 Live Demo & Screenshots

### Live demo

| Environment | URL |
|-------------|-----|
| **Production (Vercel)** | [https://intervuex-nine.vercel.app](https://intervuex-nine.vercel.app) |
| **UI demo (Vercel)** | [https://intervuex-demo.vercel.app](https://intervuex-demo.vercel.app) |
| **API health** | [https://intervuex-production-5e78.up.railway.app/api/health](https://intervuex-production-5e78.up.railway.app/api/health) |

### Screenshots

Screenshots are included under [`docs/screenshots/`](docs/screenshots/).

| Landing | Admin dashboard | Workspaces | Schedule (panel) |
|---------|-----------------|------------|------------------|
| ![Landing](./docs/screenshots/01-landing.png) | ![Dashboard](./docs/screenshots/03-admin-dashboard.png) | ![Workspaces](./docs/screenshots/04-workspaces.png) | ![Schedule](./docs/screenshots/06-schedule-panel.png) |

| Login | Team | Audit log | HR pipeline |
|---------|------|-----------|-------------|
| ![Login](./docs/screenshots/02-login.png) | ![Team](./docs/screenshots/05-team.png) | ![Audit](./docs/screenshots/09-audit-log.png) | ![Pipeline](./docs/screenshots/12-hr-pipeline.png) |

### What each screen shows

- **Landing** — marketing page, no pricing
- **Dashboard (admin)** — platform stats + link to Workspaces
- **Workspaces** — company Space codes, HR invite links
- **Schedule** — lead interviewer + optional **panel** round
- **Team** — HR users per workspace, temp password on create
- **Audit log** — admin actions (create workspace, user, etc.)

---

## 🖥 UI Sections (reference)

### 🏠 Landing Page
Marketing hero, features, how it works — no pricing section.

### 📊 Dashboard
Role-aware stats, 14-day activity chart, workspace summary (admin).

### 📅 Schedule Interview (wizard)
1. **Details** — candidate, lead interviewer, **panel interviewers**, role, type  
2. **Schedule** — date/time, duration, timezone, conflict check  
3. **Platform** — paste meeting link (Zoom / Meet / Teams URL)  
4. **Review** — confirm and send emails  

### 📋 Interview Pipeline (HR)
Kanban: Scheduled → Confirmed → Completed → Cancelled

### 📈 Analytics
Trends, completion rates, interviewer performance

### 👥 Team & Workspaces (admin)
Create workspaces, Space codes, add HR, resend welcome email

### ⚙️ Settings
Profile, notifications, optional password change (not forced)

---

## 🖥 UI Sections / Screenshots _(legacy section — see Live Demo above)_

---

## 🔐 Security Features

- **JWT** access tokens (7d) + refresh tokens (30d) with rotation
- **Bcrypt** password hashing (12 rounds)
- **AES encryption** for stored OAuth access/refresh tokens
- **Helmet.js** security headers
- **express-rate-limit** — general (100/15min), auth (10/15min), scheduling (20/min)
- **express-validator** — input validation and sanitization on all endpoints
- **Role-based middleware** on every protected route
- **CORS** restricted to configured client origin
- Refresh tokens stored in DB — invalidated on logout

---

## 🧪 Demo accounts (demo deployment only)

For the **public demo site** — not your production URL:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@intervuex.com` | `12345678` |
| HR | `hr@intervuex.com` | `12345678` |

Enable with Railway `ALLOW_DEMO_USERS=true` + `DEMO_READ_ONLY_MODE=true` and Vercel `VITE_SHOW_DEMO_LOGIN=true`.  
**Turn demo OFF on production** (`intervuex-nine.vercel.app`) — use only your personal admin login there.

---

## Concepts — why we do things this way

Short answers; **full guide:** [docs/PROJECT_GUIDE.md](./docs/PROJECT_GUIDE.md) (production vs demo, env vars, architecture).

| Question | Answer |
|----------|--------|
| What is Intervuex? | Automated interview scheduling for HR — not a pricing/billing product |
| Why MongoDB in `.env`? | Passwords stay off GitHub; backend reads `MONGODB_URI` at startup and connects to Atlas |
| Why `%40` instead of `@` in URI? | URLs use `@` to separate password from server — encode `@` in the password as `%40` |
| Why two `.env` files? | Backend = secrets + DB; frontend = public API URL only |
| Where is my data in Atlas? | Database **`intervuex`**, not `sample_mflix` (sample movies are unrelated) |
| Company workspace? | Admin → **Workspaces** → create company + Space code; HR joins via `/register?code=…` or Team |
| Demo passwords on login? | Only on [intervuex-demo.vercel.app](https://intervuex-demo.vercel.app) when `VITE_UI_DEMO_MODE=true` — see [PROJECT_GUIDE.md](./docs/PROJECT_GUIDE.md) |
| Why did production work after deleting GitHub? | Vercel/Railway keep running last deploy; data is in Atlas, not GitHub — see [How production works](#-how-production-works-read-this-first) |
| Do I need to reconnect Vercel/Railway? | Only if deploy fails or `git push` does not trigger redeploy |
| Full explanation of both sites? | [docs/PROJECT_GUIDE.md](./docs/PROJECT_GUIDE.md) |

**Your app collections:** `intervuex` → `users`, `companies`, `interviews`, …

---

## 🏗 How production works (read this first)

Intervuex in production is **four separate services**. They talk to each other, but **deleting or recreating GitHub does not stop the live site**.

```
┌─────────────┐     push code      ┌──────────────┐
│   GitHub    │ ─────────────────► │    Vercel    │  hosts React UI (frontend)
│  (storage)  │                    │  intervuex-  │  https://intervuex-nine.vercel.app
└─────────────┘                    │  nine...     │
       │                           └──────┬───────┘
       │ push code                         │ API calls (VITE_API_URL)
       ▼                                   ▼
┌─────────────┐                    ┌──────────────┐
│   Railway   │ ◄── MONGODB_URI ──►│ MongoDB Atlas│  your data lives here
│  (backend)  │                    │  database:   │  NOT on GitHub
│  Node API   │                    │  intervuex   │
└─────────────┘                    └──────────────┘
  ...railway.app/api/health
```

| Piece | What it does | Your URL |
|-------|----------------|----------|
| **GitHub** | Stores source code and git history | [github.com/Mahammad1500/Intervuex](https://github.com/Mahammad1500/Intervuex) |
| **Vercel** | Builds `frontend/` and serves the website | [intervuex-nine.vercel.app](https://intervuex-nine.vercel.app) |
| **Railway** | Runs `backend/` Node server 24/7 | [intervuex-production-5e78.up.railway.app](https://intervuex-production-5e78.up.railway.app) |
| **MongoDB Atlas** | Stores users, companies, interviews | Cloud database `intervuex` |

### Why the app still worked after you recreated GitHub

You deleted GitHub and made a new repo with the **same name**, then we pushed the same code again. **Vercel and Railway kept working** because:

1. **They already deployed your code** — Vercel and Railway run copies of your app on *their* servers. Those copies keep running until you redeploy or delete the project. Deleting GitHub does **not** turn off Vercel or Railway.
2. **Your data is in MongoDB Atlas** — users and interviews are **not** stored on GitHub. Recreating the repo did **not** wipe your database.
3. **Same repo name** — Vercel/Railway often still point at `Mahammad1500/Intervuex`. When we pushed again, they may auto-deploy, or they keep serving the **last successful deploy** (your screenshot showed a deploy from ~18h ago — that build is still live and valid).
4. **Same commit content** — the code we pushed is identical to what was deployed before, so nothing broke.

**Conclusion:** You did **not** need to reconnect for the site to keep working. Reconnect is only needed if Vercel/Railway show **disconnected**, **failed deploy**, or **future `git push` does not trigger a new deploy**.

### When you *do* need to reconnect Vercel or Railway

| Symptom | What to do |
|---------|------------|
| `git push` but Vercel/Railway never redeploy | Settings → Git/Source → reconnect `Mahammad1500/Intervuex` |
| Vercel dashboard shows “Repository not found” | Re-import or reconnect GitHub repo |
| Login works locally but production shows network error | Check Railway is running + `VITE_API_URL` on Vercel |
| CORS / blocked request after changing domain | Railway → set `CLIENT_URL` to exact Vercel URL, redeploy |

### How a code change reaches production (normal flow)

1. You edit code on your Mac (Cursor or any editor).
2. You commit and push from **Terminal** (not Cursor’s Commit button):
   ```bash
   cd ~/Projects/Intervuex
   git add .
   git commit -m "feat: your change"
   git push origin main
   ```
3. **Vercel** sees the push → rebuilds `frontend/` → updates the website (usually 1–2 min).
4. **Railway** sees the push → rebuilds `backend/` → restarts the API (usually 2–5 min).
5. **Atlas** is unchanged — same database, new code talks to old data.

### Quick health checks (run anytime)

```bash
# Backend alive + database connected?
curl -s https://intervuex-production-5e78.up.railway.app/api/health

# Frontend responding?
curl -s -o /dev/null -w "%{http_code}\n" https://intervuex-nine.vercel.app/
```

Expected: health JSON with `"status":"ok"` and `"database":"connected"`; frontend returns `200`.

### Environment variables (where secrets live)

| Where | Key variables | Purpose |
|-------|----------------|---------|
| **Railway** (backend) | `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `NODE_ENV=production` | Server secrets, DB connection, CORS |
| **Vercel** (frontend) | `VITE_API_URL=https://intervuex-production-5e78.up.railway.app/api` | Tells React where the API is |
| **Your Mac** | `backend/.env`, `frontend/.env` | Local development only — never commit these |

**Rule:** Secrets go in Railway/Vercel dashboards or local `.env` files — **never** in GitHub.

---

## 📁 Production deployment (Railway + Vercel)

Deploy **backend** and **frontend** separately. Do steps in this order.

### Prerequisites

- GitHub repo pushed (this repo)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster — database name **`intervuex`**
- New secrets (do not reuse dev defaults): run 3×  
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`  
  for `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `ENCRYPTION_KEY` (32 chars)

### Step 1 — Backend on Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → select **Intervuex**
2. **Root directory:** `backend`
3. **Variables** (copy names from [`backend/.env.example`](backend/.env.example)):

| Variable | Production value |
|----------|------------------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string → `/intervuex` |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | New secrets from above |
| `ENCRYPTION_KEY` | 32 characters |
| `CLIENT_URL` | Your Vercel URL (set after Step 2) |
| `SMTP_*` | Optional — welcome & password-reset emails |

4. Deploy → test **`https://YOUR-API.railway.app/api/health`** → should return OK  
5. Atlas **Network Access** → allow Railway (or `0.0.0.0/0` temporarily)

### Step 2 — Frontend on Vercel

1. [vercel.com](https://vercel.com) → **Import** → **Intervuex**
2. **Root directory:** `frontend`
3. **Environment variable:**

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-API.railway.app/api` |

4. **Deploy** → copy URL, e.g. `https://intervuex.vercel.app`

### Step 3 — Connect backend ↔ frontend

1. Railway → **Variables** → set `CLIENT_URL` = your **exact** Vercel URL (no trailing slash)
2. Railway redeploys automatically
3. Open Vercel URL → **Sign In** → test Workspaces, Team, Schedule

### Step 4 — After go-live

- Update **Live demo** link at the top of this README
- Create your real admin on production (demo login is hidden on Vercel)
- Optional: SMTP for emails, Google OAuth for “Continue with Google”

### Local development

```bash
git clone https://github.com/Mahammad1500/Intervuex.git
cd Intervuex && npm run install:all
cp backend/.env.example backend/.env   # fill in values
cp frontend/.env.example frontend/.env
npm run dev
```

App → http://localhost:3000 · API → http://localhost:5000/api/health

**Never commit:** `backend/.env`, `frontend/.env` — secrets stay on your machine or in Railway/Vercel dashboards only.

### ✅ Current production status (your project)

| Check | Status |
|-------|--------|
| GitHub repo | [Mahammad1500/Intervuex](https://github.com/Mahammad1500/Intervuex) — fresh repo, **only your commits** |
| Vercel frontend | [intervuex-nine.vercel.app](https://intervuex-nine.vercel.app) — **Ready** (Production) |
| Railway backend | `/api/health` → **ok**, database **connected** |
| Reconnect Vercel/Railway? | **Not required** if site + health check work (see [Why the app still worked](#why-the-app-still-worked-after-you-recreated-github)) |

### What to do now (in order)

1. **GitHub** — Open repo in Incognito → Contributors should show **only you** (no `cursoragent`).
2. **Production login** — Go to [intervuex-nine.vercel.app](https://intervuex-nine.vercel.app) → sign in with **your admin email** (`mahammadhussain1500@gmail.com`).
3. **Smoke test** — Click **Workspaces**, **Team**, **Schedule** (create one test interview), **Pipeline** — confirm pages load and data saves.
4. **Optional: verify auto-deploy** — Make a tiny change (e.g. edit README), push from Terminal, watch Vercel **Deployments** for a new build within ~2 minutes.
5. **Future commits** — Always use Terminal (`git commit` / `git push`), not Cursor’s Commit button. Keep **Commit Attribution OFF** in Cursor settings.

**We have not run a full manual test checklist yet** — step 3 above is the first real end-to-end test of features on production.

---

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for modern hiring teams**

[⚡ Intervuex](https://github.com/Mahammad1500/Intervuex) · Schedule smarter. Hire faster.

</div>
