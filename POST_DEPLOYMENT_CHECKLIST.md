# After deployment — what to change and verify

Use this as a runbook when you move Intervuex to staging or production. Keep secrets in your vault, not in this file.

## 1. Environment and URLs

| Item | What to do |
|------|------------|
| `CLIENT_URL` / frontend origin | Set to your real app URL (e.g. `https://app.yourdomain.com`). |
| `VITE_API_URL` (frontend) | Point to your API, e.g. `https://api.yourdomain.com/api`. Rebuild the frontend after changing. |
| `MONGODB_URI` | Use your production cluster (Atlas or self-hosted). See `DATABASE_AND_LOCAL_SETUP.md`. |
| `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY` | Use new long random values; never reuse dev defaults. |

## 2. Space codes, invites, and templates

- **Space codes** are 8 characters per company, stored in the database. After going live, **create or rotate codes** from **Admin → Workspaces** if you ever leak a code.
- **Message template** in **Settings → Workspace** uses your **current browser origin** in the “Ready-to-share link” (`/register?code=...`). If you use a custom domain, open Settings from that domain or replace the link text manually when you email HR.
- **“DEMO” / “DEMO2026”**-style labels in old docs: replace with your real company and codes in your internal runbooks only — the app does not hardcode those in production code paths, but you should **re-seed or import** the users you need (never commit real passwords).

## 3. Google, email, and OAuth

- **Google Calendar / Meet**: [Google Cloud Console](https://console.cloud.google.com/) — OAuth client **Authorized JavaScript origins** and **redirect URIs** must match your deployed API URL (e.g. `https://api.yourdomain.com/api/calendar/google/callback`). Same for Microsoft/Zoom if you use them.
- **SMTP (Gmail or provider)**: set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (or provider API keys). In production, **turn off** broad IP allow `0.0.0.0/0` on MongoDB; use a secret manager for SMTP and OAuth secrets.

## 4. CORS and security

- CORS is driven by `CLIENT_URL`. It must be the exact browser origin of your React app.
- Use HTTPS in production. Cookies (if you add any later) should be `Secure` / `SameSite` as appropriate.

## 5. Data and users

- Run your chosen **migrations/seed** on the new database (if any), or use **admin + HR** invite flows. See project `README` / `QUICK_START` for `POST /api/seed` only in **non-production**.

## 6. Health checks

- `GET /api/health` — should return 200.
- Log in as admin, open **Workspaces**, **Team**, and **Interviews** once; schedule a test interview in a test company; confirm an email in your inbox or logs (if SMTP is configured).

---

*Update this file with your own org-specific URLs, ticket links, and approval steps. Do not paste production secrets here.*
