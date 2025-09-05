import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If not configured, no-op to avoid 500s in preview/dev
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
    }

    const resp = await fetch(`${supabaseUrl}/functions/v1/track-analytics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(payload),
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


