import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Extract client IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  const clientIP = forwardedFor?.split(',')[0].trim() 
    || realIP 
    || cfConnectingIP 
    || 'unknown';

  // Add performance headers
  const response = await updateSession(request);
  
  // Add client IP header for API routes
  response.headers.set('x-client-ip', clientIP);
  
  // Add caching headers for static-like pages
  if (request.nextUrl.pathname === '/') {
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  }
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
