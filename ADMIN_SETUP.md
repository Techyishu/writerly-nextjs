# Admin Security Setup Guide

This guide will help you secure your admin panel so only authorized users can access it.

## 🔒 What We've Implemented

1. **Removed public registration** from admin login page
2. **Added role-based access control** with admin/super_admin roles
3. **Created protected admin routes** that check user permissions
4. **Added admin-only registration endpoint** with secret key
5. **Database functions** to check admin status

## 📋 Setup Steps

### Step 1: Add Environment Variable

Add this to your `.env.local` file:

```bash
ADMIN_REGISTRATION_KEY=your-super-secret-admin-key-here
```

**Important:** Use a strong, random key that only you know!

### Step 2: Run Database Migrations

Execute these SQL scripts in your Supabase SQL editor in order:

1. **First:** `add_admin_roles.sql` - Sets up the role system
2. **Then:** `fix_storage_policies.sql` - Fixes storage upload issues

### Step 3: Create Your First Admin User

You have two options:

#### Option A: Use the Setup Script (Recommended)
```bash
node setup_admin.js
```

#### Option B: Manual API Call
```bash
curl -X POST http://localhost:3000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "name": "Your Name",
    "password": "your-secure-password",
    "adminKey": "your-super-secret-admin-key-here"
  }'
```

### Step 4: Test Admin Access

1. Go to `/admin/login`
2. Log in with your admin credentials
3. You should now have access to the admin panel
4. Regular users can no longer register for admin access

## 🛡️ Security Features

### Role System
- **`user`**: Regular users (default)
- **`admin`**: Can access admin panel
- **`super_admin`**: Can promote/demote other admins

### Protected Routes
- `/admin` - Requires admin role
- `/admin/posts/*` - Requires admin role
- All admin routes now check permissions

### Database Functions
- `is_admin(user_id)` - Checks if user is admin
- `is_super_admin(user_id)` - Checks if user is super admin
- `promote_to_admin(user_id, role)` - Promote user to admin (super admin only)
- `demote_from_admin(user_id)` - Demote admin to regular user (super admin only)

## 🔧 Managing Admin Users

### Promote User to Admin (Super Admin Only)
```sql
SELECT promote_to_admin('user-uuid-here', 'admin');
```

### Demote Admin to Regular User (Super Admin Only)
```sql
SELECT demote_from_admin('user-uuid-here');
```

### Check Admin Status
```sql
SELECT 
  email,
  name,
  role,
  is_admin(id) as is_admin,
  is_super_admin(id) as is_super_admin
FROM users 
WHERE email = 'user@example.com';
```

## 🚨 Important Security Notes

1. **Keep your `ADMIN_REGISTRATION_KEY` secret** - This is the only way to create new admin users
2. **Only share admin credentials** with trusted team members
3. **Regular users can no longer register** for admin access
4. **All admin routes are now protected** and check user permissions
5. **Database functions ensure** only authorized users can access admin features

## 🔍 Troubleshooting

### "Access Denied" Error
- Make sure you're logged in with an admin account
- Check that the user has the correct role in the database

### "Super Admin Required" Error
- The action requires super admin privileges
- Only super admins can promote/demote other users

### Registration Fails
- Check that `ADMIN_REGISTRATION_KEY` is set correctly
- Ensure the database migrations have been run
- Verify the API endpoint is working

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your environment variables
3. Ensure all SQL migrations have been applied
4. Check the Supabase logs for database errors

Your admin panel is now secure! 🔐
