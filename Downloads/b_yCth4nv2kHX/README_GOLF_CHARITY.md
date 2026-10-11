# Golf Charity Subscription Platform

A modern, emotion-driven subscription platform that merges golf performance tracking with charitable giving and monthly prize draws.

## 🎯 Platform Overview

The Golf Charity Subscription Platform enables users to:
- **Track Golf Performance**: Enter and track Stableford scores (max 5 scores)
- **Support Charities**: Allocate a minimum 10% of subscription fees to partner charities
- **Win Prizes**: Participate in monthly draws with 3-number, 4-number, and 5-number matches
- **Verify Winnings**: Submit proof for prize verification and payouts

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19.2, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth + JWT
- **Payments**: Stripe
- **Email**: Resend
- **Deployment**: Vercel

### Key Features
✅ Role-based access control (user/admin)  
✅ Subscription management with Stripe  
✅ FIFO golf score system (max 5 per user)  
✅ Monthly draw engine with prize distribution  
✅ Winner verification workflow  
✅ Charity selection and tracking  
✅ Email notifications  
✅ Comprehensive admin panel  
✅ Row-level security (RLS) in database  
✅ Audit logging  

---

## 📁 Project Structure

```
golf-charity-platform/
├── app/
│   ├── api/                          # API routes
│   │   ├── auth/                    # Authentication endpoints
│   │   ├── admin/                   # Admin-only endpoints
│   │   ├── webhooks/                # Stripe webhooks
│   │   ├── scores/                  # Golf score endpoints
│   │   ├── charities/               # Charity endpoints
│   │   ├── winners/                 # Winner endpoints
│   │   └── checkout/                # Stripe checkout
│   ├── admin/                        # Admin panel pages
│   │   ├── page.tsx                 # Admin dashboard
│   │   ├── users/                   # User management
│   │   ├── charities/               # Charity management
│   │   ├── draws/                   # Draw management
│   │   ├── winners/                 # Winner verification
│   │   └── settings/                # Admin settings
│   ├── dashboard/                    # User dashboard pages
│   │   ├── page.tsx                 # Dashboard overview
│   │   ├── scores/                  # Score management
│   │   ├── winnings/                # Winnings tracker
│   │   ├── charity/                 # Charity details
│   │   └── settings/                # User settings
│   ├── (auth)/                       # Auth pages
│   │   ├── signup/page.tsx
│   │   └── signin/page.tsx
│   ├── page.tsx                      # Homepage
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
├── lib/
│   ├── supabase.ts                   # Supabase client
│   ├── auth.ts                       # Authentication utilities
│   ├── stripe.ts                     # Stripe integration
│   ├── email.ts                      # Email service (Resend)
│   ├── draw-engine.ts                # Draw logic and calculations
│   ├── golf-scores.ts                # Score management logic
│   └── utils.ts                      # Utility functions
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   └── admin/                        # Admin-specific components
│       ├── sidebar.tsx
│       └── header.tsx
├── types/
│   └── database.ts                   # TypeScript types for database
├── scripts/
│   └── supabase-init.sql             # Database schema initialization
├── middleware.ts                     # Next.js middleware for routing
├── next.config.mjs                   # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
└── tsconfig.json                     # TypeScript configuration
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account
- Resend account (for emails)
- Git & GitHub

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/Nithin-Kumar127/golf-charity-platform.git
cd golf-charity-platform
```

2. **Install Dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set Up Environment Variables**
```bash
# Create .env.local file
cp .env.example .env.local
```

Add these variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
RESEND_API_KEY=re_xxxxx
```

4. **Initialize Database**
- Go to Supabase SQL Editor
- Copy `/scripts/supabase-init.sql`
- Execute the SQL to create schema

5. **Create First Admin User**
- Sign up at `http://localhost:3000/signup`
- Update user role to `'admin'` in Supabase
- Access admin panel at `/admin`

6. **Run Development Server**
```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000` to see the app.

---

## 📋 User Roles & Access

### Public User (Not Logged In)
- View homepage
- View charities directory
- Access signup/signin pages

### Registered User (role: 'user')
- Access `/dashboard`
- Manage golf scores (max 5)
- View subscriptions
- Select and manage charities
- View winnings
- Upload proof for verification
- Cannot access `/admin`

### Administrator (role: 'admin')
- Access both `/dashboard` AND `/admin`
- Manage all users (promote/demote/delete)
- Add and manage charities
- Create and execute monthly draws
- Verify winner proofs and approve payouts
- View analytics and system status
- Configure platform settings

---

## 🔐 Admin Setup Guide

See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for detailed instructions.

### Quick Steps
1. Sign up via `/signup`
2. Promote user to admin in Supabase `users` table
3. Access admin panel at `/admin`
4. Dashboard only allows admins - others redirected to `/dashboard`

---

