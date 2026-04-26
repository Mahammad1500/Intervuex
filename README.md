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

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Automation Workflow](#-automation-workflow)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Folder Structure](#-folder-structure)
- [Role-Based Access Control](#-role-based-access-control)
- [API Overview](#-api-overview)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [Integration Setup](#-integration-setup)
- [Running the Project](#-running-the-project)
- [Screenshots](#-ui-sections--screenshots)

---

## 🧠 Overview

**Intervuex** is a production-ready, automated interview scheduling platform built on the **MERN stack**. It is designed for modern HR teams who need to eliminate the manual back-and-forth of scheduling technical and behavioral interviews.

HR teams simply enter:
- 📧 Candidate email
- 📧 Interviewer email
- 💼 Role being interviewed for
- 🎯 Interview type (Technical, Behavioral, System Design, HR, Final, Screening)
- ⏱ Duration

Intervuex then **automatically**:
1. Checks the interviewer's real-time calendar availability (Google Calendar / Outlook)
2. Detects scheduling conflicts before booking
3. Generates a real meeting link (Google Meet / Microsoft Teams / Zoom) via official OAuth APIs
4. Creates calendar events for all participants
5. Sends detailed confirmation emails with the meeting link, time, and instructions
6. Schedules automated reminder emails at 24 hours, 1 hour, and 15 minutes before the interview
7. Allows rescheduling and cancellation with automatic calendar updates and notifications

---

## ✨ Core Features

### 🤖 Intelligent Scheduling Engine
- Real-time conflict detection against both Intervuex's own schedule database and the interviewer's connected calendar
- Suggests alternative time slots when conflicts are found
- Supports multiple timezones per user

### 📅 Calendar Integration
- **Google Calendar** — OAuth 2.0 integration for availability checking, event creation, and Google Meet link generation
- **Microsoft Outlook** — Microsoft Graph API integration for Teams meetings and Outlook calendar events
- Encrypted token storage with automatic refresh token rotation

### 🎥 Real Meeting Link Generation
- **Google Meet** — created via Google Calendar Events API with `conferenceDataVersion: 1`
- **Microsoft Teams** — created via `/me/onlineMeetings` endpoint on Microsoft Graph
- **Zoom** — created via Zoom Server-to-Server OAuth and Meetings API
- Automatic fallback chain if primary platform fails
- Never generates dummy or placeholder links

### 📧 Automated Notifications
- Beautiful HTML email templates for all lifecycle events (scheduled, confirmed, rescheduled, cancelled)
- Automated reminder emails via `node-cron` job (runs every 15 minutes)
- In-app notification center with unread badge

### 📊 Analytics Dashboard
- Interview trends chart (daily/weekly/monthly)
- Hiring funnel by interview type and status
- Interviewer performance table (completion rate, feedback rate)
- Feedback statistics with recommendation distribution

### 🔐 Role-Based Access Control
Four distinct roles with tailored permissions and UI:
| Role | Capabilities |
|------|-------------|
| **Admin** | Full access, user management, system analytics, all operations |
| **HR** | Schedule/cancel/reschedule interviews, view pipeline, analytics |
| **Interviewer** | View assigned interviews, connect calendar, submit feedback |
| **Candidate** | View own interviews, confirm attendance, reschedule (if allowed) |

### 🎨 Premium UI/UX
- Built with **React 18**, **Tailwind CSS 3**, **Framer Motion** animations, and **Radix UI** primitives
- Animated sidebar with collapse, smooth page transitions, micro-interactions throughout
- Interview pipeline board (Kanban-style)
- Full calendar view with daily interview details
- Fully responsive across desktop, tablet, and mobile

---

## 🔄 Automation Workflow

```
HR enters 5 fields
         │
         ▼
┌─────────────────────────────────┐
│  1. Resolve candidate & inter-  │
│     viewer by email from DB     │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  2. Conflict Detection          │
│  ├─ Check Intervuex DB for      │
│  │  overlapping interviews      │
│  └─ Query Google Calendar /     │
│     Outlook freebusy API        │
└────────────────┬────────────────┘
       conflict? │ no conflict
          │      ▼
          │  ┌─────────────────────────────────┐
          │  │  3. Generate Real Meeting Link  │
          │  │  ├─ Google Meet (Calendar API)  │
          │  │  ├─ Microsoft Teams (Graph API) │
          │  │  └─ Zoom (Server-to-Server OAuth)│
          │  └────────────────┬────────────────┘
          │                   │
          ▼                   ▼
   Suggest alt         ┌─────────────────────────────────┐
   time slots          │  4. Create Interview Record      │
                       │     in MongoDB with meeting link │
                       └────────────────┬────────────────┘
                                        │
                                        ▼
                       ┌─────────────────────────────────┐
                       │  5. Async Post-Scheduling Tasks │
                       │  ├─ Create Google Calendar event │
                       │  ├─ Create Outlook calendar event│
                       │  ├─ Send candidate email         │
                       │  ├─ Send interviewer email       │
                       │  └─ Create in-app notifications  │
                       └────────────────┬────────────────┘
                                        │
                                        ▼
                       ┌─────────────────────────────────┐
                       │  6. Schedule Reminders (cron)   │
                       │  ├─ 24h before: email both      │
                       │  ├─ 1h before: email both       │
                       │  └─ 15min before: email both     │
                       └─────────────────────────────────┘
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

## 👥 Role-Based Access Control

| Feature | Admin | HR | Interviewer | Candidate |
|---------|:-----:|:--:|:-----------:|:---------:|
| View own interviews | ✅ | ✅ | ✅ | ✅ |
| Schedule interview | ✅ | ✅ | ❌ | ❌ |
| Cancel interview | ✅ | ✅ | ❌ | ❌ |
| Reschedule interview | ✅ | ✅ | ❌ | ✅ |
| Confirm attendance | ❌ | ❌ | ❌ | ✅ |
| Submit feedback | ✅ | ❌ | ✅ | ❌ |
| View all interviews | ✅ | ✅* | ❌ | ❌ |
| User management | ✅ | ✅* | ❌ | ❌ |
| Analytics dashboard | ✅ | ✅ | ✅* | ❌ |
| Connect calendar | ✅ | ✅ | ✅ | ❌ |
| Toggle user status | ✅ | ❌ | ❌ | ❌ |

*Limited scope — HR sees only their scheduled interviews/users

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
| GET | `/api/interviews` | List interviews (filtered) |
| GET | `/api/interviews/upcoming` | Get upcoming interviews |
| GET | `/api/interviews/:id` | Get interview detail |
| PATCH | `/api/interviews/:id/cancel` | Cancel interview |
| POST | `/api/interviews/:id/reschedule` | Reschedule interview |
| PATCH | `/api/interviews/:id/confirm` | Candidate confirms attendance |

### Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar/google/auth-url` | Get Google OAuth URL |
| GET | `/api/calendar/google/callback` | Handle Google OAuth callback |
| GET | `/api/calendar/microsoft/auth-url` | Get Microsoft OAuth URL |
| GET | `/api/calendar/microsoft/callback` | Handle Microsoft OAuth callback |
| DELETE | `/api/calendar/disconnect/:provider` | Disconnect calendar |
| GET | `/api/calendar/availability` | Get available time slots |
| GET | `/api/calendar/status` | Get connection status |

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

## 🖥 UI Sections / Screenshots

### 🏠 Landing Page
Modern marketing page with hero section, feature cards, automation workflow preview, and CTA buttons.

### 📊 Dashboard
- Role-aware greeting and overview stats
- Interactive area chart showing 14-day interview activity
- Performance meters (completion rate, cancellation rate)
- Upcoming interviews list with real-time meeting join buttons

### 📅 Schedule Interview (4-Step Wizard)
1. **Details** — Candidate email, interviewer email, role, type, notes
2. **Schedule** — Date/time picker, duration, timezone, live slot checker
3. **Platform** — Google Meet / Teams / Zoom / Manual selector
4. **Review** — Full summary before confirming

### 📋 Interview Pipeline (Kanban Board)
Drag-and-inspect board with four columns: Scheduled → Confirmed → Completed → Cancelled

### 🗓 Calendar View
Monthly calendar with color-coded interview dots per day. Click any date to see the day's interviews with join links.

### 📈 Analytics
- Area chart (trends), Bar chart (by type), Pie chart (recommendations), Status breakdown
- Interviewer performance table with feedback rates

### 💬 Feedback Form
Star rating system for overall score + 5 criteria ratings, recommendation selector, strengths/improvements text areas.

### 👥 Team Management
User table with role counts, search/filter, toggle active/inactive, and create user modal.

### ⚙️ Settings
- Profile editor with timezone selection
- Calendar integration panel (Google + Microsoft connect/disconnect)
- Notification preferences toggles
- Password change form

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

## 🧪 Demo Accounts

Seed your database with these accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@intervuex.com` | `Admin@1234` |
| HR | `hr@intervuex.com` | `Hr@12345!` |
| Interviewer | `interviewer@intervuex.com` | `Interviewer@1` |
| Candidate | `candidate@intervuex.com` | `Candidate@1` |

---

## 📁 Extra markdown files in your clone

The repository tracks **`README.md`**, **`DATABASE_AND_LOCAL_SETUP.md`**, and **`MONGODB_ATLAS_SETUP.md`**. You may have other `*.md` files next to them on disk (e.g. personal notes, flow diagrams, debug guides) — they are not part of Git; keep them for yourself and they will not be pushed.

## 🤝 Contributing

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

[⚡ Intervuex](https://github.com/yourusername/intervuex) · Schedule smarter. Hire faster.

</div>
