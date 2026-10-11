# Golf Charity Platform - Testing Guide

## Quick Test Checklist

Use this guide to verify all pages and features are working correctly.

---

## Public Pages (No Login Required)

### Homepage (`/`)
- [ ] Page loads without errors
- [ ] Hero section displays properly
- [ ] Features section is visible
- [ ] Pricing cards show both monthly and yearly options
- [ ] CTA buttons are clickable and functional
- [ ] Footer is visible at bottom
- [ ] Responsive design works on mobile

### Charities Directory
- [ ] View on homepage or dedicated page
- [ ] Charity cards display with images
- [ ] Charity descriptions are visible
- [ ] Links to charity websites work
- [ ] Filter/search functionality works (if implemented)

---

## Authentication Pages

### Sign Up (`/signup`)
- [ ] Form loads without errors
- [ ] Email field validates email format
- [ ] Password field accepts input
- [ ] Password confirmation matches
- [ ] "Create Account" button works
- [ ] Success redirects to dashboard
- [ ] Error messages display for invalid input
- [ ] User record created in Supabase `users` table

### Sign In (`/signin`)
- [ ] Form loads without errors
- [ ] Email/password login works
- [ ] Redirects to dashboard on success
- [ ] Shows error message on wrong credentials
- [ ] "Forgot Password" link exists (if applicable)
- [ ] Remember me checkbox works (if applicable)

### Logout
- [ ] Logout button visible in dashboard and admin
- [ ] Clicking logout removes session
- [ ] Redirects to homepage or signin
- [ ] Can't access protected pages after logout

---

## User Dashboard (`/dashboard`)

### Dashboard Overview
- [ ] Dashboard loads after login
- [ ] Sidebar navigation appears
- [ ] User email displayed in header
- [ ] Statistics cards show data
- [ ] No console errors

### Score Management (`/dashboard/scores`)
- [ ] Page loads successfully
- [ ] Add score form is visible
- [ ] Can enter Stableford score (1-45)
- [ ] Can select date
- [ ] Submit button adds score
- [ ] Score appears in list below form
- [ ] List shows scores in reverse chronological order
- [ ] Only last 5 scores are kept (FIFO)
- [ ] Can delete individual scores
- [ ] Stats update after adding/removing scores

