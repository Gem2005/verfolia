import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get sessions and events using the new schema
    const { data: sessions, error: sessionsError } = await supabase
      .from('resume_creation_sessions')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }

    const { data: events, error: eventsError } = await supabase
      .from('resume_creation_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }

    // Process the data for summary
    const sessionSet = new Set(sessions?.map(s => s.session_id) || []);
    const completedSessions = sessions?.filter(s => s.session_completed) || [];

    const templateSelections = events?.filter(e => e.event_type === 'template_selection') || [];
    const themeSelections = events?.filter(e => e.event_type === 'theme_selection') || [];
    const sessionEndEvents = events?.filter(e => e.event_type === 'session_end') || [];
    
    // Calculate popular templates
    const templateCounts = templateSelections.reduce((acc: any, event) => {
      const templateId = event.template_id;
      if (templateId) {
        acc[templateId] = (acc[templateId] || 0) + 1;
      }
      return acc;
    }, {});

    // Calculate popular themes
    const themeCounts = themeSelections.reduce((acc: any, event) => {
      const themeId = event.theme_id;
      if (themeId) {
        acc[themeId] = (acc[themeId] || 0) + 1;
      }
      return acc;
    }, {});

    // Calculate step engagement
    const stepCounts = events?.reduce((acc: any, event) => {
      if (event.step_number !== null && event.step_number !== undefined) {
        acc[event.step_number] = (acc[event.step_number] || 0) + 1;
      }
      return acc;
    }, {}) || {};

    // Calculate average session duration from sessions table
    const completedSessionsData = sessions?.filter(s => s.session_completed && s.session_ended_at) || [];
    const avgSessionDuration = completedSessionsData.length > 0 ? 
      Math.round(completedSessionsData.reduce((sum, session) => {
        const duration = new Date(session.session_ended_at!).getTime() - new Date(session.created_at).getTime();
        return sum + duration / 1000; // Convert to seconds
      }, 0) / completedSessionsData.length) : 0;

    // First-time vs returning visitors
    const firstTimeVisitors = sessions?.filter(s => s.is_first_time_visitor).length || 0;
    const returningVisitors = (sessions?.length || 0) - firstTimeVisitors;

    const summary = {
      totalSessions: sessionSet.size,
      completedSessions: completedSessions.length,
      averageSessionDuration: avgSessionDuration,
      firstTimeVisitors,
      returningVisitors,
      popularTemplates: Object.entries(templateCounts)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      popularThemes: Object.entries(themeCounts)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      stepEngagement: Object.entries(stepCounts)
        .map(([step, count]) => ({ step: parseInt(step), count: count as number }))
        .sort((a, b) => a.step - b.step),
      conversionRate: sessionSet.size > 0 ? 
        Math.round((completedSessions.length / sessionSet.size) * 100) : 0,
    };

    return NextResponse.json({
      events: events?.slice(0, 100) || [], // Limit to last 100 events
      summary,
    });
  } catch (err) {
    console.error('Creation analytics error:', err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}