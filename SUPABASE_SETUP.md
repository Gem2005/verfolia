# Supabase Backend Setup Guide

This guide will help you set up the Supabase backend for your Verfolia resume builder application.

## Prerequisites

1. Node.js and npm installed
2. A Supabase account (sign up at [supabase.com](https://supabase.com))

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `verfolia-backend`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **Anon (public) key** (starts with `eyJ...`)
   - **Service role key** (starts with `eyJ...` - keep this secret!)

## Step 3: Set Up Environment Variables

1. In your project root (`/Users/harshitha/Desktop/verfolia/`), create a `.env.local` file:

```bash
# Copy from .env.local.example and fill in your values
cp .env.local.example .env.local
```

2. Edit `.env.local` with your actual Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here

# Database URL (for migrations)
DATABASE_URL=postgresql://postgres:your-db-password@db.your-project-ref.supabase.co:5432/postgres
```

## Step 4: Initialize Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query and run the initialization script:

```sql
-- Copy and paste the contents of schema/init.sql
-- This will create all tables, functions, and initial data
```

3. Run the security policies:

```sql
-- Copy and paste the contents of schema/security.sql
-- This sets up Row Level Security (RLS) policies
```

## Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure **Site URL**: `http://localhost:3000`
3. Configure **Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000` (for logout)

### Enable OAuth Providers (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Google**:
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
3. Enable **GitHub**:
   - Go to GitHub → Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Authorization callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`

## Step 6: Install Dependencies

Make sure you have the required packages:

```bash
npm install @supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs
```

## Step 7: Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Open `http://localhost:3000`
3. Try to sign up/sign in
4. Create a test resume
5. Check if data appears in Supabase dashboard under **Table Editor**

## Database Structure

The following tables will be created:

- **profiles** - User profile information
- **resumes** - Main resume data
- **resume_analytics** - View tracking and analytics
- **saved_resumes** - User-saved public resumes
- **templates** - Available resume templates
- **themes** - Available color themes
- **user_subscriptions** - Premium subscription data

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Public resumes are viewable by everyone
- Analytics data is protected
- Service role key required for admin operations

## API Endpoints

The following API routes are available:

- `POST /api/resumes` - Create new resume
- `GET /api/resumes` - Get user's resumes
- `GET /api/resumes/[id]` - Get specific resume
- `PUT /api/resumes/[id]` - Update resume
- `DELETE /api/resumes/[id]` - Delete resume
- `GET /api/resumes/slug/[slug]` - Get public resume by slug
- `GET /api/resumes/public` - Browse public resumes
- `GET /api/templates` - Get available templates
- `GET /api/themes` - Get available themes

## Troubleshooting

### Common Issues:

1. **"Invalid API key"** - Check your environment variables
2. **"Failed to fetch"** - Verify project URL and network connection
3. **"Row Level Security policy violated"** - Check RLS policies are set up correctly
4. **"Function does not exist"** - Make sure you ran the init.sql script

### Debug Steps:

1. Check Supabase logs in dashboard under **Logs**
2. Verify environment variables are loaded: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
3. Test connection in browser dev tools: Network tab for API calls
4. Check table permissions in **Authentication** → **Policies**

## Production Deployment

When deploying to production:

1. Update Site URL and Redirect URLs in Supabase Auth settings
2. Add production domain to CORS origins
3. Update environment variables on your hosting platform
4. Enable database backups in Supabase dashboard
5. Set up monitoring and alerting

## Need Help?

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project issues: Create an issue in your repository

---

Your Supabase backend is now ready to handle resume data storage, user authentication, and all the features of your Verfolia application!