### My Winnings (`/dashboard/winnings`)
- [ ] Page loads without errors
- [ ] Displays any won prizes
- [ ] Shows match type (3#, 4#, 5#)
- [ ] Shows prize amounts
- [ ] Shows verification status
- [ ] If pending: shows "upload proof" button
- [ ] If approved: shows payout details

### Charity Selection (`/dashboard/charity`)
- [ ] Current charity is displayed
- [ ] Can view charity details
- [ ] Change charity button works (if applicable)
- [ ] Shows percentage allocated to charity
- [ ] Displays charity impact statistics

### Settings (`/dashboard/settings`)
- [ ] Page loads successfully
- [ ] Can update profile information
- [ ] Can change password
- [ ] Can update subscription preferences
- [ ] Changes are saved correctly

---

## Admin Panel (`/admin`)

### Admin Access Control
- [ ] Non-admin users cannot access `/admin`
- [ ] Non-admin users are redirected to `/dashboard`
- [ ] Admin users can access all admin pages
- [ ] "Admin Panel" link appears in sidebar for admins only

### Admin Dashboard (`/admin`)
- [ ] Dashboard loads for admin users
- [ ] Statistics cards display correctly
- [ ] Total users count is accurate
- [ ] Active subscriptions count is accurate
- [ ] Total charities count is accurate
- [ ] Pending verifications count is accurate
- [ ] Quick action links work

### Users Management (`/admin/users`)
- [ ] Users table loads with all users
- [ ] Search functionality works
- [ ] Filter by role (admin/user) works
- [ ] Can promote user to admin
- [ ] Can demote admin to user
- [ ] Can delete users
- [ ] Changes are reflected immediately
- [ ] User details are accurate

### Charities Management (`/admin/charities`)
- [ ] Charities table/grid displays all charities
- [ ] Can add new charity
- [ ] Add form has all required fields
- [ ] Can upload charity image
- [ ] Can delete charities
- [ ] Charity details update correctly
- [ ] Images display properly

### Draws Management (`/admin/draws`)
- [ ] Draws table displays all draws
- [ ] Can create new draw
- [ ] Draw list updates after creation
- [ ] Can view draw details
- [ ] Status shows correctly (scheduled, generated, published, completed)
- [ ] Prize pool amounts are accurate
- [ ] Winning numbers display correctly
- [ ] Can execute draw (if functionality implemented)

### Winners Verification (`/admin/winners`)
- [ ] Winners list displays pending winners
- [ ] Can filter by status (pending, approved, rejected)
- [ ] Can approve winners
- [ ] Can reject winners with reason (if applicable)
- [ ] Status updates immediately
- [ ] Prize amounts are accurate
- [ ] Match types display correctly (3#, 4#, 5#)
- [ ] Can view proof attachments

### Settings (`/admin/settings`)
- [ ] Settings page loads
- [ ] Can view subscription pricing
- [ ] Can view draw configuration
- [ ] System status shows connected services
- [ ] All configurations are readable

---

## API Endpoints Testing

### Authentication Endpoints
- [ ] `POST /api/auth/signup` - Creates new user
- [ ] `POST /api/auth/signin` - Returns session token
- [ ] User can use token for authenticated requests

### Score Endpoints
- [ ] `POST /api/scores` - Adds score (authenticated users only)
- [ ] `GET /api/scores` - Retrieves user's scores
- [ ] `DELETE /api/scores/:id` - Deletes score (owner only)

### Admin Endpoints
- [ ] `GET /api/admin/draws` - Returns all draws (admin only)
- [ ] `POST /api/admin/draws` - Creates draw (admin only)
- [ ] `POST /api/admin/winners` - Updates winner status (admin only)
- [ ] Non-admins receive 403 error

### Webhook Endpoints
- [ ] `POST /api/webhooks/stripe` - Processes Stripe events
- [ ] Subscription updates are recorded

---

## Responsive Design Testing

Test on different screen sizes:

### Mobile (375px)
- [ ] Navigation is accessible (sidebar or hamburger menu)
- [ ] Forms are usable without horizontal scroll
- [ ] Tables are readable (horizontal scroll if needed)
- [ ] Buttons are large enough to tap
- [ ] Images scale properly

### Tablet (768px)
- [ ] Layout adapts to tablet size
- [ ] Navigation is clear
- [ ] Forms display well
- [ ] Tables are readable

### Desktop (1440px)
- [ ] Full layout displays correctly
- [ ] Sidebar and main content side-by-side
- [ ] Multiple columns display properly
- [ ] All features are accessible

---

## Performance Testing

### Load Time
- [ ] Homepage loads in < 3 seconds
- [ ] Dashboard loads in < 2 seconds
- [ ] Admin pages load in < 2 seconds

### Database Queries
- [ ] No N+1 queries
- [ ] Queries return data quickly
- [ ] Indexes are working properly

### Network
- [ ] Check DevTools Network tab
- [ ] Bundle size is reasonable
- [ ] Images are optimized
- [ ] No unnecessary requests

---

## Security Testing

### Authentication
- [ ] Can't access `/dashboard` without login
- [ ] Can't access `/admin` without admin role
- [ ] Session expires appropriately
- [ ] Passwords are hashed in database

### Data Validation
- [ ] Email format is validated
- [ ] Golf scores are validated (1-45)
- [ ] Dates are validated
- [ ] File uploads are validated (if applicable)

### API Security
- [ ] Admin endpoints require authentication
- [ ] Users can't access other users' data
- [ ] CORS is properly configured
- [ ] SQL injection is prevented

---

## Email Testing

### Welcome Email
- [ ] New user receives welcome email
- [ ] Email contains correct information
- [ ] Links in email work

### Score Confirmation
- [ ] User receives confirmation after adding score
- [ ] Email shows correct score details

### Winner Notification
- [ ] Winner receives notification email
- [ ] Email contains prize amount and match type
- [ ] Email has action link for proof upload

### Admin Notifications
- [ ] Admin receives email for pending verifications
- [ ] Admin receives draw notifications

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Database Testing

### Data Integrity
- [ ] Users table has correct fields
- [ ] Golf scores are stored correctly
- [ ] Subscriptions are tracked accurately
- [ ] Draws data is complete
- [ ] Winners data is accurate

### RLS Policies
- [ ] Users can only see their own data
- [ ] Admins can see all data
- [ ] Public data is accessible to all

---

## Stripe Integration Testing

### Checkout Flow
- [ ] Can reach checkout page
- [ ] Stripe checkout loads
- [ ] Can complete test payment
- [ ] Subscription is created in database
- [ ] Webhook updates subscription status

### Test Cards
Use these Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Require Auth**: `4000 0025 0000 3155`

---

## Error Handling

### Expected Errors
- [ ] Invalid email shows error message
- [ ] Wrong password shows error message
- [ ] Database errors show user-friendly message
- [ ] Network errors are handled gracefully

### Edge Cases
- [ ] Very long strings in forms
- [ ] Special characters in inputs
- [ ] Rapid button clicks don't duplicate actions
- [ ] Page refresh doesn't lose form data

---

## Test Data Creation

Create test data to verify features:

1. **Test Users**:
   - Regular user (role: user)
   - Admin user (role: admin)

2. **Test Scores**:
   - 5 scores for a user (tests FIFO)
   - Recent and old scores

3. **Test Charities**:
   - At least 2-3 charities with full details

4. **Test Draws**:
   - Scheduled draw
   - Completed draw with winners

---

## Sign-Off Checklist

Before going to production:

- [ ] All public pages load correctly
- [ ] Authentication works (signup/signin/logout)
- [ ] User dashboard is fully functional
- [ ] Admin panel is accessible only to admins
- [ ] All admin features work
- [ ] API endpoints return correct data
- [ ] Database is properly configured
- [ ] Stripe integration works
- [ ] Email service is working
- [ ] Responsive design works on all devices
- [ ] No console errors on any page
- [ ] Performance is acceptable
- [ ] Security measures are in place
- [ ] Error handling is appropriate

---

## Known Issues & Workarounds

(Document any known issues found during testing)

---

## Test Result Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ / ❌ | |
| User Dashboard | ✅ / ❌ | |
| Score Management | ✅ / ❌ | |
| Admin Panel | ✅ / ❌ | |
| Admin Users Mgmt | ✅ / ❌ | |
| Admin Draws Mgmt | ✅ / ❌ | |
| Admin Winners Mgmt | ✅ / ❌ | |
| Stripe Integration | ✅ / ❌ | |
| Email Notifications | ✅ / ❌ | |
| Responsive Design | ✅ / ❌ | |
| Performance | ✅ / ❌ | |
| Security | ✅ / ❌ | |

---

For issues found, create a bug report with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/videos if applicable
- Browser and device information
