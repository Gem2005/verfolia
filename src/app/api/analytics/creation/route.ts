import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      session_id,
      event_type,
      step_number,
      step_name,
      time_spent_on_step,
      template_id,
      theme_id,
      total_time_on_page,
      is_first_time_visitor,
      save_success,
      save_error_message,
      user_agent,
      referrer,
    } = body;

    if (!session_id || !event_type) {
      return NextResponse.json(
        { error: "Missing required fields: session_id, event_type" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Extract IP and other headers
    const ip = req.headers.get('x-forwarded-for') || 
              req.headers.get('x-real-ip') || 
              req.ip || 
              null;

    // Insert the analytics record
    const { error } = await supabase
      .from('resume_creation_analytics')
      .insert({
        session_id,
        user_id: user?.id || null,
        event_type,
        step_number,
        step_name,
        time_spent_on_step,
        template_id,
        theme_id,
        total_time_on_page,
        is_first_time_visitor,
        save_success,
        save_error_message,
        user_agent,
        ip_address: ip,
        referrer,
      });

    if (error) {
      console.error('Error inserting creation analytics:', error);
      return NextResponse.json(
        { error: "Failed to save analytics" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Creation analytics error:', err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}