## 🗄️ Database Schema

### Core Tables

**users**
- id, email, full_name, role, subscription_status, created_at

**subscriptions**
- id, user_id, stripe_subscription_id, plan_type, status, current_period_start, current_period_end

**golf_scores**
- id, user_id, score (1-45), score_date, entry_date

**charities**
- id, name, description, image_url, website_url, minimum_allocation

**charity_allocations**
- id, user_id, charity_id, percentage

**draws**
- id, draw_date, status, total_tickets, prize_pool, winning_number_3/4/5

**draw_winners**
- id, user_id, draw_id, match_type, prize_amount, verification_status, proof_url

**audit_log**
- id, user_id, action, table_name, record_id, changes, timestamp

See `/scripts/supabase-init.sql` for complete schema.

---

## 💳 Subscription Plans

**Monthly**
- Price: $29/month
- Auto-renew: Yes
- Cancel anytime

**Yearly**
- Price: $299/year (14% discount)
- Auto-renew: Yes
- Cancel anytime

### Charity Allocation
- Minimum 10% of subscription fee
- User selects charity at signup
- Can change anytime in dashboard
- Tracked in `charity_allocations` table

---

## 🎲 Draw System

### Monthly Cadence
Draws execute on a monthly basis with the following prize distribution:

- **5-Number Match**: 40% of prize pool (Jackpot - rolls over if no winner)
- **4-Number Match**: 35% of prize pool (Split among all 4-number winners)
- **3-Number Match**: 25% of prize pool (Split among all 3-number winners)

### Draw Engine
- Generates random numbers (0-99999)
- Matches against user golf scores
- Supports both random and score-weighted draws
- Includes simulation mode for testing
- Full audit trail of all draws

---

## 📧 Email Notifications

The platform sends emails via Resend for:
- Welcome email (signup confirmation)
- Draw results
- Winner notifications
- Winner status updates (approved/rejected)
- Admin notifications

All emails are HTML-formatted and mobile-responsive.

---

## 🔒 Security Features

- **Password Security**: Bcrypt hashing with salt
- **Session Management**: JWT-based auth with Supabase
- **Row-Level Security**: RLS policies on all tables
- **API Protection**: Admin endpoints verify user role
- **SQL Injection Prevention**: Parameterized queries
- **CORS**: Properly configured
- **Environment Variables**: All secrets in Vercel Secrets
- **HTTPS**: Enforced on production
- **Audit Logging**: All admin actions logged

---

## 📊 Admin Features

### Dashboard
- Real-time statistics
- User count, subscriptions, charities
- Pending verifications count
- System health status

### User Management
- Search and filter users
- Promote/demote admin status
- Delete users (with confirmation)
- View user subscription details

### Charity Management
- Add new charities
- Upload charity images
- Manage charity details
- Delete charities
- View allocation statistics

### Draw Management
- Create scheduled draws
- Generate draw numbers
- View all historical draws
- Monitor prize pools
- Execute and publish draws

### Winner Verification
- Review pending winner proofs
- Approve verified winners
- Reject with reasons
- Track all winner statuses
- Export winner data

### Settings
- Configure subscription pricing
- Set discount percentages
- Adjust charity requirements
- Monitor system integrations

---

## 🧪 Testing

See [TESTING.md](./TESTING.md) for comprehensive testing guide covering:
- All public pages
- Authentication flows
- User dashboard features
- Admin panel functionality
- API endpoints
- Responsive design
- Performance
- Security
- Email notifications
- Browser compatibility
- Database integrity

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide including:
- Environment variable setup
- Database initialization
- Stripe webhook configuration
- Admin user creation
- Post-deployment verification
- Monitoring & maintenance
- Troubleshooting

### Quick Deploy to Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy (automatic on push)

---

## 📞 Support & Documentation

- **Admin Setup**: [ADMIN_SETUP.md](./ADMIN_SETUP.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Testing**: [TESTING.md](./TESTING.md)
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly (see TESTING.md)
4. Submit pull request
5. Wait for review and approval

---

## 📄 License

[Add appropriate license here]

---

## 👥 Team

Built by Digital Heroes for a full-stack development selection process.

---

## 🙏 Acknowledgments

- Supabase for PostgreSQL & Auth
- Stripe for payment processing
- Resend for email service
- Vercel for deployment platform
- Next.js and React communities

---

## 📈 Roadmap

Future enhancements:
- [ ] Mobile app (React Native)
- [ ] Leaderboards and rankings
- [ ] Social sharing features
- [ ] Referral program
- [ ] Advanced analytics
- [ ] Multiple currency support
- [ ] International expansion

---

## 📞 Questions?

For questions or issues:
1. Check the documentation files (ADMIN_SETUP.md, DEPLOYMENT.md, TESTING.md)
2. Review GitHub issues
3. Contact the development team

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
