# Sanity CMS Setup Guide

## 1. Create Sanity Project

1. Go to [sanity.io](https://sanity.io) and sign up/login
2. Create a new project:
   - Project name: "Writerly Blog"
   - Dataset: "production"
   - Template: "Clean project with no predefined schemas"

## 2. Get Project Credentials

After creating the project, you'll get:
- **Project ID**: Found in your project dashboard
- **Dataset**: Usually "production"
- **API Token**: Create one in Project Settings > API > Tokens

## 3. Update Environment Variables

Create/update your `.env.local` file:

```env
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-api-token-here
```

## 4. Install Sanity Studio (Optional)

If you want the Sanity Studio admin panel:

```bash
npm install sanity
npx sanity init --env
```

This will create a studio folder with the admin panel.

## 5. Deploy to Vercel

1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## 6. Create Your First Post

1. Go to your Sanity Studio (if installed) at `/studio`
2. Or use the API to create posts programmatically
3. Or use your custom admin panel at `/admin`

## 7. Sanity Studio Features

- **Rich Text Editor**: Advanced formatting
- **Image Management**: Automatic optimization
- **Real-time Preview**: See changes instantly
- **Collaboration**: Multiple editors
- **Version Control**: Content history

## 8. API Usage

Your blog now uses Sanity's API:

```typescript
// Get all published posts
const posts = await sanityClient.fetch('*[_type == "post" && published == true]')

// Create a new post
const post = await sanityClient.create({
  _type: 'post',
  title: 'My Post',
  content: 'Post content...',
  published: true
})
```

## 9. Benefits Over Supabase

✅ **No database setup** - Sanity handles everything
✅ **Professional admin panel** - Sanity Studio
✅ **Image optimization** - Automatic
✅ **Real-time collaboration** - Multiple editors
✅ **Content versioning** - History tracking
✅ **Free hosting** - No server costs
✅ **Better performance** - CDN included

## 10. Migration Complete

Your blog is now powered by Sanity! 

- Frontend: Next.js on Vercel
- CMS: Sanity (hosted)
- Images: Sanity CDN
- Admin: Sanity Studio or custom panel
