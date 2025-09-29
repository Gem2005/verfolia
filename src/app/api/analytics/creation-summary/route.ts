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

    // Get creation events
    const { data: events, error } = await supabase
      .from('resume_creation_analytics')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching creation analytics:', error);
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }

    // Process the data for summary
    const sessions = new Set(events?.map(e => e.session_id) || []);
    const completedSessions = new Set(
      events?.filter(e => e.event_type === 'session_end' && e.save_success)
        .map(e => e.session_id) || []
    );

    const templateSelections = events?.filter(e => e.event_type === 'template_selection') || [];
    const themeSelections = events?.filter(e => e.event_type === 'theme_selection') || [];
    const pageViews = events?.filter(e => e.event_type === 'page_view') || [];
    
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

    // Calculate average session duration and time on page
    const avgSessionDuration = pageViews.length > 0 ? 
      Math.round(pageViews.reduce((sum, event) => sum + (event.total_time_on_page || 0), 0) / pageViews.length) : 0;

    // First-time vs returning visitors
    const firstTimeVisitors = pageViews.filter(e => e.is_first_time_visitor).length;
    const returningVisitors = pageViews.filter(e => !e.is_first_time_visitor).length;

    const summary = {
      totalSessions: sessions.size,
      completedSessions: completedSessions.size,
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
      conversionRate: sessions.size > 0 ? 
        Math.round((completedSessions.size / sessions.size) * 100) : 0,
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