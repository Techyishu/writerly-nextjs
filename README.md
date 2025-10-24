# Writerly Blog - Next.js + Sanity

A modern, beautiful blog platform built with Next.js 14, Sanity CMS, and Tailwind CSS.

## Features

- 🎨 **Beautiful Design**: Modern, responsive design with cosmic background
- 📝 **Blog Management**: Create, edit, and manage blog posts
- 🔐 **Admin Panel**: Secure admin interface for content management
- 📱 **Mobile Responsive**: Optimized for all device sizes
- ⚡ **Fast Performance**: Built with Next.js 14 and optimized for speed
- 🎯 **SEO Optimized**: Meta tags and structured data for better search visibility

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Sanity CMS (Content Management, Media Storage)
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone and Install

```bash
cd writerly-nextjs
npm install
```

### 2. Set up Sanity CMS

1. Create a new project at [sanity.io](https://sanity.io)
2. Get your project ID and API token
3. Follow the setup guide in `SANITY_SETUP.md`

### 3. Environment Variables

**⚠️ IMPORTANT: You must create a `.env.local` file before running the application!**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-sanity-api-token
```

**To get your Sanity credentials:**
1. Go to your Sanity project dashboard
2. Copy the "Project ID" from the project settings
3. Generate an API token with Editor permissions
4. Replace the placeholder values in your `.env.local` file

**Example:**
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123def
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk1234567890abcdef...
```

### 4. Run Sanity Studio

```bash
cd sanity
npm install
npm run dev
```

This will start the Sanity Studio at `http://localhost:3333` where you can manage your content.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
writerly-nextjs/
├── src/
│   ├── app/                 # Next.js 14 app directory
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and configurations
│   └── pages/              # Page components
├── sanity/                 # Sanity Studio configuration
│   └── schemas/            # Sanity content schemas
├── public/                 # Static assets
└── package.json
```

## Admin Panel

The admin panel is accessible at `/admin` and provides:

- **Dashboard**: Overview of all blog posts
- **Create Post**: Add new blog posts with rich content
- **Edit Post**: Modify existing blog posts
- **Post Management**: Publish/unpublish, feature posts
- **Media Management**: Upload and manage images

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_TOKEN`
4. Deploy!

### Deploy Sanity Studio

The Sanity Studio can be deployed separately or run locally. For production, consider deploying it to Sanity's hosting or your own server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).