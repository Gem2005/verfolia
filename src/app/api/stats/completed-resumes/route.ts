import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Count resume_creation_sessions where completed is true
    const { count, error } = await supabase
      .from('resume_creation_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('completed', true);

    if (error) {
      return NextResponse.json(
        { count: 0 }, // Return 0 as fallback
        { status: 200 }
      );
    }

    return NextResponse.json({ count: count || 0 }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { count: 0 }, // Return 0 as fallback
      { status: 200 }
    );
  }
}
