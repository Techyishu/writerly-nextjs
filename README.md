# Writerly Blog - Next.js + Supabase

A modern, beautiful blog platform built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- 🎨 **Beautiful Design**: Modern, responsive design with cosmic background
- 📝 **Blog Management**: Create, edit, and manage blog posts
- 🔐 **Admin Panel**: Secure authentication and admin dashboard
- 📊 **Analytics**: Visitor tracking and analytics
- 🚀 **Performance**: Optimized for speed with Next.js
- ☁️ **Deployment**: Ready for Vercel deployment

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone and Install

```bash
cd writerly-nextjs
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase-schema.sql
```

### 3. Environment Variables

**⚠️ IMPORTANT: You must create a `.env.local` file before running the application!**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**To get your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Replace the placeholder values in your `.env.local` file

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Create Admin User

1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Create a new user with email and password
4. Go to Table Editor > users
5. Create a user record with the same email

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy!

### 3. Set up Supabase Production

1. Create a new Supabase project for production
2. Run the same SQL schema
3. Update environment variables in Vercel

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── admin/          # Admin pages
│   ├── post/[slug]/    # Blog post pages
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # UI components
│   └── ...            # Other components
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── lib/               # Utilities
└── pages/             # Page components
```

## Features

### Blog Features
- Responsive design
- Beautiful cosmic background
- Blog post cards with categories
- Reading time estimation
- Featured posts
- Search and filtering

### Admin Features
- Secure authentication
- Post creation and editing
- Image upload
- Publish/unpublish posts
- Visitor analytics
- User management

### Technical Features
- Server-side rendering
- API routes
- Database integration
- File storage
- Real-time updates
- SEO optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.