# Emails, cron, and how automation works in Intervuex

This document explains **what sends email**, **when**, **which env vars matter**, and **where the code lives** — so you can operate and extend the system safely.

## Stack overview

| Layer | Technology |
|-------|------------|
| Outbound email | **Nodemailer** with SMTP (configured via env) |
| Scheduler | **node-cron** in `backend/server.js` (runs every 15 minutes) |
| In-app notifications | `Notification` MongoDB model + `createNotification` when events happen |
| Google Meet + Calendar | **Google Calendar API** (`googleapis`); event insert with `conferenceData` for Meet; tokens in `CalendarToken` (encrypted) |

**There is no separate “email API key”** beyond your SMTP or provider. Google Meet uses **OAuth2** (client id/secret in env + user tokens in DB), not a single static “Meet API key.”

---

## Environment variables (email and Google)

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP login. Without these, the backend **logs** `[EMAIL SKIPPED]` and does not send (useful in dev). |
| `EMAIL_FROM` | “From” header, e.g. `Intervuex <noreply@...>` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Google OAuth for Calendar. Redirect must match the route you expose (e.g. `https://api.example.com/api/calendar/google/callback`). |
| `ENCRYPTION_KEY` | AES helper for storing OAuth `accessToken` in `CalendarToken` — not for SMTP. |

**Microsoft/Zoom** env vars in `.env.example` are for other integrations; they follow a similar “OAuth or server credentials” model.

---

## When emails are sent

### 1. Interview scheduled (immediate)

- **Trigger**: Successful `POST /api/interviews` (HR or admin) after a row is created in MongoDB.
- **Code path**: `interviewController.scheduleInterview` → `notifyInterviewScheduled` in `services/notificationService.js`.
- **Who gets email**:
  - **Candidate** — template from `interviewScheduledCandidate` in `utils/emailTemplates.js`.
  - **Interviewer** — `interviewScheduledInterviewer`.
- **Optional organizer copy**: If the scheduling user (HR) has **`preferences.notifications.emailCopyToOrganizer`** not `false` and **`email`** not `false`, a **short third email** is sent to the organiser’s account email. Toggle this in **Settings → Notifications** (it saves to the user’s `preferences` in MongoDB).
- **In-app**: A `Notification` document is also created for `scheduledBy`.

**Google Meet path**: If `meetingPlatform` is `google-meet`, the backend calls `meetingGenerationService.generateMeetingLink` which uses the **connecting user’s** stored Google token and creates a Calendar event with a **Meet conference**. The Meet URL is what gets stored on the interview and embedded in the templates.

### 2. Interview cancelled

- **Trigger**: `PATCH /api/interviews/:id/cancel`.
- **Emails**: Candidate and interviewer; templates from `interviewCancelled`.

### 3. Interview rescheduled

- **Trigger**: `POST /api/interviews/:id/reschedule` (creates a new `Interview` and marks the old as `rescheduled`).
- **Emails**: `notifyInterviewRescheduled` to candidate and interviewer.

### 4. Reminder emails (24h, 1h, 15m)

- **Trigger**: Cron in `server.js` → `sendScheduledReminders` in `notificationService.js` **every 15 minutes**. It looks for `Interview` documents with:
  - `status` in `scheduled` / `confirmed`, future `scheduledAt`, and
  - `reminders` subdocs with `sent: false` **and** a **time window** around “now” for that reminder’s offset.
- **Who gets them**: Same template `interviewReminder` to **candidate and interviewer** (the interview record holds both addresses).
- **User preferences**: When an interview is **created**, the `reminders` array is built from the scheduler’s `preferences.notifications` (`reminder24h`, `reminder1h`, `reminder15`). Toggling preferences later does **not** change rows already on old interviews; it affects **new** interviews only.
- **Your toggles in Settings** for 24h/1h/15m are stored on the user and read at **schedule** time, not in the reminder sender per recipient.

### 5. User invited by admin (welcome email)

- **Trigger**: `POST /api/users` (admin) creating a user.
- **Code**: `userController.createUser` can call `sendEmail` with `welcomeEmail` and a **temporary** password. Treat this as sensitive: force password change on first login in a future hardening if needed.

### 6. In-app only (no SMTP)

- In-app `Notification` entries are created in several flows; they are **separate** from email. The UI Topbar can read from `/api/notifications` (see routes).

---

## Techniques used (concepts)

1. **Transactional email via SMTP** — Nodemailer; production often switches to a dedicated provider (SendGrid, SES, etc.) with the same env pattern.
2. **OAuth2 for Google** — Short-lived `accessToken` and refresh; we encrypt tokens at rest with `ENCRYPTION_KEY` (see `tokenEncryption` utils and `CalendarToken` model).
3. **Idempotent-ish reminders** — `reminder.sent` flags prevent double-sending once the time window is processed.
4. **Cron** — Fires on a wall-clock schedule; 15 min granularity means 1h/15m reminders are approximate to the cron tick (± window in code via `addMinutes`/`subMinutes` in `date-fns`).

---

## Operational notes

- **“Validation failed” on schedule** in dev was often an **invalid `scheduledAt` format**; the app now sends ISO strings from the wizard and looser server validation. Always send **JSON ISO8601** to the API.
- If Meet links fail, check: Calendar API enabled, OAuth consent, **Meet** available for the Google workspace, and that the **User → Settings** Google connection finished successfully.
- For security, **never** disable TLS for SMTP in production, and do not commit `.env`.

---

*Refer to this file and `POST_DEPLOYMENT_CHECKLIST.md` when onboarding a new engineer to production support.*
