# Golf Charity Platform - Deployment & Setup Guide

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

- [ ] Supabase project created and connected
- [ ] Stripe account set up (API keys ready)
- [ ] Resend email service connected (API key ready)
- [ ] Database schema initialized in Supabase
- [ ] Environment variables configured
- [ ] First admin user created

---

## Environment Variables

Make sure these environment variables are set in your Vercel project:

### Required (Public)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Required (Private - Vercel Secrets)
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

---

## Deployment Steps

### Step 1: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add all required variables (see list above)
4. Make sure to check "Production" for all variables

### Step 2: Initialize Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `/scripts/supabase-init.sql`
5. Paste into the SQL editor and execute
6. Wait for the schema to be created

### Step 3: Create First Admin User

1. Visit `https://your-app.vercel.app/signup`
2. Create an account with your email
3. Go to Supabase → **users** table
4. Find your user record
5. Change `role` from `'user'` to `'admin'`
6. Sign out and back in

### Step 4: Configure Stripe

1. Go to Stripe Dashboard → **Webhooks**
2. Create endpoint for: `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `payment_intent.succeeded`
4. Copy webhook secret and add to `STRIPE_WEBHOOK_SECRET`

### Step 5: Deploy

1. Push your code to GitHub
2. Vercel will automatically deploy on push
3. Monitor deployment in Vercel dashboard
4. Verify all services are operational

---

## Post-Deployment Verification

### Check 1: Database Connection
- [ ] Visit `https://your-app.vercel.app`
- [ ] Homepage loads without errors
- [ ] Charities are displayed (if any exist)

### Check 2: Authentication
- [ ] Sign up works correctly
- [ ] Email confirmation is sent
- [ ] Login redirects to dashboard
- [ ] Logout functionality works

### Check 3: Admin Panel
- [ ] Create admin user following "Create First Admin User" step
- [ ] Visit `https://your-app.vercel.app/admin`
- [ ] Admin dashboard loads with statistics
- [ ] All admin pages are accessible

### Check 4: Stripe Integration
- [ ] Visit dashboard and try checkout
- [ ] Stripe checkout page appears
- [ ] Subscription is created in database
- [ ] Check `subscriptions` table in Supabase

### Check 5: Email Notifications
- [ ] Welcome email received after signup
- [ ] Check inbox for test emails
- [ ] Verify Resend is working properly

---

## Monitoring & Maintenance

### Regular Checks

1. **Monitor Stripe Webhooks**
   - Go to Stripe Dashboard → Webhooks
   - Check endpoint delivery logs
   - Ensure no failures

2. **Monitor Supabase**
   - Check Supabase dashboard logs
   - Monitor database query performance
   - Review storage usage

3. **Monitor Vercel Logs**
   - Visit Vercel dashboard
   - Check function logs for errors
   - Monitor request counts and latency

### Backup Database

- Supabase automatically backs up your data
- Set up manual backups if needed
- Test recovery procedures monthly

---

## Troubleshooting

### Issue: "Database connection failed"
**Solution:**
- Check `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Verify Supabase project is active
- Check that database schema is initialized

### Issue: "Stripe webhook failing"
**Solution:**
- Verify webhook secret in Stripe matches `STRIPE_WEBHOOK_SECRET`
- Check webhook endpoint URL is correct
- Review Stripe error logs for details

### Issue: "Admin can't log in"
**Solution:**
- Verify user role is set to `'admin'` in database
- Sign out completely and clear cookies
- Try incognito/private browser window
- Check auth session in browser DevTools

### Issue: "Emails not sending"
**Solution:**
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for failures
- Ensure email addresses are valid
- Check spam folder for emails

---

## Performance Optimization

### Database
- Ensure indexes exist on frequently queried columns
- Monitor slow query logs in Supabase
- Consider caching with Upstash Redis (optional)

### Frontend
- Use Next.js image optimization
- Enable compression in Vercel
- Monitor Core Web Vitals in Vercel Analytics

### Stripe
- Use webhook signatures to verify requests
- Implement idempotent operations
- Monitor rate limits

---

## Security Checklist

- [ ] All environment variables are set to "Production"
- [ ] Stripe keys are secret keys, not publishable
- [ ] Supabase RLS policies are enabled
- [ ] Admin authentication is working correctly
- [ ] Sensitive data is not logged
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled on critical endpoints

---

## Rollback Procedure

If deployment goes wrong:

1. **Immediate**: Revert to previous Vercel deployment
   - Go to Vercel dashboard
   - Find previous deployment
   - Click "Promote to Production"

2. **Database**: Restore from backup
   - Go to Supabase → Backups
   - Restore to previous state
   - Test before resuming operations

3. **Configuration**: Restore environment variables
   - Check previous working configuration
   - Re-apply to Vercel

---

## Scaling Considerations

As your user base grows:

1. **Database**: Upgrade Supabase plan for higher performance
2. **Caching**: Add Redis for frequently accessed data
3. **Storage**: Use Vercel Blob or AWS S3 for file uploads
4. **Email**: Increase Resend quota if needed
5. **Payments**: Monitor Stripe limits and upgrade account tier

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Resend Docs**: https://resend.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs

---

For deployment assistance, contact the development team or refer to individual service documentation.
