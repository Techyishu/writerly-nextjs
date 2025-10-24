# Writerly Blog Setup Guide

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd writerly-nextjs
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

3. **Database Setup**
   - Go to your Supabase SQL Editor
   - Run `add_admin_roles.sql` first
   - Run `fix_storage_policies_safe.sql` second

4. **Create Admin User**
   ```bash
   node setup_admin.js
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

## 🔐 Admin Setup

After running the SQL migrations, create your first admin user:

```bash
node setup_admin.js
```

Use the admin key from your `.env.local` file.

## 📚 Documentation

- `ADMIN_SETUP.md` - Detailed admin security setup
- `add_admin_roles.sql` - Database role system
- `fix_storage_policies_safe.sql` - File upload permissions

## 🎯 Features

- ✅ Secure admin panel with role-based access
- ✅ File upload with Supabase storage
- ✅ Visitor tracking with caching
- ✅ Smooth authentication flow
- ✅ Protected admin routes
