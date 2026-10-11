# Database Initialization - Complete Setup Guide

## Problem
You're seeing "Database Not Initialized" when trying to sign up because the charities table hasn't been created in Supabase yet.

**Error Message:**
```
Could not find the table 'public.charities' in the schema cache
```

## Solution: Run the SQL Schema (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com
2. Sign in to your account
3. Select your **Golf Charity Platform** project
4. Click **SQL Editor** in the left sidebar

### Step 2: Create New Query
1. Click **New Query** button (top right)
2. A blank SQL editor will open

### Step 3: Copy the SQL Schema
1. In your project folder, open: `/scripts/supabase-init.sql`
2. Select ALL the content (Ctrl+A or Cmd+A)
3. Copy it (Ctrl+C or Cmd+C)

### Step 4: Paste into Supabase
1. In the Supabase SQL Editor, click in the blank area
2. Paste the SQL (Ctrl+V or Cmd+V)
3. You should see the entire schema now

### Step 5: Execute the Schema
1. Click the **Run** button (or press Ctrl+Enter)
2. Wait 10-30 seconds for execution
3. You should see: "Success. No rows returned" at the bottom
4. Check the **Results** tab - if you see table creation logs, it worked!

### Step 6: Verify It Worked
1. Close the SQL Editor
2. Go to **Table Editor** in the left sidebar
3. You should see these tables:
   - `users`
   - `charities` ✅
   - `golf_scores`
   - `draws`
   - `draw_winners`
   - `subscriptions`
   - `charity_allocations`
   - `draw_simulations`
   - `audit_log`

### Step 7: Test the App
1. Go back to your app in the browser
2. Click `/signup`
3. Refresh the page (F5)
4. You should now see:
   - ✅ "Loading charities..." briefly
   - ✅ A dropdown with 5 charities:
     - The First Tee
     - PGA Foundation
     - Golf Channel Foundation
     - The Genesis Foundation
     - St. Jude Children's Research Hospital

---

## What the SQL Does

The SQL schema (`/scripts/supabase-init.sql`) creates and configures:

### Tables Created (9 tables)
1. **users** - User accounts and profiles
2. **charities** - Charity information and details
3. **golf_scores** - Golf scores (max 5 per user, FIFO)
4. **draws** - Monthly draws and results
5. **draw_winners** - Winner records with prizes
6. **subscriptions** - Stripe subscription tracking
7. **charity_allocations** - Monthly charity contribution tracking
8. **draw_simulations** - Admin testing/simulations
9. **audit_log** - Admin action logging

### Features Configured
- Row-Level Security (RLS) policies
- Performance indexes
- Database triggers for FIFO scoring
- Seed data (5 default charities)
- Proper foreign key relationships

---

## Troubleshooting

### "Permission denied" Error
**Solution:** Make sure you're using a Supabase project **YOU own**. You need admin access to create tables.

### "Syntax error" Error
**Solution:** The SQL file might have been modified. Copy it directly from the latest version.

### "Table already exists" Error
**Solution:** The schema has already been run. This is fine! The SQL uses `CREATE TABLE IF NOT EXISTS` to prevent duplicates.

### Still seeing "Database Not Initialized"
**Solution:**
1. Wait 30 seconds (Supabase cache takes time to update)
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Check that all 9 tables exist in **Table Editor**
4. Check that the `charities` table has 5 rows

---

## Next Steps

After database is initialized:

1. ✅ **Test Signup**: Create a test account
2. ✅ **Set Admin**: Promote your account to admin in `Table Editor`
3. ✅ **Access Admin Panel**: Visit `/admin`
4. ✅ **Deploy**: Push code to GitHub and deploy to Vercel

---

## Quick Checklist

- [ ] Supabase project created
- [ ] SQL schema executed in SQL Editor
- [ ] All 9 tables visible in Table Editor
- [ ] Charities table has 5 rows
- [ ] App refresh shows charities dropdown
- [ ] Can create account with selected charity
- [ ] Admin account created and promoted
- [ ] Can access `/admin` panel

---

## Need Help?

1. **Check Supabase Status**: Go to https://status.supabase.com
2. **Read Supabase Docs**: https://supabase.com/docs
3. **Check SQL Syntax**: Paste SQL into a SQL validator online
4. **Enable Browser Console**: Press F12 to see detailed error messages

---

**Status: Ready to initialize!** Once you run the SQL, your app will be fully functional. 🚀
