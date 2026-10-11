# Golf Charity Platform - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Environment Setup (2 min)
```bash
# Clone project (already done)
cd golf-charity-platform

# Install dependencies
npm install

# Create .env.local with your credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
RESEND_API_KEY=re_...
```

### Step 2: Database Setup (1 min)
1. Go to Supabase dashboard
2. SQL Editor → New Query
3. Copy `/scripts/supabase-init.sql`
4. Paste and execute

### Step 3: Run Locally (1 min)
```bash
npm run dev
# Visit http://localhost:3000
```

### Step 4: Create Admin (1 min)
1. Sign up at `/signup`
2. Go to Supabase → users table
3. Find your user, change `role` to `'admin'`
4. Visit `/admin` after signing back in

---

## 🎯 Key URLs

| Page | URL | Auth Required | Admin Only |
|------|-----|---------------|-----------|
| Homepage | `/` | No | No |
| Sign Up | `/signup` | No | No |
| Sign In | `/signin` | No | No |
| Dashboard | `/dashboard` | Yes | No |
| Scores | `/dashboard/scores` | Yes | No |
| Winnings | `/dashboard/winnings` | Yes | No |
| Admin | `/admin` | Yes | Yes ✅ |
| Users | `/admin/users` | Yes | Yes ✅ |
| Charities | `/admin/charities` | Yes | Yes ✅ |
| Draws | `/admin/draws` | Yes | Yes ✅ |
| Winners | `/admin/winners` | Yes | Yes ✅ |
| Settings | `/admin/settings` | Yes | Yes ✅ |

---

## 📁 Key Files to Know

### Backend
| File | Purpose |
|------|---------|
| `/lib/auth.ts` | Authentication logic |
| `/lib/stripe.ts` | Stripe integration |
| `/lib/draw-engine.ts` | Draw calculations |
| `/lib/email.ts` | Email notifications |
| `/lib/golf-scores.ts` | Score management |
| `/app/api/` | All API endpoints |

### Frontend
| File | Purpose |
|------|---------|
| `/app/page.tsx` | Homepage |
| `/app/dashboard/page.tsx` | User dashboard |
| `/app/admin/page.tsx` | Admin dashboard |
| `/components/admin/sidebar.tsx` | Admin navigation |

### Database
| File | Purpose |
|------|---------|
| `/scripts/supabase-init.sql` | Database schema |

---

## 🔑 Admin Credentials

**After setup, use:**
- **Email**: Your signup email
- **Password**: Your signup password
- **Access**: `https://app.vercel.app/admin`

### Verify Admin Status
```bash
# In Supabase SQL Editor:
SELECT email, role FROM users WHERE email = 'your-email@example.com';
# Should show: role = 'admin'
```

---

## 🧪 Quick Testing

### Test Signup
1. Go to `/signup`
2. Enter email and password
3. Should redirect to `/dashboard`
4. Check Supabase `users` table

### Test Admin Access
1. Promote user to admin (see above)
2. Visit `/admin`
3. Should see admin dashboard
4. Check Users page lists all users

### Test Scores
1. Go to `/dashboard/scores`
2. Add score (1-45)
3. Select date
4. Click "Add Score"
5. Score appears in list
6. Max 5 scores (FIFO)

---

## 🐛 Common Issues

### "Database connection failed"
```
✅ Check: NEXT_PUBLIC_SUPABASE_URL is correct
✅ Check: Database schema is initialized
✅ Check: .env.local is loaded
```

### "Admin can't access /admin"
```
✅ Check: User role is 'admin' in database
✅ Check: Clear browser cache
✅ Check: Sign out and back in
```

### "Stripe checkout not working"
```
✅ Check: STRIPE_SECRET_KEY is set
✅ Check: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set
✅ Check: Stripe keys are not expired
```

---

## 📊 Database Quick Commands

### Check Admin Users
```sql
SELECT email, role FROM users WHERE role = 'admin';
```

### Check User Scores
```sql
SELECT * FROM golf_scores WHERE user_id = 'user-id' ORDER BY entry_date DESC LIMIT 5;
```

### Check Subscriptions
```sql
SELECT u.email, s.plan_type, s.status FROM users u 
JOIN subscriptions s ON u.id = s.user_id;
```

### Check Draws
```sql
SELECT * FROM draws ORDER BY draw_date DESC;
```

---

## 🚀 Deploy to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial deployment"
git push origin main

# 2. Go to vercel.com
# 3. Connect GitHub repo
# 4. Set Environment Variables
# 5. Deploy (automatic on push)

# URL will be: https://your-project-name.vercel.app
```

---

## 📧 Test Emails

Welcome and notification emails go to the signup email. Check:
1. Gmail: Check inbox and spam
2. Check Resend dashboard for failures

---

## 💳 Test Stripe

Use test card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

---

## 🎯 Next Steps After Deployment

1. ✅ Verify homepage loads
2. ✅ Test signup/signin
3. ✅ Create admin user
4. ✅ Add charities (admin panel)
5. ✅ Test dashboard features
6. ✅ Create test draw
7. ✅ Monitor in Vercel & Supabase

---

## 📚 Full Documentation

For detailed info, see:
- **Admin Setup**: `ADMIN_SETUP.md`
- **Deployment**: `DEPLOYMENT.md`
- **Testing**: `TESTING.md`
- **Overview**: `README_GOLF_CHARITY.md`
- **Build Summary**: `BUILD_SUMMARY.md`

---

## ✅ Deployment Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with all variables
- [ ] Database schema initialized
- [ ] First admin user created
- [ ] App runs locally (`npm run dev`)
- [ ] All pages load
- [ ] Signup/signin work
- [ ] Admin panel is accessible
- [ ] Code pushed to GitHub
- [ ] Vercel deployment connected
- [ ] Environment variables set in Vercel
- [ ] App deployed and running

---

## 🎉 You're Ready!

Your Golf Charity Subscription Platform is ready to deploy and serve users.

**Questions?** Check the documentation files above or review code comments.

---

**Last Updated**: April 1, 2026
