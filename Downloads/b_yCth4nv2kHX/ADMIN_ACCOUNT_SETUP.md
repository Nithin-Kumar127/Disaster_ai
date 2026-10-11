# Admin Account Setup Guide

## Option 1: Create Admin Via Web App (Recommended)

### Step 1: Sign Up
1. Go to your app's `/signup` page
2. Enter your email and password
3. Complete the signup process
4. You'll be logged in automatically

### Step 2: Promote to Admin in Supabase
1. Go to **Supabase Dashboard**: https://supabase.com
2. Select your project
3. Navigate to **SQL Editor**
4. Run this command (replace email with yours):
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```
5. Click **Execute**

### Step 3: Verify Admin Access
1. Sign out from the app
2. Sign back in with your credentials
3. Go to `/dashboard`
4. You should see **"Admin Panel"** link in the sidebar
5. Click it and access `/admin`

---

## Option 2: Create Admin Directly in Supabase (SQL)

```sql
-- Create admin user directly in database
INSERT INTO users (id, email, name, role, created_at)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  'Admin User',
  'admin',
  NOW()
);
```

**Note**: The password would need to be set through Supabase Auth separately.

---

## Example Admin Credentials (RECOMMENDED VALUES)

**Email**: admin@golfcharity.com
**Password**: AdminPass@2024

### How to Set This Up:

1. Sign up at `/signup` with email: `admin@golfcharity.com` and password: `AdminPass@2024`
2. Run the SQL from Step 2 above to promote this user to admin
3. Now you can login at `/signin` with these credentials

---

## Access Points

| Page | URL | Access |
|------|-----|--------|
| Sign Up | `/signup` | Public |
| Sign In | `/signin` | Public |
| User Dashboard | `/dashboard` | Logged-in users |
| Admin Panel | `/admin` | Admins only |

---

## Security Notes

✅ Passwords are hashed using bcryptjs
✅ Only users with `role: 'admin'` can access `/admin`
✅ Every admin page verifies the user's role from the database
✅ Non-admins are automatically redirected to `/dashboard`

---

## Troubleshooting

**Problem**: Admin link doesn't appear in sidebar
- **Solution**: Make sure you've promoted your user to admin in Supabase and refreshed the browser

**Problem**: `/admin` page redirects to `/signin`
- **Solution**: Your role is not set to `'admin'` in the database. Check the `users` table.

**Problem**: Password won't work
- **Solution**: Use the `/signup` page to create a new account (passwords are hashed, can't be reset manually)
