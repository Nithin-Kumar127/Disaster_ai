# Environment Variables Setup

## Required Environment Variables

The Golf Charity Platform requires these environment variables to function properly:

### 1. Supabase Configuration (REQUIRED)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Stripe Configuration (Required for Payments)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-key
```

### 3. Resend Configuration (Required for Emails)
```
RESEND_API_KEY=re_your-key-here
```

### 4. Optional Configuration
```
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Local development
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # Production
```

---

## How to Get Each Variable

### Supabase Keys
1. Go to https://supabase.com → Your Project
2. Click **Settings** (bottom left)
3. Click **API** in the left menu
4. You'll see:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### Stripe Keys
1. Go to https://dashboard.stripe.com
2. Click **Developers** (top right)
3. Click **API Keys**
4. You'll see:
   - **Publishable Key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret Key** → `STRIPE_SECRET_KEY` (⚠️ Keep secret!)
5. For webhook secret:
   - Click **Webhooks**
   - Create webhook for your app
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

### Resend Keys
1. Go to https://resend.com → Dashboard
2. Click **API Keys** (left menu)
3. Create a new API key
4. Copy it → `RESEND_API_KEY` (⚠️ Keep secret!)

---

## Setting Variables in Different Environments

### Local Development (`.env.local`)
Create a file `.env.local` in your project root:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

### v0 Preview (Settings → Vars)
1. Click **Settings** (top right of v0)
2. Click **Vars** tab
3. Add each variable as key-value pair
4. Click "Save"

### Vercel Deployment
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add each variable
5. Click "Save"
6. Redeploy for changes to take effect

---

## Testing Variables

### Test Supabase Connection
Visit `/api/charities` in your browser:
- ✅ Success: Returns JSON with charities array
- ❌ Error 500: Check Supabase keys are correct
- ❌ Error: "Missing SUPABASE_SERVICE_ROLE_KEY" - Key not set in environment

### Test Stripe Connection
Check `/api/checkout` logs:
- ✅ Success: Creates checkout session
- ❌ Error: Check Stripe keys are correct

### Test Email Service
Sign up → Check if welcome email received:
- ✅ Success: Email in inbox within 1 minute
- ❌ Error: Check Resend key is correct

---

## Troubleshooting

### "Failed to load charities" on signup
**Error**: Missing or invalid `SUPABASE_SERVICE_ROLE_KEY`
**Fix**: 
1. Check Settings → Vars in v0
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Copy exact value from Supabase
4. Restart preview

### API returns 500 error
**Error**: Database configuration issue
**Fix**:
1. Verify all 3 Supabase keys are set
2. Check keys are for the same Supabase project
3. Make sure Supabase project is active (not paused)
4. Check browser console for detailed error

### "Invalid API Key" error
**Error**: Wrong key or wrong environment variable
**Fix**:
1. Double-check key values (copy-paste to avoid typos)
2. Verify you're using correct key type:
   - Supabase: URL, Anon Key, Service Role Key
   - Stripe: Publishable Key (starts with `pk_`), Secret Key (starts with `sk_`)
   - Resend: API Key (starts with `re_`)
3. Check for trailing/leading spaces

### Variables not updating
**Issue**: Changes not taking effect
**Fix**:
1. For v0: Refresh browser (Ctrl+F5)
2. For local: Restart dev server
3. For Vercel: Redeploy after setting variables

---

## Security Notes

⚠️ **NEVER commit these to GitHub:**
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`

✅ **Safe to commit:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public key is safe)

---

## Quick Checklist

Before deploying:
- [ ] All 3 Supabase keys are set
- [ ] All 3 Stripe keys are set
- [ ] Resend API key is set
- [ ] Keys are for the correct Supabase/Stripe projects
- [ ] No trailing spaces in keys
- [ ] Service role key is kept private
- [ ] Stripe webhook is configured
- [ ] Database schema is initialized
- [ ] Charities are seeded

---

## Support

If you see errors in the preview:
1. Open browser console (F12)
2. Look for `[v0]` prefix messages
3. Check what error is reported
4. Cross-reference with this guide
5. Update environment variables as needed
6. Refresh preview
