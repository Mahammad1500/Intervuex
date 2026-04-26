# Database & local development

This document explains how Intervuex connects to MongoDB, how you can **inspect and manage data**, how to use **MongoDB Atlas** (cloud) with a connection string, and how **Space codes** work for HR workspaces.

---

## 1. How the app connects to MongoDB

- The backend reads **`MONGODB_URI`** from `backend/.env` (see `backend/.env.example`).
- Default local URI: `mongodb://127.0.0.1:27017/intervuex` (or `localhost`).
- If nothing is listening on that host/port, the dev server can start an **in-memory MongoDB** (via `mongodb-memory-server`) so you can run the app without installing MongoDB. In that mode, **data is not kept** after you stop the backend.
- For **persistent** data, use a local MongoDB install or **MongoDB Atlas** (see below).
- **Deploying with Atlas?** Use the step-by-step checklist in [`MONGODB_ATLAS_SETUP.md`](MONGODB_ATLAS_SETUP.md).

---

## 2. Viewing and editing your data

### Option A — MongoDB Compass (GUI, recommended)

1. Install [MongoDB Compass](https://www.mongodb.com/products/compass).
2. Open Compass and connect using the same string as `MONGODB_URI` in `backend/.env`.
3. Open the `intervuex` database (or the DB name in your URI path).
4. Browse **collections** such as `users`, `companies`, `interviews`, etc.

You can run filter queries, edit documents, and delete test data. **Do not** paste production connection strings into untrusted tools; use Compass from an official install.

### Option B — `mongosh` (shell)

With MongoDB running locally:

```bash
mongosh "mongodb://127.0.0.1:27017/intervuex"
```

Useful commands:

```javascript
show collections
db.users.find().limit(5)
db.companies.find({}, { name: 1, spaceCode: 1 })
```

### Option C — Atlas web UI

If you use Atlas, open your cluster → **Browse Collections** in the cloud console. No Compass required.

### What you need from me (the project owner)

You only need to provide a **`MONGODB_URI`** if you want a specific cloud or non-default local setup. Format:

```text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/intervuex?retryWrites=true&w=majority
```

Put that in `backend/.env` as `MONGODB_URI=...`, restart the backend, and the app will use that database.

**Security:** Never commit real URIs; keep them in `backend/.env` (already in `.gitignore`).

---

## 3. Creating a MongoDB Atlas (cloud) cluster

High-level steps:

1. Create a free account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Project** → **Build a cluster** (M0 free tier is fine for dev).
3. **Database Access** → add a user with a strong password (save it in a password manager).
4. **Network Access** → add your IP, or for quick testing only, `0.0.0.0/0` (less secure; tighten for production).
5. In the cluster view, click **Connect** → **Connect your application** and copy the **connection string**.
6. Replace `<password>` with your database user’s password, and set the database name in the path (e.g. `/intervuex`).
7. Paste the final URI into `backend/.env` as `MONGODB_URI=...`.
8. Restart the backend. Check logs for a successful MongoDB connection (e.g. host / “Connected” message).

**TLS:** `mongodb+srv://` uses TLS by default. The app’s driver handles this; do not turn off certificate validation in production.

---

## 4. In-memory vs real MongoDB (quick reference)

| Mode | When | Data persistence |
|------|------|------------------|
| In-memory (`mongodb-memory-server`) | No DB on `MONGODB_URI` | Lost when backend stops |
| Local `mongod` / Docker | `MONGODB_URI` points to local | Persists in local data files |
| Atlas / hosted | `MONGODB_URI` to cloud | Persists in the cluster |

After switching to a real database, re-run your seeding or invite flows as needed (e.g. `POST /api/seed` in development).

---

## 5. Space codes and HR workspaces

- Each **company** has a **Space code** (8 characters, letters A–Z and numbers 0–9).
- New **HR** users use this code on the **Register** page so they join the correct company.
- **HR** users can open **Settings → Workspace** to see the company name, Space code, **copy** buttons, a **ready-to-share registration link** (`/register?code=XXXXXXXX`), and an optional message template. Admins with a linked company see the same.
- **Platform admins** can create companies and set or change Space codes from the **Admin dashboard** → **Workspaces (companies)**.

Optional registration URL for invites:

```text
https://YOUR_APP_ORIGIN/register?code=XXXXXXXX
```

Replace `YOUR_APP_ORIGIN` with your frontend URL (e.g. `http://localhost:3000` in development).

---

## 6. Troubleshooting

| Symptom | What to check |
|--------|----------------|
| `ECONNREFUSED 127.0.0.1:27017` | Local MongoDB not running, or app will fall back to in-memory if configured. |
| Atlas “bad auth” / login failed | User/password in URI; special characters in password must be **URL-encoded**. |
| “IP not whitelisted” | Network Access in Atlas. |
| Empty data after restart | In-memory mode; set a real `MONGODB_URI` for persistence. |

---

## 7. If you need to share credentials with a teammate

Prefer:

1. A **single** `MONGODB_URI` in a secure channel (1Password, Vault, etc.), or  
2. **Separate Atlas users** per environment (dev/staging/prod) with least privilege.

Do **not** paste production URIs in public tickets or commit them to git.

---

*Last updated with the Intervuex workspace settings and admin company management features.*
