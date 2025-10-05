import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: "Missing required field: session_id" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update session completion status using correct column name
    const { error } = await supabase
      .from('resume_creation_sessions')
      .update({
        session_ended_at: new Date().toISOString(),
        completed: true,
      })
      .eq('session_id', session_id);

    if (error) {
      console.error('❌ Error completing session:', error);
      return NextResponse.json(
        { error: "Failed to complete session", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Session completion error:', err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
