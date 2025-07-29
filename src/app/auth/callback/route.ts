import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const success = searchParams.get('success');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development';
      const redirectUrl = success ? `${next}?success=${success}` : next;
      
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return redirect(`${origin}${redirectUrl}`);
      } else if (forwardedHost) {
        return redirect(`https://${forwardedHost}${redirectUrl}`);
      } else {
        return redirect(`${origin}${redirectUrl}`);
      }
    }
  }

  // return the user to an error page with instructions
  return redirect('/auth/auth-code-error');
}
