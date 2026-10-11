# Why Charities Aren't Showing - And How to Fix It

## The Problem
```
Error: Could not find the table 'public.charities' in the schema cache
```

The charities table doesn't exist because **the SQL schema hasn't been executed yet**.

---

## The Solution (5 Minutes)

### What You Need to Do

The app now shows you a message on the signup page:

```
Database Not Initialized

The charities table hasn't been created yet. Please follow these steps:

1. Go to https://supabase.com
2. Select your project
3. Go to SQL Editor (left sidebar)
4. Click New Query
5. Open /scripts/supabase-init.sql
6. Copy ALL the SQL code
7. Paste into Supabase SQL Editor
8. Click Run
9. Refresh this page
```

### QUICK STEPS

**Location**: https://supabase.com/dashboard

1. **Open SQL Editor** → Left sidebar → SQL Editor
2. **New Query** → Top right button
3. **Copy SQL** → Open `/scripts/supabase-init.sql` in your editor
4. **Paste** → Into the Supabase SQL Editor blank area
5. **Run** → Click the Run button (or Ctrl+Enter)
6. **Wait** → 10-30 seconds for execution
7. **Refresh App** → F5 in your browser
8. **Check** → Charities dropdown should now show 5 options ✅

---

## What Happens After Running SQL

### Charities will automatically populate:
- ✅ The First Tee
- ✅ PGA Foundation
- ✅ Golf Channel Foundation
- ✅ The Genesis Foundation
- ✅ St. Jude Children's Research Hospital

### Tables created:
- users, charities, golf_scores, draws, draw_winners
- subscriptions, charity_allocations, draw_simulations, audit_log

### Features enabled:
- Row-Level Security policies
- Database indexes for performance
- Auto-enforcement of 5-score limit (FIFO)
- Audit logging for admin actions

---

## Verify It Worked

After running the SQL, check in Supabase:

1. Go to **Table Editor** (left sidebar)
2. Look for `charities` table
3. Click on it
4. Should show 5 rows with charity names ✅

---

## If It Still Doesn't Work

| Problem | Solution |
|---------|----------|
| Still seeing "Database Not Initialized" | Wait 30 seconds, refresh page (Ctrl+Shift+R), check Supabase status |
| "Permission denied" error | Make sure you OWN the Supabase project (you have admin access) |
| "Syntax error" in SQL | Copy SQL directly from `/scripts/supabase-init.sql`, don't edit it |
| Can see tables but no charities | Seed data should have run. Try creating charities manually in Table Editor |

---

## After Database is Ready

Once charities appear in the dropdown:

1. **Create an Account** → Sign up with your email
2. **Select a Charity** → Choose one from dropdown
3. **Sign In** → Use your credentials
4. **Make Yourself Admin** → 
   - Go to Supabase → Table Editor → users
   - Find your row
   - Change `role` column to `'admin'`
   - Save
5. **Access Admin Panel** → Visit `/admin`

---

## Time Estimate
- Running SQL: **2 minutes**
- Verification: **1 minute**
- Creating account & testing: **2 minutes**

**Total: ~5 minutes** ⏱️

---

**The app is working perfectly! You just need to initialize the database once.** After that, everything will function normally. 🚀
