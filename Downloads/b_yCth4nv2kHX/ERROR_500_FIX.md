# HTTP 500 Error - Charities API Fix

## Error
```
[browser] [v0] Failed to fetch charities: Error: HTTP error! status: 500
```

## What It Means
The charities API endpoint (`/api/charities`) is throwing a 500 error, which means:
- ❌ Server error, not client error
- ❌ Database connection failed OR
- ❌ Missing environment variable OR
- ❌ Database table doesn't exist

## Root Cause: Missing SUPABASE_SERVICE_ROLE_KEY

The charities API uses `getSupabaseAdmin()` which requires:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

This is a **private key** that gives admin access to your Supabase database.

## Fix (3 Steps)

### Step 1: Get Your Service Role Key
1. Go to https://supabase.com → Your Project
2. Click **Settings** (bottom left)
3. Click **API** (left menu)
4. Find **Service Role Key** section
5. Click "Copy" button to copy the key

**⚠️ This key is SECRET - never share or commit to GitHub**

### Step 2: Add to Environment Variables

**Option A: Local Development (.env.local)**
```
SUPABASE_SERVICE_ROLE_KEY=your-copied-key-here
```

**Option B: v0 Preview**
1. Click **Settings** (top right)
2. Click **Vars** tab
3. Click **+ Add Variable**
4. Key: `SUPABASE_SERVICE_ROLE_KEY`
5. Value: Paste your copied key
6. Click **Save**

**Option C: Vercel (after deploying)**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add `SUPABASE_SERVICE_ROLE_KEY` with your key
5. Click **Save**
6. Redeploy

### Step 3: Restart & Test
1. Refresh browser (F5 or Ctrl+F5)
2. Go to `/signup`
3. Should now see "Loading charities..."
4. Then see 5 charities in dropdown

## All Required Environment Variables

You need these 3 Supabase keys to work:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

How to get each:
1. Go to Supabase → Your Project
2. Click Settings → API
3. Copy the 3 keys shown

## Still Getting 500 Error?

### Check 1: Key is Correct
- Open Supabase dashboard
- Copy Service Role Key again
- Make sure no extra spaces
- Make sure you're not mixing keys

### Check 2: Other Possible Causes
Run this test:

**Option A: Direct API Test**
1. Open browser console (F12)
2. Run:
```javascript
fetch('/api/charities')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e))
```
3. Check response for detailed error

**Option B: Check Database**
1. Go to Supabase dashboard
2. Click **SQL Editor**
3. Run: `SELECT COUNT(*) FROM charities;`
4. If error → table doesn't exist
5. If 0 → charities table is empty (run initialization SQL)

### Check 3: Full Error Details
Updated error handling now shows:
- `error` - What failed
- `details` - Why it failed
- `message` - How to fix it

Check browser console for full error.

## Complete Setup Checklist

- [ ] Supabase project created
- [ ] Database tables initialized (ran SQL schema)
- [ ] All 3 Supabase keys copied
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in vars
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in vars
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in vars ← **This fixes 500 error**
- [ ] Browser refreshed after setting variables
- [ ] Charities seeded in database (5 default charities)

## If Using Vercel Preview

The v0 preview has Settings → Vars where you can set these.

Example:
```
NEXT_PUBLIC_SUPABASE_URL | https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY | eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY | eyJhbGc...
```

## Next: Test Everything

After fixing the 500 error:

1. ✅ Visit `/signup`
2. ✅ See "Loading charities..."
3. ✅ See 5 charities in dropdown
4. ✅ Select a charity
5. ✅ Fill email/password
6. ✅ Click "Create Account"
7. ✅ Should redirect to signin

If any step fails, check the browser console (F12) for specific error messages.

## Documentation References
- Full env var setup: `ENVIRONMENT_VARIABLES.md`
- All fixes applied: `CHARITY_FIX_SUMMARY.md`
- Database setup: `DATABASE_SETUP.md`
- Immediate actions: `IMMEDIATE_ACTIONS.md`
