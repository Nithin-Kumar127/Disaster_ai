# Database Setup Guide

## Overview
This guide helps you initialize the Golf Charity Platform database in Supabase.

## Step 1: Run Database Schema
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `/scripts/supabase-init.sql` from your project
5. Copy the entire SQL content
6. Paste it into the SQL editor
7. Click **Run**

## Step 2: Verify Tables Created
After running the SQL, verify all tables exist:
- users
- charities
- golf_scores
- draws
- draw_winners
- charity_allocations
- draw_simulations
- subscriptions
- audit_log

## Step 3: Initialize Charities (Option A - Automatic)
When users visit the signup page, charities will be auto-initialized via:
```
GET/POST /api/charities/init
```

This endpoint will:
1. Check if charities exist
2. If not, seed 5 default charities
3. Return initialization status

## Step 4: Initialize Charities (Option B - Manual)
If auto-initialization fails, manually seed charities:

1. Go to **SQL Editor** in Supabase
2. Run this query:
```sql
INSERT INTO charities (name, description, logo_url, category, impact_statement, is_featured) VALUES
  ('The First Tee', 'Building character in young people through golf.', NULL, 'Youth Development', 'Empowering youth through golf education and mentorship', TRUE),
  ('PGA Foundation', 'Providing golf opportunities for underrepresented communities.', NULL, 'Community Access', 'Making golf accessible to everyone regardless of background', TRUE),
  ('Golf Channel Foundation', 'Supporting junior golf and charitable causes.', NULL, 'Junior Golf', 'Developing the next generation of golfers', FALSE),
  ('The Genesis Foundation', 'Funding cancer research and community support.', NULL, 'Health & Research', 'Fighting cancer through research and community programs', TRUE),
  ('St. Jude Children''s Research Hospital', 'Treating childhood cancer with world-class care.', NULL, 'Health & Children', 'Curing childhood cancer and saving children''s lives', TRUE)
ON CONFLICT (name) DO NOTHING;
```

## Step 5: Verify Data
Run this query to check charities are loaded:
```sql
SELECT * FROM charities WHERE is_active = TRUE;
```

You should see 5 charities listed.

## Troubleshooting

### "No charities available" on signup page
1. Check that charities table has data: `SELECT COUNT(*) FROM charities;`
2. Visit `/api/charities` in your browser to test the API
3. If empty, manually run the INSERT query above
4. Or visit `http://localhost:3000/api/charities/init` (POST) to auto-seed

### "Failed to parse URL" error
- This is fixed in the latest version
- The signup page now automatically determines the correct base URL
- Refresh the page and try again

### API returning empty array
1. Check Supabase connection is working
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
3. Check that the charities table exists and has data
4. Try the `/api/charities/init` endpoint to seed data

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Quick Test
1. Go to signup page
2. You should see "Loading charities..." briefly
3. Then see a dropdown with 5 charities
4. Select one and complete signup

If charities don't load, check:
- Database is initialized (run SQL schema)
- Charities table has data
- Environment variables are set correctly
- Check browser console for error messages (F12 → Console)
