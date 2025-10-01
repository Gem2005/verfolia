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
      save_success,
      save_error_message,
    } = body;

    if (!session_id || !event_type) {
      return NextResponse.json(
        { error: "Missing required fields: session_id, event_type" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Prepare event data (only fields that exist in schema)
    const eventData = {
      session_id,
      event_type,
      step_number: step_number ?? null,
      step_name: step_name || null,
      time_spent_on_step: time_spent_on_step ?? null,
      template_id: template_id || null,
      theme_id: theme_id || null,
      save_success: save_success ?? null,
      save_error_message: save_error_message || null,
    };

    console.log('📊 Inserting event:', eventData);

    // Insert event record
    const { error } = await supabase
      .from('resume_creation_events')
      .insert(eventData);

    if (error) {
      console.error('❌ Error inserting creation event:', error);
      return NextResponse.json(
        { error: "Failed to save event", details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Event tracked successfully:', event_type);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Creation analytics error:', err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}