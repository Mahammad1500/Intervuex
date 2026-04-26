# ⚡ Intervuex — Complete System Flow & Architecture Reference

> This file is your single source of truth for understanding everything happening
> inside the Intervuex platform — how data moves, how each feature works end-to-end,
> and how all pieces connect.

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Directory Map & What Each File Does](#2-directory-map--what-each-file-does)
3. [Database Models & Relationships](#3-database-models--relationships)
4. [Authentication Flow](#4-authentication-flow)
5. [Interview Scheduling — Full Automation Flow](#5-interview-scheduling--full-automation-flow)
6. [Calendar Integration Flow](#6-calendar-integration-flow)
7. [Meeting Link Generation Flow](#7-meeting-link-generation-flow)
8. [Notification & Email Flow](#8-notification--email-flow)
9. [Role-Based Access Control (RBAC) Flow](#9-role-based-access-control-rbac-flow)
10. [Frontend Navigation & Page Flow](#10-frontend-navigation--page-flow)
11. [API Request Lifecycle](#11-api-request-lifecycle)
12. [State Management Flow (Frontend)](#12-state-management-flow-frontend)
13. [Cron Job Flow (Automated Reminders)](#13-cron-job-flow-automated-reminders)
14. [Analytics Data Flow](#14-analytics-data-flow)
15. [Feedback Lifecycle Flow](#15-feedback-lifecycle-flow)
16. [Error Handling Flow](#16-error-handling-flow)
17. [Security Layers](#17-security-layers)
18. [Environment Variables Reference](#18-environment-variables-reference)
19. [Running the Project](#19-running-the-project)

---

## 1. Project Overview

```
Intervuex is a MERN-stack SaaS platform that automates the full interview
scheduling pipeline for HR teams.

HR inputs 5 fields → System handles EVERYTHING:
  ✅ Real-time conflict detection (DB + Google/Outlook Calendar)
  ✅ Real meeting link generation (Google Meet / Teams / Zoom)
  ✅ Calendar event creation for all participants
  ✅ Confirmation emails to candidate + interviewer
  ✅ Automated reminder emails (24h, 1h, 15min before)
  ✅ Rescheduling & cancellation with calendar sync

Stack:
  Backend  → Node.js 18 + Express 4 + MongoDB 7 (Mongoose)
  Frontend → React 18 + Vite + Tailwind CSS + Framer Motion
  State    → Zustand (persisted)
  Auth     → JWT (access + refresh tokens)
  Email    → Nodemailer (SMTP)
  Scheduler→ node-cron
```

---

## 2. Directory Map & What Each File Does

```
intervuex/
│
├── package.json                    ← Root: concurrently scripts (npm run dev)
├── .gitignore
├── README.md                       ← Public documentation
├── SYSTEM_FLOW.md                  ← THIS FILE — internal architecture reference
│
├── backend/
│   ├── server.js                   ← Express app bootstrap
│   │                                  • Loads env, connects MongoDB
│   │                                  • Registers all middleware
│   │                                  • Mounts all routes at /api/*
│   │                                  • Starts cron job (reminders every 15min)
│   │                                  • Starts HTTP server on PORT 5000
│   │
│   ├── package.json                ← Backend dependencies
│   ├── .env                        ← Secret config (not in git)
│   ├── .env.example                ← Template for .env
│   │
│   └── src/
│       ├── config/
│       │   ├── database.js         ← Mongoose.connect() with retry logic
│       │   └── passport.js         ← JWT strategy + Google OAuth strategy
│       │
│       ├── models/                 ← MongoDB Schemas (Mongoose)
│       │   ├── User.js             ← users collection
│       │   │                          Fields: firstName, lastName, email,
│       │   │                          passwordHash, role (admin/hr/interviewer/
│       │   │                          candidate), department, jobTitle, phone,
│       │   │                          isActive, calendarConnected, preferences
│       │   │                          Methods: comparePassword(), toSafeObject()
│       │   │
│       │   ├── Interview.js        ← interviews collection
│       │   │                          Fields: title, role, interviewType,
│       │   │                          candidate (ref:User), interviewer (ref:User),
│       │   │                          scheduledBy (ref:User), scheduledAt, endTime,
│       │   │                          duration, timezone, status, meetingPlatform,
│       │   │                          meetingLink, meetingId, calendarEventId,
│       │   │                          candidateConfirmed, feedbackSubmitted,
│       │   │                          notes, reminders[], rescheduledFrom
│       │   │
│       │   ├── Feedback.js         ← feedbacks collection
│       │   │                          Fields: interview (ref), interviewer (ref),
│       │   │                          candidate (ref), overallRating (1-5),
│       │   │                          ratings{technical,communication,
│       │   │                          problemSolving,cultureFit,experience},
│       │   │                          recommendation (strong-hire → strong-no-hire),
│       │   │                          summary, strengths, areasOfImprovement,
│       │   │                          privateNotes
│       │   │
│       │   ├── CalendarToken.js    ← calendar_tokens collection
│       │   │                          Stores ENCRYPTED OAuth tokens for each user
│       │   │                          Fields: user (ref), provider (google/microsoft),
│       │   │                          accessToken (encrypted), refreshToken (encrypted),
│       │   │                          expiresAt, isValid
│       │   │
│       │   └── Notification.js     ← notifications collection
│       │                              Fields: recipient (ref:User), title, message,
│       │                              type, relatedInterview (ref), isRead, readAt
│       │
│       ├── controllers/            ← Route handlers (business logic)
│       │   ├── authController.js
│       │   │   • register()        → Hash pw → Create user → Issue JWT pair
│       │   │   • login()           → Verify credentials → Issue JWT pair
│       │   │   • refreshToken()    → Verify refresh → Issue new access token
│       │   │   • logout()          → Invalidate refresh token in DB
│       │   │   • getMe()           → Return current user from JWT
│       │   │   • updatePassword()  → Verify old pw → Hash new → Save
│       │   │
│       │   ├── interviewController.js
│       │   │   • scheduleInterview() → Resolve users by email → Check conflicts
│       │   │                           → Generate meeting → Create DB record
│       │   │                           → Create calendar events (async)
│       │   │                           → Send notification emails (async)
│       │   │   • getInterviews()   → Filtered/paginated list (role-scoped)
│       │   │   • getInterview()    → Single interview with all populated refs
│       │   │   • cancelInterview() → Update status → Delete calendar event
│       │   │                         → Notify participants
│       │   │   • rescheduleInterview() → New time → Conflict check →
│       │   │                             Update meeting/calendar → Notify
│       │   │   • confirmInterview()→ Candidate sets candidateConfirmed=true
│       │   │   • getUpcoming()     → Next 10 interviews for current user
│       │   │
│       │   ├── userController.js
│       │   │   • getUsers()        → Paginated/filtered list (admin/hr only)
│       │   │   • createUser()      → Create user + send welcome email
│       │   │   • getUser()         → Single user by ID
│       │   │   • updateUser()      → Update profile fields
│       │   │   • toggleUserStatus()→ Flip isActive flag
│       │   │   • getInterviewers() → All users with role=interviewer
│       │   │   • getCandidates()   → All users with role=candidate
│       │   │
│       │   ├── calendarController.js
│       │   │   • getGoogleAuthUrl()     → Build Google OAuth consent URL
│       │   │   • googleCallback()       → Exchange code → Encrypt & store tokens
│       │   │   • getMicrosoftAuthUrl()  → Build Microsoft OAuth consent URL
│       │   │   • microsoftCallback()    → Exchange code → Encrypt & store tokens
│       │   │   • disconnectCalendar()   → Delete CalendarToken from DB
│       │   │   • checkAvailability()    → Query Google/Outlook freebusy →
│       │   │                              Return available 30/60min slots
│       │   │   • getCalendarStatus()    → Which providers are connected
│       │   │
│       │   ├── analyticsController.js
│       │   │   • getDashboard()    → Overview stats + recent interviews
│       │   │   • getTrends()       → Daily/weekly grouped counts
│       │   │   • getFunnel()       → By status + by interview type counts
│       │   │   • getInterviewerPerformance() → Per-interviewer stats
│       │   │   • getFeedbackStats()→ Avg rating + recommendation distribution
│       │   │
│       │   └── feedbackController.js
│       │       • submitFeedback()  → Create Feedback → Mark interview.feedbackSubmitted
│       │       • getFeedback()     → Get feedback for interview (access-checked)
│       │       • getMyFeedback()   → All feedback submitted by current user
│       │       • updateFeedback()  → Update before interview.feedbackSubmitted locked
│       │
│       ├── middleware/             ← Applied per-route or globally
│       │   ├── auth.js
│       │   │   • authenticate      → Verify JWT Bearer → Attach req.user
│       │   │   • optionalAuth      → Attach req.user if token present
│       │   │   • generateTokens()  → Create access (7d) + refresh (30d) JWT pair
│       │   │
│       │   ├── roleCheck.js
│       │   │   • authorize(...roles) → Allow if req.user.role in allowed list
│       │   │   • ownerOrAdmin()      → Allow if user owns resource OR is admin
│       │   │
│       │   ├── rateLimiter.js
│       │   │   • generalLimiter    → 100 req/15min per IP (all /api routes)
│       │   │   • authLimiter       → 10 req/15min per IP (login/register)
│       │   │   • schedulingLimiter → 20 req/min per IP (POST /interviews)
│       │   │
│       │   ├── validation.js       ← express-validator chains per endpoint
│       │   │   • validateRegister, validateLogin, validateScheduleInterview,
│       │   │     validateFeedback, validateReschedule
│       │   │
│       │   └── errorHandler.js
│       │       • Global Express error handler (last middleware)
│       │       • Handles: Mongoose ValidationError, CastError, 11000 (duplicate),
│       │                  JWT errors, custom AppErrors → JSON { success, message, errors }
│       │
│       ├── routes/                 ← Express Router instances
│       │   ├── auth.js             POST /register /login /refresh-token /logout
│       │   │                       GET  /me   PATCH /update-password
│       │   ├── interviews.js       POST /   GET / /upcoming /:id
│       │   │                       PATCH /:id/cancel /:id/confirm
│       │   │                       POST /:id/reschedule
│       │   ├── users.js            GET / /interviewers /candidates /:id
│       │   │                       POST /   PUT /:id   PATCH /:id/toggle-status
│       │   ├── calendar.js         GET /google/auth-url /google/callback
│       │   │                           /microsoft/auth-url /microsoft/callback
│       │   │                           /availability /status
│       │   │                       DELETE /disconnect/:provider
│       │   ├── feedback.js         POST /interview/:id  GET /interview/:id /mine
│       │   │                       PUT /:id
│       │   ├── analytics.js        GET /dashboard /trends /funnel
│       │   │                           /interviewer-performance /feedback
│       │   ├── meetings.js         GET /zoom/callback (Zoom OAuth)
│       │   └── notifications.js    GET /   PATCH /:id/read /read-all
│       │                           DELETE /:id
│       │
│       ├── services/               ← Core business logic (called by controllers)
│       │   ├── schedulingEngine.js
│       │   │   • checkConflicts(interviewerId, start, end)
│       │   │     1. Query DB for overlapping Interview documents
│       │   │     2. Query interviewer's Google/Outlook calendar freebusy
│       │   │     3. Return { hasConflict, details }
│       │   │   • suggestAlternativeSlots(interviewerId, preferredStart, duration)
│       │   │     → Try next 5 days, 30min increments → return first 5 free slots
│       │   │   • findBestSlot(interviewerId, date, duration)
│       │   │     → Respect business hours (9am–5pm) + existing schedule
│       │   │
│       │   ├── calendarSyncService.js
│       │   │   • getGoogleClient(userId)   → Load+decrypt token → Build OAuth2 client
│       │   │                                  → Auto-refresh if expired
│       │   │   • getMicrosoftToken(userId) → Load+decrypt token → Refresh if needed
│       │   │   • createGoogleEvent(userId, eventData)  → calendar.events.insert()
│       │   │   • updateGoogleEvent(userId, eventId, updates)
│       │   │   • deleteGoogleEvent(userId, eventId)
│       │   │   • getGoogleFreeBusy(userId, start, end) → freebusy.query()
│       │   │   • createMicrosoftEvent(userId, eventData) → Graph /me/events
│       │   │   • deleteMicrosoftEvent(userId, eventId)
│       │   │   • getMicrosoftFreeBusy(userId, start, end) → Graph /me/calendarView
│       │   │
│       │   ├── meetingGenerationService.js
│       │   │   • generateMeetingLink(platform, meetingData)
│       │   │     → 'google-meet'      → createGoogleMeet()
│       │   │       Uses calendar.events.insert with conferenceDataVersion=1
│       │   │       Returns: { meetingLink, meetingId, platform }
│       │   │     → 'microsoft-teams'  → createTeamsMeeting()
│       │   │       POST /me/onlineMeetings via Microsoft Graph
│       │   │       Returns: { meetingLink, meetingId, platform }
│       │   │     → 'zoom'            → createZoomMeeting()
│       │   │       POST /v2/users/me/meetings via Zoom Server-to-Server OAuth
│       │   │       Returns: { meetingLink, meetingId, platform }
│       │   │     → 'manual'          → Returns placeholder link
│       │   │     Fallback chain: if primary fails → tries next platform
│       │   │
│       │   ├── notificationService.js
│       │   │   • sendEmail(to, subject, htmlBody)  → Nodemailer SMTP
│       │   │   • createInAppNotification(recipientId, data) → Insert Notification doc
│       │   │   • notifyInterviewScheduled(interview)
│       │   │     → Email candidate (template: scheduled)
│       │   │     → Email interviewer (template: scheduled)
│       │   │     → In-app notification for both
│       │   │   • notifyInterviewCancelled(interview, reason)
│       │   │   • notifyInterviewRescheduled(originalId, newInterview)
│       │   │   • sendReminder(interview, type) [type: '24h'|'1h'|'15min']
│       │   │   • sendScheduledReminders()  ← CALLED BY CRON EVERY 15MIN
│       │   │     → Find interviews where scheduled - now ∈ [14,25] min → send 15min
│       │   │     → Find interviews where scheduled - now ∈ [55,65] min → send 1h
│       │   │     → Find interviews where scheduled - now ∈ [23.5h,24.5h] → send 24h
│       │   │     → Mark reminder.sent=true to prevent duplicates
│       │   │
│       │   └── analyticsService.js
│       │       • getDashboardStats(userId, role)
│       │         → MongoDB aggregation: count by status, this month, upcoming
│       │         → completionRate = completed / (total - cancelled) * 100
│       │       • getInterviewTrends(userId, role, period, groupBy)
│       │         → $group by date → returns [{date, total, completed, cancelled}]
│       │       • getHiringFunnel(userId, role)
│       │         → byStatus[], byType[] using $group aggregation
│       │       • getInterviewerPerformance()
│       │         → Per interviewer: total, completed, cancelled, feedbackRate
│       │       • getFeedbackStats(userId, role)
│       │         → avgRating, totalFeedbacks, recommendations[]
│       │
│       └── utils/
│           ├── logger.js           ← Winston: console + logs/combined.log + logs/error.log
│           ├── tokenEncryption.js  ← AES encrypt/decrypt via CryptoJS
│           │                          Key = process.env.ENCRYPTION_KEY
│           ├── emailTemplates.js   ← HTML templates (inline CSS) for:
│           │                          scheduled, cancelled, rescheduled,
│           │                          reminder-24h, reminder-1h, reminder-15min, welcome
│           └── helpers.js          ← buildPaginationMeta(), calculateEndTime(),
│                                      generateUUID(), sanitizeUser(), CONSTANTS
│
└── frontend/
    ├── index.html                  ← Vite entry — loads Inter font, mounts #root
    ├── vite.config.js              ← Aliases (@/→src/), proxy /api→localhost:5000
    ├── tailwind.config.js          ← Custom colors (brand=indigo), shadows, fonts
    ├── postcss.config.js
    ├── package.json
    ├── .env                        ← VITE_API_URL
    │
    └── src/
        ├── main.jsx                ← ReactDOM.createRoot → BrowserRouter → <App/>
        ├── App.jsx                 ← All routes, ProtectedRoute, PublicRoute
        ├── index.css               ← CSS variables (HSL), Tailwind layers, scrollbar
        │
        ├── lib/utils.js            ← cn(), formatDate/Time/DateTime, getRelativeTime,
        │                              STATUS_CONFIG, INTERVIEW_TYPE_CONFIG, ROLE_CONFIG,
        │                              PLATFORM_CONFIG
        │
        ├── store/authStore.js      ← Zustand store (persisted to localStorage)
        │                              State: user, accessToken, refreshToken, isAuthenticated
        │                              Actions: login(), register(), logout(), refreshAccessToken()
        │                              On rehydrate: sets axios Authorization header
        │
        ├── services/api.js         ← Axios instance (baseURL=/api, timeout=30s)
        │                              Interceptor: on 401 → call refreshAccessToken() → retry
        │                              Modules: interviewsAPI, usersAPI, analyticsAPI,
        │                                       feedbackAPI, calendarAPI, notificationsAPI
        │
        ├── components/
        │   ├── layout/
        │   │   ├── AppLayout.jsx   ← Shell: <Sidebar> + <Topbar> + <Outlet> (with page transition)
        │   │   ├── Sidebar.jsx     ← Animated (framer-motion width 240↔72px)
        │   │   │                      Role-filtered nav items
        │   │   │                      User avatar + name at bottom
        │   │   └── Topbar.jsx      ← Schedule button (hr/admin), Bell (notifications dropdown),
        │   │                          User menu (profile/logout dropdown)
        │   ├── ui/
        │   │   ├── Button.jsx      ← variants: primary/secondary/ghost/danger/outline
        │   │   │                      sizes: sm/md/lg/xl/icon  + loading spinner
        │   │   ├── Card.jsx        ← Card, CardHeader, CardContent, CardTitle, StatCard
        │   │   ├── Badge.jsx       ← Badge, StatusBadge, InterviewTypeBadge, RoleBadge
        │   │   ├── Input.jsx       ← Input, Select, Textarea (all with label+error+hint)
        │   │   ├── Modal.jsx       ← Animated backdrop + dialog (sizes: sm/md/lg/xl)
        │   │   └── Toaster.jsx     ← Zustand toast store + animated toast stack
        │   │                          API: toast.success/error/warning/info(message, title)
        │   └── common/
        │       └── LoadingScreen.jsx ← Full-screen branded loading with pulsing dots
        │
        └── pages/
            ├── Landing.jsx         ← Public marketing: hero, features, steps, stats, CTA
            ├── Login.jsx           ← Email+password form, demo account quick-fill, split layout
            ├── Register.jsx        ← Name, email, role selector, password with requirements
            ├── Dashboard.jsx       ← Greeting, stat cards, area chart, performance bars,
            │                          upcoming interviews list, recent activity
            ├── ScheduleInterview.jsx ← 4-step wizard:
            │                          Step 1: Candidate email, interviewer email, role, type, notes
            │                          Step 2: Date/time, duration, timezone, availability checker
            │                          Step 3: Platform selector (Meet/Teams/Zoom/Manual)
            │                          Step 4: Full summary → Submit → POST /api/interviews
            ├── Interviews.jsx      ← Filterable table: status/type/search filters, cancel action
            ├── InterviewDetail.jsx ← Full detail: meeting link, participants, actions
            │                          (confirm/cancel/reschedule/submit feedback/join)
            ├── Pipeline.jsx        ← Kanban: 4 columns (Scheduled/Confirmed/Completed/Cancelled)
            ├── CalendarView.jsx    ← Monthly grid: dot indicators, day-detail sidebar
            ├── Analytics.jsx       ← Area chart, bar chart, pie chart, status bars, table
            ├── Feedback.jsx        ← Star rating form, criteria ratings, recommendations
            ├── Users.jsx           ← User table, role count cards, create user modal
            ├── Settings.jsx        ← Tabs: Profile / Calendar Integration / Notifications / Security
            └── NotFound.jsx        ← 404 with back + home buttons
```

---

## 3. Database Models & Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                         MONGODB COLLECTIONS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  users                                                            │
│  ├── _id, email (unique), passwordHash                           │
│  ├── firstName, lastName, phone, department, jobTitle            │
│  ├── role: 'admin' | 'hr' | 'interviewer' | 'candidate'         │
│  ├── isActive: Boolean                                           │
│  ├── calendarConnected: { google: Boolean, microsoft: Boolean }  │
│  ├── preferences: { timezone, emailNotifications, ... }          │
│  └── refreshToken (hashed, for logout invalidation)              │
│                                                                   │
│  interviews                                                       │
│  ├── _id, title, role, interviewType                             │
│  ├── candidate    ──────────────────→ users._id                  │
│  ├── interviewer  ──────────────────→ users._id                  │
│  ├── scheduledBy  ──────────────────→ users._id                  │
│  ├── rescheduledFrom ───────────────→ interviews._id (self-ref)  │
│  ├── scheduledAt (Date), endTime (Date), duration (Number mins)  │
│  ├── timezone, status, meetingPlatform                           │
│  ├── meetingLink (URL), meetingId (platform meeting ID)          │
│  ├── calendarEventId (Google/Outlook event ID for updates)       │
│  ├── candidateConfirmed: Boolean                                 │
│  ├── feedbackSubmitted: Boolean                                  │
│  ├── notes (String)                                              │
│  └── reminders: [{ type, sentAt, sent: Boolean }]               │
│                                                                   │
│  feedbacks                                                        │
│  ├── _id                                                         │
│  ├── interview ──────────────────────→ interviews._id            │
│  ├── interviewer ────────────────────→ users._id                 │
│  ├── candidate ──────────────────────→ users._id                 │
│  ├── overallRating (1–5)                                         │
│  ├── ratings: { technicalSkills, communication, problemSolving,  │
│  │             cultureFit, experience } (each 1–5)               │
│  ├── recommendation: 'strong-hire'|'hire'|'neutral'|             │
│  │                   'no-hire'|'strong-no-hire'                  │
│  ├── summary, strengths, areasOfImprovement, privateNotes        │
│  └── (unique index: interview + interviewer)                     │
│                                                                   │
│  calendar_tokens                                                  │
│  ├── _id                                                         │
│  ├── user ───────────────────────────→ users._id                 │
│  ├── provider: 'google' | 'microsoft'                            │
│  ├── accessToken  (AES encrypted string)                         │
│  ├── refreshToken (AES encrypted string)                         │
│  ├── expiresAt (Date), isValid: Boolean                          │
│  └── (unique index: user + provider)                             │
│                                                                   │
│  notifications                                                    │
│  ├── _id                                                         │
│  ├── recipient ─────────────────────→ users._id                  │
│  ├── title, message (String)                                     │
│  ├── type: 'interview_scheduled'|'interview_cancelled'|...       │
│  ├── relatedInterview ──────────────→ interviews._id             │
│  ├── isRead: Boolean, readAt: Date                               │
│  └── (TTL index: auto-delete after 30 days)                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Relationships Summary:
  Interview → 3 Users (candidate, interviewer, scheduledBy)
  Interview → Self (rescheduledFrom chain)
  Feedback  → Interview + 2 Users
  CalendarToken → User (max 2 per user: google + microsoft)
  Notification → User + Interview
```

---

## 4. Authentication Flow

```
REGISTER
────────
Client POST /api/auth/register
  { firstName, lastName, email, password, role }
        │
        ▼
  validation.js validateRegister()
  ├── email format check
  ├── password strength (8+ chars, uppercase, number)
  └── role must be candidate|interviewer (HR creates admin/hr accounts)
        │
        ▼
  authController.register()
  ├── Check: User.findOne({ email }) → 409 if exists
  ├── Hash: bcrypt.hash(password, 12) → passwordHash
  ├── Create: User.create({ ...data, passwordHash })
  ├── generateTokens(user) → { accessToken (7d JWT), refreshToken (30d JWT) }
  ├── Store: user.refreshToken = hash(refreshToken); user.save()
  └── Response: 201 { user, accessToken, refreshToken }
        │
        ▼
  Client stores in Zustand (persisted to localStorage)
  Client sets axios header: Authorization: Bearer <accessToken>

─────────────────────────────────────────────────────

LOGIN
─────
Client POST /api/auth/login { email, password }
        │
        ▼
  authController.login()
  ├── User.findOne({ email }) → 401 if not found
  ├── user.comparePassword(password) → 401 if wrong
  ├── Check: user.isActive → 403 if deactivated
  ├── generateTokens(user)
  └── Response: 200 { user, accessToken, refreshToken }

─────────────────────────────────────────────────────

TOKEN REFRESH (auto, via axios interceptor)
────────────────────────────────────────────
Any API call returns 401
        │
        ▼
  api.js interceptor catches it
  ├── Sets original._retry = true (prevents infinite loop)
  ├── Calls authStore.refreshAccessToken()
  │   └── POST /api/auth/refresh-token { refreshToken }
  │       → Verify JWT → Verify hash matches DB → Issue new pair
  └── If success → retries original request with new token
      If fail → calls logout() → clears localStorage → /login

─────────────────────────────────────────────────────

EVERY PROTECTED REQUEST
────────────────────────
Request header: Authorization: Bearer <accessToken>
        │
        ▼
  middleware/auth.js authenticate()
  ├── passport.authenticate('jwt')
  ├── Verifies signature + expiry
  ├── Loads req.user from DB (full User doc)
  └── next() → controller runs
```

---

## 5. Interview Scheduling — Full Automation Flow

```
HR fills 4-step wizard in ScheduleInterview.jsx
  Step 1: candidateEmail, interviewerEmail, role, interviewType, notes
  Step 2: scheduledAt (datetime), duration (mins), timezone
  Step 3: meetingPlatform (google-meet / microsoft-teams / zoom / manual)
  Step 4: Review → Submit

POST /api/interviews  (Body: all above fields)
        │
        ▼ [middleware chain]
  authenticate → authorize('admin','hr') → schedulingLimiter → validateScheduleInterview
        │
        ▼ interviewController.scheduleInterview()
        │
        ├─ 1. RESOLVE USERS
        │      candidate  = User.findOne({ email: candidateEmail, role: 'candidate' })
        │      interviewer = User.findOne({ email: interviewerEmail, role: 'interviewer' })
        │      → 404 if either not found
        │
        ├─ 2. CONFLICT DETECTION
        │      endTime = scheduledAt + duration minutes
        │      schedulingEngine.checkConflicts(interviewer._id, startTime, endTime)
        │      │
        │      ├─ DB Check: Interview.find({
        │      │     interviewer: id,
        │      │     status: { $in: ['scheduled','confirmed'] },
        │      │     scheduledAt: { $lt: endTime },
        │      │     endTime: { $gt: startTime }
        │      │   })
        │      │   → hasConflict = true if any found
        │      │
        │      └─ Calendar Check (if calendar connected):
        │           calendarSyncService.getGoogleFreeBusy() or getMicrosoftFreeBusy()
        │           → Returns busy periods from external calendar
        │           → Check if [startTime, endTime] overlaps any busy period
        │
        │      IF CONFLICT → 409 {
        │          message: 'Interviewer has a conflict',
        │          suggestions: [ up to 5 alternative slots ]
        │        }
        │        → Frontend shows conflict warning + clickable alternative slots
        │
        ├─ 3. GENERATE MEETING LINK
        │      meetingGenerationService.generateMeetingLink(platform, {
        │        title, startTime, endTime, organizerId, attendees
        │      })
        │      → Returns { meetingLink (URL), meetingId, platform }
        │      → Falls back to next platform if primary fails
        │
        ├─ 4. CREATE DB RECORD
        │      Interview.create({
        │        role, interviewType, candidate, interviewer, scheduledBy,
        │        scheduledAt, endTime, duration, timezone, meetingPlatform,
        │        meetingLink, meetingId, status: 'scheduled', notes
        │      })
        │
        ├─ 5. ASYNC POST-SCHEDULING (non-blocking, runs in background)
        │      Promise.all([
        │        createCalendarEvent(interviewer._id, eventData),  // Google or Outlook
        │        createCalendarEvent(candidate._id, eventData),
        │        notifyInterviewScheduled(interview),               // emails + in-app
        │      ])
        │
        └─ 6. RESPONSE → 201 { interview (fully populated) }
               Frontend navigates to /interviews/:id

─────────────────────────────────────────────────────────────────

RESCHEDULE FLOW
───────────────
POST /api/interviews/:id/reschedule { scheduledAt, duration }
  → Same conflict check as above
  → Update Interview doc (new times, status='rescheduled', rescheduledFrom=oldId)
  → Update calendar events (delete old, create new)
  → notifyInterviewRescheduled() → emails to all parties

CANCEL FLOW
───────────
PATCH /api/interviews/:id/cancel { reason }
  → Interview.status = 'cancelled'
  → deleteCalendarEvent() for interviewer + candidate
  → notifyInterviewCancelled(interview, reason)

CONFIRM FLOW (Candidate only)
──────────────────────────────
PATCH /api/interviews/:id/confirm
  → Interview.candidateConfirmed = true
  → Interview.status = 'confirmed'
  → In-app notification to HR/scheduledBy
```

---

## 6. Calendar Integration Flow

```
CONNECT GOOGLE CALENDAR
────────────────────────
User clicks "Connect Google Calendar" in Settings
        │
        ▼
GET /api/calendar/google/auth-url
  → calendarSyncService builds OAuth2 URL with scopes:
    calendar.events, calendar.readonly, userinfo.email
  → Returns { url: 'https://accounts.google.com/o/oauth2/auth?...' }
        │
        ▼
Browser redirects to Google consent screen
User approves → Google redirects to:
GET /api/calendar/google/callback?code=xxx
        │
        ▼
calendarController.googleCallback()
  ├── oauth2Client.getToken(code) → { access_token, refresh_token, expiry_date }
  ├── Encrypt tokens: tokenEncryption.encrypt(accessToken)
  ├── CalendarToken.findOneAndUpdate({ user, provider:'google' }, encrypted, upsert)
  ├── Update user.calendarConnected.google = true
  └── Redirect to: /settings?calendar=google&connected=true
        │
        ▼
Frontend Settings page detects query params → shows success toast

─────────────────────────────────────────────────────────────────

AVAILABILITY CHECK FLOW
────────────────────────
In ScheduleInterview Step 2, user clicks "Check Interviewer Availability"
        │
        ▼
GET /api/calendar/availability?interviewerId=xxx&date=ISO&duration=60
        │
        ▼
calendarController.checkAvailability()
  ├── Load CalendarToken for interviewer
  ├── Decrypt accessToken, refresh if expired
  ├── Query Google/Outlook freebusy for the day (8am–8pm)
  ├── Build list of busy intervals
  ├── Generate all possible slots (30min increments within business hours)
  ├── Filter out busy overlapping slots
  └── Return { slots: [{ start, end }, ...] }
        │
        ▼
Frontend displays clickable time buttons → user clicks → fills scheduledAt field
```

---

## 7. Meeting Link Generation Flow

```
meetingGenerationService.generateMeetingLink(platform, data)
        │
        ├─ platform = 'google-meet'
        │      ├── Load interviewer's Google OAuth client
        │      ├── calendar.events.insert({
        │      │     summary, start, end, attendees,
        │      │     conferenceData: { createRequest: { requestId: uuid } }
        │      │   }, conferenceDataVersion: 1)
        │      └── Extract: event.conferenceData.entryPoints[0].uri
        │          → "https://meet.google.com/xxx-xxxx-xxx"
        │
        ├─ platform = 'microsoft-teams'
        │      ├── Get Microsoft Graph access token for user
        │      ├── POST https://graph.microsoft.com/v1.0/me/onlineMeetings
        │      │     { subject, startDateTime, endDateTime, participants }
        │      └── Extract: meeting.joinWebUrl
        │          → "https://teams.microsoft.com/l/meetup-join/..."
        │
        ├─ platform = 'zoom'
        │      ├── Get Zoom Server-to-Server OAuth token
        │      │   POST https://zoom.us/oauth/token?grant_type=account_credentials
        │      ├── POST https://api.zoom.us/v2/users/me/meetings
        │      │     { topic, start_time, duration, type: 2 (scheduled) }
        │      └── Extract: meeting.join_url
        │          → "https://zoom.us/j/..."
        │
        └─ platform = 'manual'
               → Returns { meetingLink: null } (HR provides manually later)

FALLBACK CHAIN:
  If google-meet fails → tries microsoft-teams
  If microsoft-teams fails → tries zoom
  If zoom fails → returns manual placeholder
  Each failure is logged via Winston logger
```

---

## 8. Notification & Email Flow

```
EMAIL SYSTEM (Nodemailer)
──────────────────────────
notificationService.sendEmail(to, subject, htmlBody)
  └── Uses SMTP transport (Gmail/SendGrid/etc.)
      configured via SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

HTML TEMPLATES (emailTemplates.js)
  All templates use: inline CSS, Intervuex branding (indigo), responsive layout
  ├── scheduledTemplate(interview)  → "Your interview is scheduled"
  │     Sections: Interview details, Meeting link button, Calendar info
  ├── cancelledTemplate(interview, reason)
  ├── rescheduledTemplate(oldData, newInterview)
  ├── reminderTemplate(interview, type) [24h/1h/15min variants]
  └── welcomeTemplate(user)

WHEN EMAILS ARE SENT:
  Event                    │ Candidate email │ Interviewer email │ HR email
  ─────────────────────────┼─────────────────┼───────────────────┼──────────
  Interview scheduled      │ ✅               │ ✅                 │ —
  Interview confirmed      │ —               │ —                 │ ✅
  Interview cancelled      │ ✅               │ ✅                 │ —
  Interview rescheduled    │ ✅               │ ✅                 │ —
  24h reminder             │ ✅               │ ✅                 │ —
  1h reminder              │ ✅               │ ✅                 │ —
  15min reminder           │ ✅               │ ✅                 │ —
  User account created     │ ✅ (welcome)     │ —                 │ —

IN-APP NOTIFICATIONS
─────────────────────
  Created in Notification collection simultaneously with every email
  Topbar Bell icon shows unreadCount badge
  Dropdown shows last 8 notifications with relative timestamps
  "Mark all read" → PATCH /api/notifications/read-all
  Auto-deleted by MongoDB TTL index after 30 days
```

---

## 9. Role-Based Access Control (RBAC) Flow

```
ROLES:  admin > hr > interviewer > candidate

ROUTE PROTECTION CHAIN:
  Request
     │
     ▼
  authenticate  (verify JWT → get req.user)
     │
     ▼
  authorize('admin','hr')  (check req.user.role in allowed list)
     │                      → 403 Forbidden if role not allowed
     ▼
  Controller runs

WHAT EACH ROLE CAN ACCESS:
┌─────────────────────────────────────────────────────────┐
│  ADMIN                                                   │
│  • All routes                                            │
│  • All interviews (no filter)                            │
│  • Toggle user active/inactive                           │
│  • Create users with any role                            │
│  • Full analytics                                        │
├─────────────────────────────────────────────────────────┤
│  HR                                                      │
│  • Schedule/cancel/reschedule interviews                 │
│  • See interviews they scheduled (filter: scheduledBy)   │
│  • Create users (cannot create admin)                    │
│  • Analytics (own team scope)                            │
│  • Pipeline view                                         │
├─────────────────────────────────────────────────────────┤
│  INTERVIEWER                                             │
│  • See interviews where interviewer = self               │
│  • Connect Google/Outlook calendar                       │
│  • Submit and update feedback                            │
│  • View own analytics (feedback stats)                   │
├─────────────────────────────────────────────────────────┤
│  CANDIDATE                                               │
│  • See interviews where candidate = self                 │
│  • Confirm attendance                                    │
│  • Request reschedule                                    │
│  • Cannot see other candidates or analytics              │
└─────────────────────────────────────────────────────────┘

FRONTEND GUARDS:
  <ProtectedRoute>   → redirects to /login if not authenticated
  <ProtectedRoute roles={['admin','hr']}> → redirects to /dashboard if wrong role
  Sidebar nav items filtered by user.role
  Topbar "Schedule Interview" button hidden for interviewer/candidate
```

---

## 10. Frontend Navigation & Page Flow

```
PUBLIC ROUTES (redirect to /dashboard if already logged in)
  /           → Landing.jsx   (marketing page)
  /login      → Login.jsx
  /register   → Register.jsx

PROTECTED ROUTES (redirect to /login if not authenticated)
  /dashboard           → Dashboard.jsx
  /interviews          → Interviews.jsx
  /interviews/:id      → InterviewDetail.jsx
  /pipeline            → Pipeline.jsx      [admin, hr only]
  /calendar            → CalendarView.jsx
  /analytics           → Analytics.jsx     [admin, hr, interviewer]
  /feedback/:id        → Feedback.jsx
  /users               → Users.jsx         [admin, hr only]
  /schedule            → ScheduleInterview.jsx  [admin, hr only]
  /settings            → Settings.jsx
  *                    → NotFound.jsx

PAGE TRANSITIONS:
  Each route wrapped in Framer Motion:
    enter:  opacity 0→1, y 8→0 (300ms ease-out)
    exit:   opacity 1→0, y 0→-8
  Sidebar width animates: 240px (open) ↔ 72px (collapsed)

LAZY LOADING:
  All pages are lazy-loaded via React.lazy()
  Suspense fallback → <LoadingScreen /> (branded full-screen loader)
```

---

## 11. API Request Lifecycle

```
Frontend Component
       │ calls interviewsAPI.getAll(params)
       ▼
services/api.js (axios instance)
       │ baseURL = /api  (proxied to localhost:5000 in dev)
       │ headers: { Authorization: Bearer <token>, Content-Type: application/json }
       ▼
Vite Dev Proxy → http://localhost:5000/api/...
       ▼
Express server.js
       │ helmet (security headers)
       │ cors (allow localhost:3000)
       │ express.json() (parse body)
       │ morgan → winston logger
       │ generalLimiter (100/15min)
       ▼
Router (e.g., /api/interviews)
       │ authenticate middleware (JWT verify)
       │ authorize middleware (role check)
       │ rateLimiter (route-specific)
       │ validateRequest (express-validator)
       ▼
Controller function
       │ Business logic
       │ Service calls
       │ DB queries (Mongoose)
       ▼
Response: { success: true, data: {...} }  or  { success: false, message: '...' }
       │
       ▼
axios interceptor (response)
  → If 401 and !_retry: refresh token → retry
  → Otherwise: return response/reject error
       │
       ▼
Component receives data → updates state → re-renders UI
```

---

## 12. State Management Flow (Frontend)

```
ZUSTAND STORES:

1. authStore (persisted to localStorage key: 'intervuex-auth')
   ─────────────────────────────────────────────────────────
   State:
     user          Object | null   (full user document)
     accessToken   String | null
     refreshToken  String | null
     isAuthenticated Boolean
     isLoading     Boolean
     error         String | null

   Actions:
     login(email, password)  → POST /auth/login → set all state
     register(payload)       → POST /auth/register → set all state
     logout()                → POST /auth/logout → clear all state
     refreshAccessToken()    → POST /auth/refresh-token → update tokens
     updateUser(updates)     → merge into user object (for Settings save)
     setToken(accessToken)   → update header + state (e.g. after OAuth)
     clearError()

   Rehydration:
     When page refreshes, Zustand loads from localStorage
     onRehydrateStorage → sets axios Authorization header with stored token

2. useToastStore (not persisted, in-memory only)
   ──────────────────────────────────────────────
   State: toasts[]  { id, type, title, message, duration }
   add(toast) → push to array → auto-remove after duration (default 4s)
   remove(id) → filter out
   Used via: toast.success('msg') / toast.error('msg') etc.

DATA FETCHING:
  Pages use useState + useEffect + direct API calls (no global cache)
  This keeps the app simple — each page fetches its own data on mount
  Real-time: none (polling or WebSockets could be added later)
```

---

## 13. Cron Job Flow (Automated Reminders)

```
server.js starts cron: cron.schedule('*/15 * * * *', ...)
  → Runs every 15 minutes, 24/7

sendScheduledReminders() in notificationService.js:
        │
        ├─ QUERY 1: 15-minute reminders
        │    Interview.find({
        │      status: { $in: ['scheduled', 'confirmed'] },
        │      scheduledAt: {
        │        $gte: now + 14 minutes,
        │        $lte: now + 25 minutes
        │      },
        │      'reminders.type': '15min',
        │      'reminders.sent': false       ← prevent duplicate sends
        │    })
        │    → For each: sendReminder(interview, '15min')
        │    → Mark: reminders.$.sent = true
        │
        ├─ QUERY 2: 1-hour reminders (55–65 min window)
        │
        └─ QUERY 3: 24-hour reminders (23.5–24.5 hour window)

Each reminder:
  → sendEmail(candidate.email, '⏰ Interview in [X]', reminderTemplate)
  → sendEmail(interviewer.email, same)
  → createInAppNotification for both

Interview.reminders array (set on creation):
  [
    { type: '24h',   sent: false },
    { type: '1h',    sent: false },
    { type: '15min', sent: false }
  ]
  The sent:true flag ensures no duplicate reminder emails even if
  cron runs multiple times within the same window.
```

---

## 14. Analytics Data Flow

```
GET /api/analytics/dashboard
        │
        ▼
analyticsService.getDashboardStats(userId, role)
        │
        ├─ Scope filter (role-based):
        │    admin     → no filter (all interviews)
        │    hr        → { scheduledBy: userId }
        │    interviewer → { interviewer: userId }
        │    candidate  → { candidate: userId }
        │
        ├─ MongoDB Aggregation 1: Status counts
        │    Interview.aggregate([
        │      { $match: scope },
        │      { $group: { _id: '$status', count: { $sum: 1 } } }
        │    ])
        │    → { total, upcoming, completed, cancelled, ... }
        │
        ├─ completionRate = completed / (total - cancelled) * 100
        │
        ├─ thisMonth count (scheduledAt within current month)
        │
        └─ recentInterviews (last 5, sorted by createdAt desc)

GET /api/analytics/trends?period=30d&groupBy=day
        │
        ▼
analyticsService.getInterviewTrends(...)
  MongoDB aggregate:
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$scheduledAt' } },
      total: { $sum: 1 },
      completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
    }
  Returns: [{ date: '2024-01-15', total: 5, completed: 3, cancelled: 1 }, ...]

Frontend renders with Recharts AreaChart
```

---

## 15. Feedback Lifecycle Flow

```
Interview completes (status = 'completed')
        │
        ▼
Interviewer visits /feedback/:interviewId
  → Feedback.jsx loads interview details
  → Star rating UI (overall + 5 criteria)
  → Recommendation selector
  → Summary, strengths, areasOfImprovement, privateNotes

Submit:
  POST /api/feedback/interview/:id
  { overallRating, ratings, recommendation, summary, ... }
        │
        ▼
feedbackController.submitFeedback()
  ├── Verify: req.user.role === 'interviewer'
  ├── Verify: interview.interviewer === req.user._id
  ├── Verify: !interview.feedbackSubmitted (prevent duplicates)
  ├── Create Feedback document
  ├── Update Interview: feedbackSubmitted = true
  └── createInAppNotification for HR/scheduledBy

Viewing feedback:
  GET /api/feedback/interview/:id
  Access rules:
    interviewer who submitted → full access (including privateNotes)
    admin/hr → full access
    candidate → access (but privateNotes field is excluded)
    others → 403

Analytics:
  analyticsService.getFeedbackStats()
  → Average overallRating across all feedbacks (role-scoped)
  → Recommendation distribution: [{ _id:'strong-hire', count:3 }, ...]
```

---

## 16. Error Handling Flow

```
Any unhandled error in a controller → next(err)
        │
        ▼
errorHandler.js (last middleware in Express chain)
        │
        ├─ Mongoose ValidationError (code 11000 duplicate)
        │    → 409 { message: 'Email already exists.' }
        │
        ├─ Mongoose CastError (invalid ObjectId)
        │    → 400 { message: 'Invalid ID format.' }
        │
        ├─ Mongoose ValidationError (schema validation)
        │    → 400 { message: '...', errors: [{ field, message }] }
        │
        ├─ JsonWebTokenError / TokenExpiredError
        │    → 401 { message: 'Invalid token.' }
        │
        ├─ Custom createError(message, statusCode)
        │    → statusCode { message }
        │
        └─ Unknown Error
             DEV → 500 { message, stack }
             PROD → 500 { message: 'Internal server error.' }  (no stack leak)

Frontend:
  axios interceptor → passes rejected promise to calling code
  each API call wrapped in try/catch → toast.error(err.response?.data?.message)
  409 conflict in /interviews → shows conflict banner with slot suggestions
```

---

## 17. Security Layers

```
Layer 1: Transport
  helmet()          → Sets X-Frame-Options, X-XSS-Protection, HSTS, etc.
  cors()            → Only allows CLIENT_URL origin
  HTTPS             → Required in production (handled by hosting)

Layer 2: Authentication
  JWT access token  → HS256, 7-day expiry, verified on every request
  JWT refresh token → 30-day expiry, stored hashed in DB
  Logout            → Invalidates refresh token in DB

Layer 3: Authorization
  authorize() middleware on every sensitive route
  Role hierarchy enforced: admin > hr > interviewer > candidate
  Resource ownership checks (e.g., candidate can only see own interviews)

Layer 4: Input Validation
  express-validator on all POST/PUT/PATCH routes
  Validates: email format, password strength, date validity, enum values
  Sanitizes: trims strings, normalizes email to lowercase

Layer 5: Rate Limiting
  General:    100 requests per 15 minutes per IP
  Auth:       10 requests per 15 minutes per IP (brute-force protection)
  Scheduling: 20 requests per minute per IP

Layer 6: Data Security
  bcrypt(12) for password hashing (intentionally slow)
  AES encryption for OAuth tokens stored in DB (CryptoJS)
  Sensitive fields excluded from User.toObject() by default
  Private notes in feedback excluded from candidate view

Layer 7: MongoDB
  Mongoose schema validation (types, required, enums)
  Unique indexes on email, calendar_tokens(user+provider)
  Input sanitization via Mongoose (prevents NoSQL injection)
```

---

## 18. Environment Variables Reference

```
BACKEND (.env)
───────────────

# Server
NODE_ENV=development              Used by: errorHandler (stack in dev), morgan
PORT=5000                         Express listen port
CLIENT_URL=http://localhost:3000  CORS origin whitelist + OAuth redirect base

# MongoDB
MONGODB_URI=mongodb://localhost:27017/intervuex  Full connection string

# JWT
JWT_SECRET=<min 32 chars>           Signs access tokens
JWT_EXPIRES_IN=7d                   Access token lifetime
JWT_REFRESH_SECRET=<min 32 chars>   Signs refresh tokens  
JWT_REFRESH_EXPIRES_IN=30d          Refresh token lifetime

# Token Encryption
ENCRYPTION_KEY=<exactly 32 chars>   AES key for OAuth token encryption in DB

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=<gmail app password>      NOT your account password — use App Password
EMAIL_FROM="Intervuex <noreply@intervuex.com>"

# Google OAuth (for Calendar + Google Meet)
GOOGLE_CLIENT_ID=<from GCP Console>
GOOGLE_CLIENT_SECRET=<from GCP Console>
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/google/callback

# Microsoft OAuth (for Outlook + Teams)
MICROSOFT_CLIENT_ID=<from Azure App Registration>
MICROSOFT_CLIENT_SECRET=<from Azure App Registration>
MICROSOFT_TENANT_ID=common          or specific tenant ID
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/calendar/microsoft/callback

# Zoom (Server-to-Server OAuth)
ZOOM_CLIENT_ID=<from Zoom Marketplace>
ZOOM_CLIENT_SECRET=<from Zoom Marketplace>
ZOOM_ACCOUNT_ID=<from Zoom Marketplace>
ZOOM_REDIRECT_URI=http://localhost:5000/api/meetings/zoom/callback

FRONTEND (.env)
────────────────
VITE_API_URL=http://localhost:5000/api   Axios baseURL (or /api for proxy)
VITE_APP_NAME=Intervuex
```

---

## 19. Running the Project

```bash
# ─── ONE-TIME SETUP ─────────────────────────────────────────────

# 1. Install all dependencies (root + backend + frontend)
npm run install:all

# 2. Set up environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Edit backend/.env — REQUIRED fields:
#    - MONGODB_URI (local MongoDB or Atlas)
#    - JWT_SECRET, JWT_REFRESH_SECRET (random 32+ char strings)
#    - ENCRYPTION_KEY (exactly 32 chars)
#    - SMTP_* (for emails — optional for basic testing)
#    - GOOGLE_*, MICROSOFT_*, ZOOM_* (for calendar — optional)


# ─── DEVELOPMENT ────────────────────────────────────────────────

# Start BOTH servers simultaneously
npm run dev
# → Backend:  http://localhost:5000
# → Frontend: http://localhost:3000
# → Health:   http://localhost:5000/api/health

# Start ONLY backend
npm run dev:backend

# Start ONLY frontend  
npm run dev:frontend


# ─── WHAT HAPPENS ON START ──────────────────────────────────────

# Backend boot sequence:
#   1. dotenv loads .env
#   2. Express app created
#   3. Middleware registered (helmet, cors, json, morgan, passport)
#   4. Routes mounted at /api/*
#   5. MongoDB connection (with 30s retry)
#   6. cron job started (reminder check every 15min)
#   7. HTTP server starts on PORT 5000

# Frontend boot sequence:
#   1. Vite dev server starts on :3000
#   2. Proxy /api/* → http://localhost:5000
#   3. React mounts, BrowserRouter initializes
#   4. Zustand rehydrates from localStorage (auto-login if token valid)
#   5. App.jsx renders route matching current URL


# ─── PRODUCTION BUILD ───────────────────────────────────────────

npm run build         # Builds frontend to frontend/dist/
npm start             # Starts backend only (serves API)
# Note: In production, serve frontend/dist/ via Nginx or CDN
```

---

*Last updated: auto-generated by Intervuex project scaffold*
*For issues or questions, refer to README.md or the inline code comments.*
