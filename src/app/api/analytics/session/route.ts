import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Get client IP from request headers
function getClientIP(req: NextRequest): string | null {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  return realIP || cfConnectingIP || null;
}

// Get geolocation from IP
async function getLocationFromIP(ip: string): Promise<{
  country: string | null;
  city: string | null;
  region: string | null;
}> {
  if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: null, city: null, region: null };
  }

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'verfolia-analytics/1.0' },
      signal: AbortSignal.timeout(3000)
    });
    
    if (!response.ok) {
      return { country: null, city: null, region: null };
    }

    const data = await response.json();
    
    return {
      country: data.country_name || null,
      city: data.city || null,
      region: data.region || null
    };
  } catch (error) {
    return { country: null, city: null, region: null };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      session_id,
      user_id,
      is_first_time_visitor,
      user_agent,
      referrer,
    } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: "Missing required field: session_id" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    const actualUserId = user?.id || user_id || null;
    
    // Extract IP and get location
    const ip = getClientIP(req);
    const location = ip ? await getLocationFromIP(ip) : { country: null, city: null, region: null };

    // Check if session exists
    const { data: existingSession } = await supabase
      .from('resume_creation_sessions')
      .select('session_id')
      .eq('session_id', session_id)
      .single();

    if (existingSession) {
      return NextResponse.json({ success: true, exists: true }, { status: 200 });
    }

    // Prepare session data with location
    const sessionData = {
      session_id,
      user_id: actualUserId,
      is_first_time_visitor: is_first_time_visitor ?? false,
      user_agent: user_agent || null,
      referrer: referrer || null,
      ip_address: ip,
      country: location.country,
      city: location.city,
      region: location.region,
    };

    const { error } = await supabase
      .from('resume_creation_sessions')
      .insert(sessionData);

    if (error) {
      // If duplicate key error, session already exists - that's OK
      if (error.code === '23505') {
        return NextResponse.json({ success: true, exists: true }, { status: 200 });
      }
      
      console.error('❌ Error creating session:', error);
      return NextResponse.json(
        { error: "Failed to create session", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, exists: false }, { status: 200 });
  } catch (err) {
    console.error('Session creation error:', err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
