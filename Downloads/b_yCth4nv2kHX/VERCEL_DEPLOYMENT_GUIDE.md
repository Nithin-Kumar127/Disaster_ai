# Vercel Deployment Guide

## Prerequisites

- GitHub account with the golf-charity-platform repository
- Vercel account (can use GitHub login)
- Environment variables ready

---

## Step 1: Prepare Environment Variables

Before deploying, gather these from your Supabase and Stripe dashboards:

### Supabase Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Stripe Variables
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_pk_live_...
STRIPE_SECRET_KEY=sk_test_or_sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Resend Variables
```
RESEND_API_KEY=re_...
```

**Where to find these:**
- **Supabase**: Project Settings → API Keys
- **Stripe**: Dashboard → Developers → API Keys
- **Resend**: Dashboard → API Keys

---

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/dashboard
2. **Click "Add New Project"**
3. **Select GitHub Repository**:
   - Search for "golf-charity-platform"
   - Select `Nithin-Kumar127/golf-charity-platform`
4. **Configure Project**:
   - Framework: Next.js (auto-detected)
   - Root Directory: ./ (default)
   - Click "Continue"
5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add all the variables from Step 1
   - For each variable, select scope: Production, Preview, Development
6. **Click "Deploy"**
7. **Wait for deployment** (5-10 minutes)

### Option B: Via Command Line

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts and add environment variables when asked
```

---

## Step 3: Configure Environment Variables in Vercel Dashboard

After deployment:

1. Go to your project on Vercel dashboard
2. Click **Settings**
3. Go to **Environment Variables**
4. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: (your value)
   - Scope: Production, Preview, Development
5. Click **Save**
6. Repeat for all 8 variables

---

## Step 4: Redeploy After Adding Variables

Since environment variables were added after deployment:

1. Go to **Deployments**
2. Click the latest deployment
3. Click **Redeploy**
4. Confirm redeployment

The app will rebuild with the new variables.

---

## Step 5: Verify Deployment

Once deployed:

1. **Visit your live URL**: `https://your-project.vercel.app`
2. **Test Sign Up**: Go to `/signup` and create an account
3. **Test Sign In**: Go to `/signin` and login
4. **Test User Dashboard**: Access `/dashboard`
5. **Verify Admin Access**: 
   - Promote your account to admin in Supabase
   - Refresh browser
   - Check if `/admin` link appears
   - Click and verify access works

---

## Step 6: Update GitHub

### If using v0:
- v0 automatically pushes changes to your GitHub branch
- You'll see a PR in the GitHub repository
- Review and merge the PR to main

### If deploying manually:

```bash
# Add all changes
git add .

# Commit
git commit -m "Deploy golf charity platform with admin panel"

# Push to GitHub
git push origin v0/nithin-kumar127-1a93dba5
```

Then create a Pull Request on GitHub:
1. Go to https://github.com/Nithin-Kumar127/golf-charity-platform
2. Click **Pull Requests**
3. Click **New Pull Request**
4. Base: main, Compare: v0/nithin-kumar127-1a93dba5
5. Add title: "Add Admin Panel & Complete Golf Charity Platform"
6. Click **Create Pull Request**
7. Review and **Merge Pull Request**

---

## Environment Variables Reference

| Variable | Type | Source | Example |
|----------|------|--------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Public | Supabase → API | https://abc.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public | Supabase → API | eyJhbGc... |
| SUPABASE_SERVICE_ROLE_KEY | Secret | Supabase → API | eyJhbGc... |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Public | Stripe → Keys | pk_test_... |
| STRIPE_SECRET_KEY | Secret | Stripe → Keys | sk_test_... |
| STRIPE_WEBHOOK_SECRET | Secret | Stripe → Webhooks | whsec_... |
| RESEND_API_KEY | Secret | Resend → Keys | re_... |

---

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] Sign up page works
- [ ] Sign in page works
- [ ] User dashboard accessible
- [ ] Score management works
- [ ] Admin can access `/admin`
- [ ] All sidebar links work
- [ ] Responsive design on mobile
- [ ] Environment variables set correctly
- [ ] GitHub PR merged to main

---

## Troubleshooting

### Build Fails
- Check console for errors
- Ensure all imports are correct
- Verify environment variables are set
- Check that `dynamic = 'force-dynamic'` is in all API routes

### 404 Error on Pages
- Verify page files exist in `/app` folder
- Check file naming conventions (page.tsx)
- Ensure routes are correctly formatted

### Environment Variables Not Loading
- Verify variables are added in Vercel dashboard
- Check spelling (case-sensitive)
- Redeploy after adding variables
- Use `NEXT_PUBLIC_` prefix for client-side variables

### Admin Can't Access `/admin`
- Verify user role is 'admin' in Supabase
- Clear browser cache and refresh
- Check RLS policies in Supabase
- Verify auth token is valid

---

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs

