# Admin Credentials & Deployment Information

## Admin Account Setup

### Recommended Admin Credentials

We recommend creating your admin account with these credentials (you can customize):

```
Email: admin@golfcharity.com
Password: AdminPass@2024
```

### How to Create This Admin Account

#### Step 1: Sign Up
1. Open your app at `https://your-domain.com` (after deployment)
2. Click **"Sign Up"** or go to `/signup`
3. Enter:
   - Email: `admin@golfcharity.com`
   - Password: `AdminPass@2024`
   - Select a charity
   - Click **"Create Account"**
4. You'll be logged in to the user dashboard

#### Step 2: Promote to Admin
1. Go to **Supabase Dashboard**: https://supabase.com
2. Sign in with your Supabase account
3. Select your **golf-charity-platform project**
4. Click **"SQL Editor"** (left sidebar)
5. Paste this SQL query:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@golfcharity.com';
```
6. Click **"Execute"** button

#### Step 3: Verify Admin Access
1. **Sign out** from the app (top right → Logout)
2. **Sign back in** with the same credentials:
   - Email: `admin@golfcharity.com`
   - Password: `AdminPass@2024`
3. Go to **User Dashboard** (`/dashboard`)
4. **Look for "Admin Panel"** link in the left sidebar
5. Click **"Admin Panel"** to access `/admin`
6. Verify you can see the admin dashboard

---

## GitHub Repository

### Current Status
- **Repository**: https://github.com/Nithin-Kumar127/golf-charity-platform
- **Owner**: Nithin-Kumar127
- **Connected Branch**: `v0/nithin-kumar127-1a93dba5`
- **Status**: Ready to deploy

### How to Push Updates to GitHub

#### Option 1: Via v0 (If using v0 IDE)
- v0 automatically commits and pushes changes to the connected branch
- A pull request will be created automatically
- Merge the PR in GitHub to complete the update

#### Option 2: Via Git Command Line
```bash
# Add all changes
git add .

# Commit with message
git commit -m "Deploy: Golf Charity Platform with admin panel"

# Push to the branch
git push origin v0/nithin-kumar127-1a93dba5
```

#### After Pushing to GitHub
1. Go to: https://github.com/Nithin-Kumar127/golf-charity-platform
2. Click **"Pull Requests"**
3. Look for your PR (if created automatically by v0)
4. Click **"Merge Pull Request"** to merge to main branch
5. Confirm merge

---

## Vercel Deployment

### Live URLs (After Deployment)

Once deployed to Vercel, your URLs will be:

| Page | URL |
|------|-----|
| **Live Website** | `https://golf-charity-platform.vercel.app` |
| **Home Page** | `https://golf-charity-platform.vercel.app/` |
| **Sign Up** | `https://golf-charity-platform.vercel.app/signup` |
| **Sign In** | `https://golf-charity-platform.vercel.app/signin` |
| **User Dashboard** | `https://golf-charity-platform.vercel.app/dashboard` |
| **Admin Panel** | `https://golf-charity-platform.vercel.app/admin` |

(Replace `golf-charity-platform` with your actual Vercel project name)

### Environment Variables Needed for Deployment

Before deploying, collect these from your service providers:

```
1. NEXT_PUBLIC_SUPABASE_URL
   From: Supabase Dashboard → Project Settings → API → URL

2. NEXT_PUBLIC_SUPABASE_ANON_KEY
   From: Supabase Dashboard → Project Settings → API → anon (public) key

3. SUPABASE_SERVICE_ROLE_KEY
   From: Supabase Dashboard → Project Settings → API → service_role key

4. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   From: Stripe Dashboard → Developers → API Keys → Publishable Key

5. STRIPE_SECRET_KEY
   From: Stripe Dashboard → Developers → API Keys → Secret Key

6. STRIPE_WEBHOOK_SECRET
   From: Stripe Dashboard → Developers → Webhooks → Endpoint Secret

7. RESEND_API_KEY
   From: Resend Dashboard → API Keys → Your API Key
```

### Deployment Steps

1. **Create Vercel Account**
   - Go to: https://vercel.com
   - Sign up with GitHub account
   - Authorize Vercel to access your GitHub repositories

2. **Deploy Project**
   - Go to: https://vercel.com/dashboard
   - Click **"Add New Project"**
   - Select repository: `Nithin-Kumar127/golf-charity-platform`
   - Click **"Import"**
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables**
   - In Vercel, go to **"Environment Variables"**
   - Add all 7 variables from the list above
   - Set scope to: **Production**, **Preview**, **Development**
   - Click **"Save"**

4. **Trigger Deployment**
   - Click **"Deploy"**
   - Wait 5-10 minutes for deployment to complete
   - You'll see a green checkmark when complete

5. **Get Your Live URL**
   - Vercel will show your live URL
   - It will be something like: `https://your-project-name.vercel.app`
   - Share this URL with users

---

## Complete Credentials Summary

| Item | Value | Status |
|------|-------|--------|
| **GitHub Repo** | https://github.com/Nithin-Kumar127/golf-charity-platform | Ready |
| **Admin Email** | admin@golfcharity.com | Create via signup |
| **Admin Password** | AdminPass@2024 | Create via signup |
| **Vercel Project** | (Created during deployment) | Pending |
| **Live URL** | (Assigned after deployment) | Pending |
| **Admin Panel URL** | {liveURL}/admin | After promotion to admin |

---

## Step-by-Step Deployment Checklist

- [ ] **Step 1**: Create admin account via signup (/signup)
- [ ] **Step 2**: Promote admin in Supabase (SQL query)
- [ ] **Step 3**: Verify admin access works
- [ ] **Step 4**: Push code to GitHub (via v0 or git command)
- [ ] **Step 5**: Merge GitHub PR to main branch
- [ ] **Step 6**: Collect all environment variables
- [ ] **Step 7**: Create Vercel account
- [ ] **Step 8**: Import GitHub repo to Vercel
- [ ] **Step 9**: Add environment variables in Vercel
- [ ] **Step 10**: Deploy and wait for completion
- [ ] **Step 11**: Test all pages on live URL
- [ ] **Step 12**: Verify admin can access /admin
- [ ] **Step 13**: Share live URL with users

---

## Testing After Deployment

### Public Pages (No Auth Required)
- [ ] Homepage (`/`) loads
- [ ] Sign up page works
- [ ] Sign in page works

### User Pages (Auth Required)
- [ ] Can sign up with new account
- [ ] Can sign in
- [ ] Dashboard loads
- [ ] Score entry works
- [ ] Profile page works

### Admin Pages (Admin Only)
- [ ] Admin can access `/admin`
- [ ] Admin can see all admin pages
- [ ] Non-admin is redirected from `/admin`
- [ ] User management works
- [ ] Draw management works
- [ ] Winner verification works

---

## Quick Reference

**For your convenience**, save these credentials:

```
ADMIN LOGIN AFTER CREATION:
Email: admin@golfcharity.com
Password: AdminPass@2024

GITHUB:
Repository: https://github.com/Nithin-Kumar127/golf-charity-platform
Branch: v0/nithin-kumar127-1a93dba5

LIVE DEPLOYMENT (After Vercel):
URL: (Will be assigned after deployment)

ADMIN PANEL (After promotion):
URL: {LiveURL}/admin
Email: admin@golfcharity.com
Password: AdminPass@2024
```

---

## Need Help?

See these guides:
- **Admin Setup**: ADMIN_ACCOUNT_SETUP.md
- **Deployment Guide**: VERCEL_DEPLOYMENT_GUIDE.md
- **Full Documentation**: README_GOLF_CHARITY.md
- **Testing Checklist**: TESTING.md

