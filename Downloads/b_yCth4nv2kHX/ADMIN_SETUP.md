# Golf Charity Platform - Admin Panel Setup Guide

## Overview

The Golf Charity Subscription Platform includes a comprehensive admin panel at `/admin` that is **only accessible to users with admin role**.

## Admin Access Control

The admin panel uses **role-based access control (RBAC)** to ensure only authorized administrators can access sensitive features. The system checks the user's role in the database before granting access.

### User Roles
- **`user`**: Regular subscriber - can access `/dashboard` but NOT `/admin`
- **`admin`**: Administrator - can access both `/dashboard` and `/admin`

---

## Creating Your First Admin User

### Method 1: Via the Application (Recommended)

1. **Sign up as a regular user:**
   - Visit `https://your-app.vercel.app/signup`
   - Create an account with your email and password
   - Complete the signup process

2. **Upgrade to Admin via Supabase:**
   - Go to your Supabase project dashboard: `https://app.supabase.com`
   - Navigate to **SQL Editor** or **Table Editor**
   - Find the `users` table
   - Locate your user record (search by email)
   - Change the `role` column from `'user'` to `'admin'`

3. **Access the Admin Panel:**
   - Log in to your dashboard at `/dashboard`
   - You'll now see an "Admin Panel" link in the sidebar (with Shield icon)
   - Click to access `/admin`

### Method 2: Direct Database Insert (Advanced)

If you prefer to create an admin user directly in the database:

1. Open your Supabase project
2. Go to **SQL Editor**
3. Create a user and set role to admin:

```sql
-- This assumes you've already created auth users through Supabase Auth
UPDATE users SET role = 'admin' WHERE email = 'your-admin@example.com';
```

---

## Admin Panel Features

Once logged in as admin, you have access to:

### 1. **Dashboard** (`/admin`)
- View key statistics
- Total users, active subscriptions, charities
- Pending winner verifications
- Quick action links to other admin features

### 2. **Users Management** (`/admin/users`)
- Search and filter users
- View user details (email, subscription status, registration date)
- Change user roles (promote/demote admin status)
- Delete users if necessary

### 3. **Charities Management** (`/admin/charities`)
- Add new partner charities
- View all charities with descriptions and websites
- Delete charities
- Manage charity images and information

### 4. **Draws Management** (`/admin/draws`)
- Create new monthly draws
- View all draws with their status
- Execute draws (generate winning numbers)
- Monitor prize pools and ticket counts
- View winning numbers (3-number, 4-number, 5-number matches)

### 5. **Winner Verification** (`/admin/winners`)
- Review pending winner proofs
- Approve verified winners
- Reject invalid submissions
- Track verified and rejected winners
- View prize amounts by match type

### 6. **Settings** (`/admin/settings`)
- Configure subscription pricing (monthly/yearly)
- Set discount percentages
- Configure charity allocation requirements
- View system status and integrations

---

## Admin Panel Security

### Authentication Flow

1. User navigates to `/admin`
2. Admin layout checks if user is authenticated
3. System verifies user role from database
4. If not admin:
   - User is redirected to `/dashboard`
   - Cannot access any admin routes

### Key Security Features

- **Role-Based Access Control**: Only `admin` role users can access admin panel
- **Session Validation**: User session is verified on every admin page load
- **Database Verification**: Role is checked directly from database (can't be spoofed)
- **API Protection**: All admin API endpoints verify user role before processing
- **Automatic Logout**: Session-based auth with auto-logout on session expiration

---

## Admin Credentials (After Setup)

Once you've promoted your user to admin:

**Email**: The email you signed up with
**Password**: The password you created during signup
**Access URL**: `https://your-app.vercel.app/admin`

### Important Notes
- Keep your admin credentials secure
- Do not share admin credentials with users
- Store credentials in a secure password manager
- Change password regularly through dashboard settings
- Use strong, unique passwords

---

## Testing Admin Access

To verify admin access is working correctly:

1. **As Regular User (should be denied):**
   - Sign up with one account
   - Try to navigate to `/admin`
   - You should be redirected to `/dashboard`

2. **As Admin User (should be allowed):**
   - Promote a user to admin in Supabase
   - Sign in with that account
   - Navigate to `/admin`
   - You should see the admin panel

---

## Troubleshooting

### "Access Denied" Error
- **Cause**: User role is not set to `'admin'` in database
- **Solution**: Check the `users` table in Supabase and update the `role` field to `'admin'`

### Admin Link Not Showing in Dashboard
- **Cause**: User role hasn't been updated yet
- **Solution**: 
  - Refresh the page (`Ctrl+R` or `Cmd+R`)
  - Sign out and sign back in
  - Check that `role` is set to `'admin'` in the database

### Can't Access Admin Panel After Promotion
- **Cause**: Session needs to be refreshed
- **Solution**: 
  - Sign out completely
  - Clear browser cache
  - Sign back in
  - Try accessing `/admin` again

### "Failed to load dashboard statistics"
- **Cause**: Database connection or Supabase credentials issue
- **Solution**:
  - Check that `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in environment variables
  - Verify Supabase project is accessible
  - Check that all required tables exist in database

---

## Managing Other Admins

You can promote other users to admin status:

1. Go to `/admin/users`
2. Find the user you want to promote
3. Click "Make Admin"
4. They'll gain access to `/admin` after logging out and back in

To demote an admin back to regular user:
1. Go to `/admin/users`
2. Find the admin you want to demote
3. Click "Remove Admin"

---

## API Endpoints Protected by Admin Role

All these endpoints verify `role === 'admin'` before processing:

- `POST /api/admin/draws` - Create/manage draws
- `POST /api/admin/winners` - Verify winners
- `GET /api/admin/draws` - List all draws
- `GET /api/admin/winners` - List winners

Regular users cannot access these endpoints even if they guess the URLs.

---

## Next Steps

1. ✅ Create your first admin user (follow Method 1 or 2 above)
2. ✅ Log in to the admin panel at `/admin`
3. ✅ Add charities to the platform
4. ✅ Create the first monthly draw
5. ✅ Invite users to sign up
6. ✅ Monitor subscriptions and manage draws

---

For more help, check the main README.md or contact support.
