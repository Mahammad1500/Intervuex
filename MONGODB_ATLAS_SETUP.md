# MongoDB Atlas (cloud) for deployment

This checklist is for **production** or any hosted environment where the app will not use a local `mongod` process.

## 1. Create a cluster

1. Sign in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Create a project** (e.g. `intervuex-prod`) if you do not have one.
3. **Build a cluster** — a **free M0** tier is enough to start. Pick a **region** close to your app servers (e.g. Mumbai or Frankfurt if your API runs in India/EU).
4. Wait until the cluster shows **Idle** (green).

## 2. Database user

1. **Database Access** → **Add New Database User**.
2. Choose **Password** authentication, generate a strong password, and **save it in a password manager** (not in the repo).
3. User privileges: **Read and write to any database** is fine for a single app user, or create a custom role with least privilege if your org requires it.

**URL-encoding:** if the password contains special characters like `@`, `#`, `%`, or `&`, you must [percent-encode](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding) them in the connection string, or the URI will be parsed incorrectly.

## 3. Network access

1. **Network Access** → **Add IP Address**.
2. For a **fixed** API server (VPS, Railway, etc.), add that server’s **outbound** IP, or a small CIDR you control.
3. For **local development** from your laptop, use **“Add current IP”** (or `0.0.0.0/0` only for quick tests — it allows the world; tighten before production if possible).

The backend must be able to open **outbound TCP** to the Atlas host on the **SRV** port (typically **27017** after DNS resolution on `mongodb+srv://`).

## 4. Connection string

1. **Database** → **Connect** → **Connect your application**.
2. Copy the **SRV** string, e.g.  
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/`
3. Set the **database name** in the path (e.g. `/intervuex`) and keep recommended query params, for example:

   ```text
   mongodb+srv://USER:ENCODED_PASSWORD@cluster0.xxxxx.mongodb.net/intervuex?retryWrites=true&w=majority
   ```

4. In **`backend/.env`** (not committed to git):

   ```bash
   MONGODB_URI=mongodb+srv://...
   ```

5. **Restart the backend** after any change to `MONGODB_URI`.

## 5. Verify

- **Compass** or **`mongosh`**: connect with the same URI; list databases and confirm `intervuex` appears after the app has run migrations/seed.
- **Health**: your backend’s health or a simple API call that reads from DB should succeed when `MONGODB_URI` is correct and network rules allow the host.

## 6. What to send when asking for help (redacted)

If something fails, you can share (with secrets removed):

- Region + cluster type (M0, etc.)
- Error message (full text, no password)
- Whether the app host IP is in **Network Access** (and whether you use SRV)
- The **first and last 4 characters** of the hostname only (not the user/password), e.g. `clus…xxxx`

Never paste a full connection string with password into chat, tickets, or a public Git repository.
