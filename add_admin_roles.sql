-- Add admin role system to database
-- Run this in your Supabase SQL editor

-- 1. Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- 2. Create admin users table for better admin management
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_uuid 
    AND role IN ('admin', 'super_admin')
  ) OR EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_uuid 
    AND role = 'super_admin'
  ) OR EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add RLS policies for admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users
CREATE POLICY "Admins can view admin users" ON admin_users
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Only super admins can insert/update/delete admin users
CREATE POLICY "Super admins can manage admin users" ON admin_users
FOR ALL TO authenticated
USING (is_super_admin(auth.uid()));

-- 6. Update users table RLS to respect admin roles
-- Only admins can view all users
CREATE POLICY "Admins can view all users" ON users
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON users
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- 7. Create function to promote user to admin (super admin only)
CREATE OR REPLACE FUNCTION promote_to_admin(target_user_id UUID, admin_role TEXT DEFAULT 'admin')
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is super admin
  IF NOT is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can promote users to admin';
  END IF;
  
  -- Update user role
  UPDATE users 
  SET role = admin_role, updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Also add to admin_users table
  INSERT INTO admin_users (user_id, role, created_by)
  VALUES (target_user_id, admin_role, auth.uid())
  ON CONFLICT (user_id) DO UPDATE SET
    role = admin_role,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to demote admin (super admin only)
CREATE OR REPLACE FUNCTION demote_from_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is super admin
  IF NOT is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can demote users from admin';
  END IF;
  
  -- Update user role to regular user
  UPDATE users 
  SET role = 'user', updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Remove from admin_users table
  DELETE FROM admin_users WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
