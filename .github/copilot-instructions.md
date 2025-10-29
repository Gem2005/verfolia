# Verfolia Copilot Instructions

## Project Overview
Verfolia is a Next.js 15 resume analytics platform with comprehensive tracking capabilities. Users create resumes using AI-powered parsing and view detailed analytics on resume performance.

## Architecture & Key Patterns

### Core Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, Supabase (PostgreSQL), Supabase Edge Functions
- **State Management**: Zustand for auth, React hooks for data fetching
- **Analytics**: Custom tracking system with session management

### Service Layer Architecture
Services follow singleton pattern exported from class instances:
```typescript
// Pattern: Class-based services with singleton exports
class ResumeService {
  private supabase = createClient();
  // ... methods
}
export const resumeService = new ResumeService();
```

Key services: `resumeService`, `analyticsService`, `authService`, `uploadedFilesService`

### Supabase Integration Patterns
- **Client**: `createClient()` from `@/utils/supabase/client` for browser-side
- **Server**: `createClient()` from `@/utils/supabase/server` for API routes
- **Auth**: Row Level Security (RLS) policies, uses `auth.users` table directly (no profiles table)
- **Storage**: Admin client in `@/lib/supabase-storage` for file operations

### Analytics System (Major Feature)
Sophisticated analytics tracking with multiple components:
- **View Tracking**: `ResumeViewTracker` component wraps resume templates
- **Interaction Tracking**: `TrackableLink` and session-based tracking
- **Data Flow**: Client → Edge Function → Database (resume_views, resume_interactions tables)
- **Session Management**: 30-minute sessions via `sessionStorage` and UUID generation
- **Calculations**: Complex metrics in `@/lib/analytics/calculations.ts`

## Development Workflows

### Environment Setup
```bash
npm install
cp env.example .env.local
# Fill in Supabase credentials
npm run dev  # Starts on localhost:3000
```

### Database Schema
Key tables: `resumes`, `resume_views`, `resume_interactions`, `uploaded_resume_files`
- Views and RPC functions provide optimized analytics queries
- Migration files in `supabase/migrations/`

### Resume Creation Flow
1. Multi-step wizard in `/create-resume` with template selection
2. AI parsing via `/api/parse-resume` (Google Gemini integration)
3. Template rendering with `DynamicTemplateRenderer` and direct imports
4. Storage pattern: localStorage for drafts, Supabase for published resumes

### Error Handling Patterns
- API routes return structured JSON with error types
- Client-side uses toast notifications (Sonner)
- Services throw errors, components handle with try/catch
- Fallback patterns for non-critical features (analytics, geo data)

## Code Conventions

### File Organization
- API routes: `/src/app/api/` following App Router patterns
- Components: Organized by feature in `/src/components/`
- Services: Single-purpose classes in `/src/services/`
- Hooks: Custom hooks in `/src/hooks/` (use-analytics-data, use-auth, etc.)

### Import Patterns
```typescript
// Internal imports use @ alias
import { createClient } from "@/utils/supabase/client";
import { resumeService } from "@/services/resume-service";
import type { ResumeData } from "@/types/ResumeData";
```

### Component Patterns
- Server Components for data fetching in app directory
- Client Components marked with "use client" for interactivity
- Form actions use server actions pattern from Next.js 14+

## Critical Implementation Details

### Authentication Flow
- Middleware handles session refresh in `/src/app/middleware.ts`
- Auth callbacks in `/src/app/auth/callback/route.ts`
- Zustand store for client-side auth state

### Analytics Tracking (Don't Break This!)
- **Owner Check**: Analytics only track when `!isOwner` (prevents self-inflation)
- **Session ID**: Generated client-side, persists 30 minutes
- **Edge Function**: Uses direct URL to Supabase edge function, not API route proxy
- **Template Integration**: `ResumeViewTracker` must wrap templates for tracking

### File Upload System
- Support for PDF, DOCX parsing with AI extraction
- Temporary storage in `uploaded_resume_files` table
- Cleanup job at `/api/cleanup-orphaned-files` for maintenance

### Performance Optimizations
- Bundle analyzer configured, modular imports for Lucide React
- Image optimization with Next.js Image component
- Database views for complex analytics queries instead of joins

## Integration Points

### AI Resume Parser
- Google Gemini integration in `/api/parse-resume`
- Handles PDF (pdf2json), DOCX (mammoth), DOC (mammoth)
- Structured data extraction with validation

### External Services
- Supabase: Database, Auth, Storage, Edge Functions
- Google AI: Resume parsing via Gemini
- Vercel: Deployment, Cron jobs for cleanup

## Testing & Debugging

### Analytics Testing
- Use incognito mode to test tracking (avoids owner detection)
- Check browser DevTools Network tab for `track-analytics` requests
- Verify session IDs in console logs
- Database queries in `/docs/analytics-testing-guide.md`

### Common Debugging Commands
```bash
# Check analytics data
SELECT * FROM resume_views ORDER BY viewed_at DESC LIMIT 10;

# Verify tracking setup
SELECT session_id, COUNT(*) FROM resume_views GROUP BY session_id;
```

When working on this codebase, always consider the analytics implications of changes to resume viewing flows, and test tracking functionality thoroughly.