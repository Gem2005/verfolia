import { NextRequest, NextResponse } from "next/server";

// Helper: fetch geo data from IP-API if needed
async function fetchGeoFromIP(ip: string) {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,city,regionName,lat,lon`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return {};
    const geo = await res.json();
    if (geo.status !== "success") return {};
    return {
      country: geo.country || null,
      city: geo.city || null,
      region: geo.regionName || null,
      latitude: geo.lat ?? null,
      longitude: geo.lon ?? null,
    };
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If not configured, no-op to avoid 500s in preview/dev
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
    }

    // Extract geo headers (Vercel/production)
    const headers = req.headers;
    const ip =
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headers.get("x-real-ip") ||
      headers.get("cf-connecting-ip") ||
      headers.get("x-client-ip") ||
      null;

    const geo: Record<string, string | number | null> = {
      ipAddress: ip,
      country:
        headers.get("x-vercel-ip-country") ||
        headers.get("x-vercel-ip-country-code") ||
        headers.get("cf-ipcountry") ||
        null,
      city:
        headers.get("x-vercel-ip-city") ||
        headers.get("cf-ipcity") ||
        null,
      region:
        headers.get("x-vercel-ip-country-region") ||
        headers.get("cf-region") ||
        null,
      latitude: headers.get("x-vercel-ip-latitude") || null,
      longitude: headers.get("x-vercel-ip-longitude") || null,
    };

    // If missing geo info (localhost/dev), try IP-API
    if (
      (!geo.country || !geo.city || !geo.region) &&
      ip &&
      ip !== "127.0.0.1" &&
      ip !== "::1" &&
      ip !== "localhost"
    ) {
      const ipGeo = await fetchGeoFromIP(ip);
      geo.country = geo.country || ipGeo.country || null;
      geo.city = geo.city || ipGeo.city || null;
      geo.region = geo.region || ipGeo.region || null;
      geo.latitude = geo.latitude || ipGeo.latitude || null;
      geo.longitude = geo.longitude || ipGeo.longitude || null;
    }

    // Merge geo data into payload (do not overwrite if already present)
    const enrichedPayload = {
      ...payload,
      ipAddress: payload.ipAddress || geo.ipAddress || null,
      country: payload.country || geo.country || null,
      city: payload.city || geo.city || null,
      region: payload.region || geo.region || null,
      latitude: payload.latitude || geo.latitude || null,
      longitude: payload.longitude || geo.longitude || null,
    };

    const resp = await fetch(`${supabaseUrl}/functions/v1/track-analytics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(enrichedPayload),
      cache: "no-store",
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: "upstream_failed", detail: text || resp.statusText },
        { status: 200 } // don't break UX; treat as soft success
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "bad_request", detail: (err as Error).message },
      { status: 200 }
    );
  }
}


