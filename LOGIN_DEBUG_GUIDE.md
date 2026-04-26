# Login Debug Guide

## Current Status

✅ **Backend API**: Working perfectly
- Tested with curl - login successful
- Returns proper JWT tokens
- All demo accounts exist in database

✅ **Frontend Setup**: Configured correctly
- Vite proxy configured for `/api` → `http://localhost:5000`
- Environment variable `VITE_API_URL` set correctly
- Auth store implementation looks correct

❌ **Login Failing**: Frontend cannot login

## What I've Done

### 1. Verified Backend API (✅ Working)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@intervuex.com","password":"Admin@12345"}'
```
**Result**: Success! Returns user data and tokens.

### 2. Checked Demo Credentials (✅ Correct)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@intervuex.com | Admin@12345 |
| HR | hr@intervuex.com | Hr@123456 |
| Interviewer | interviewer@intervuex.com | Interview@1 |
| Candidate | candidate@intervuex.com | Candidate@1 |

### 3. Added Debug Logging (✅ Done)
Added console logs to `authStore.js` to track:
- When login function is called
- API request being made
- API response received
- Any errors that occur

## Next Steps - WHAT YOU NEED TO DO

### Step 1: Open Browser Console
1. **Refresh your browser** at http://localhost:3000
2. Press **F12** (or Cmd+Option+J on Mac) to open Developer Tools
3. Go to the **Console** tab

### Step 2: Try to Login
1. Click any demo account button (e.g., "Admin")
2. Watch the console for messages

### Step 3: Look for These Messages

**If login is working, you'll see:**
```
🔐 Auth Store: Starting login for admin@intervuex.com
📡 Auth Store: Making API call to /auth/login
📥 Auth Store: API response received
✅ Auth Store: Login successful, setting tokens
```

**If login is failing, you'll see:**
```
🔐 Auth Store: Starting login for admin@intervuex.com
📡 Auth Store: Making API call to /auth/login
❌ Auth Store: Login error
❌ Error response: [error details]
```

### Step 4: Tell Me What You See

**Copy and paste the console output** and send it to me. This will tell me exactly what's failing.

## Possible Issues & Solutions

### Issue 1: CORS Error
**Symptoms**: Console shows "CORS policy" error
**Solution**: Backend needs CORS configuration update

### Issue 2: Network Error
**Symptoms**: Console shows "Network Error" or "ERR_CONNECTION_REFUSED"
**Solution**: Backend server not running or wrong port

### Issue 3: 401 Unauthorized
**Symptoms**: Console shows 401 status code
**Solution**: Wrong credentials or password hashing issue

### Issue 4: Timeout
**Symptoms**: Request takes too long and fails
**Solution**: Backend server slow or hanging

## Quick Test Commands

### Test Backend is Running
```bash
curl http://localhost:5000/api/health
```
Should return: `{"status":"ok",...}`

### Test Frontend Proxy
```bash
curl http://localhost:3000/api/health
```
Should return: `{"status":"ok",...}` (same as above)

### Test Direct Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@intervuex.com","password":"Admin@12345"}'
```
Should return: `{"success":true,...}`

## What I Need From You

**Please do this:**
1. Refresh browser (http://localhost:3000)
2. Open Console (F12)
3. Click a demo account button
4. **Copy ALL the console messages** (including any red errors)
5. Send them to me

This will tell me exactly what's wrong and I can fix it immediately!

## Current Server Status

- **Backend**: Running on port 5000 ✅
- **Frontend**: Running on port 3000 ✅
- **Database**: In-memory MongoDB ✅
- **Demo Users**: Seeded ✅

Everything is ready - we just need to see what error the browser console shows!
