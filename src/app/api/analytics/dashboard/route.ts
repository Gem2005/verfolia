import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Get aggregated analytics for user's dashboard
export async function GET() {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all user's resumes
    const { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select("id, title, slug")
      .eq("user_id", user.id);

    if (resumesError) {
      console.error("Error fetching resumes:", resumesError);
      return NextResponse.json(
        { error: "Failed to fetch resumes" },
        { status: 500 }
      );
    }

    if (!resumes || resumes.length === 0) {
      return NextResponse.json({
        totalViews: 0,
        avgViewDuration: 0,
        mostViewedResume: null,
        resumeAnalytics: [],
      });
    }

    const resumeIds = resumes.map((r) => r.id);

    // Fetch analytics for all resumes in one query
    const { data: analyticsData, error: analyticsError } = await supabase
      .from("resume_views")
      .select("resume_id, view_duration")
      .in("resume_id", resumeIds);

    if (analyticsError) {
      console.error("Error fetching analytics:", analyticsError);
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }

    // Process analytics data
    const resumeStats = new Map<
      string,
      { views: number; totalDuration: number }
    >();

    // Initialize all resumes with 0 stats
    resumes.forEach((resume) => {
      resumeStats.set(resume.id, { views: 0, totalDuration: 0 });
    });

    // Aggregate views and durations
    if (analyticsData) {
      analyticsData.forEach((view) => {
        const stats = resumeStats.get(view.resume_id);
        if (stats) {
          stats.views += 1;
          stats.totalDuration += view.view_duration || 0;
        }
      });
    }

    // Calculate totals and find most viewed
    let totalViews = 0;
    let totalWeightedDuration = 0;
    let mostViewedResume: {
      title: string;
      views: number;
      avgDuration: number;
    } | null = null;
    let maxViews = 0;

    const resumeAnalytics = resumes.map((resume) => {
      const stats = resumeStats.get(resume.id) || { views: 0, totalDuration: 0 };
      const avgDuration = stats.views > 0 ? stats.totalDuration / stats.views : 0;

      totalViews += stats.views;
      totalWeightedDuration += stats.totalDuration;

      // Track most viewed
      if (stats.views > maxViews) {
        maxViews = stats.views;
        mostViewedResume = {
          title: resume.title,
          views: stats.views,
          avgDuration,
        };
      }

      return {
        resumeId: resume.id,
        resumeTitle: resume.title,
        slug: resume.slug,
        views: stats.views,
        avgDuration,
      };
    });

    const avgViewDuration = totalViews > 0 ? totalWeightedDuration / totalViews : 0;

    return NextResponse.json({
      totalViews,
      avgViewDuration,
      mostViewedResume,
      resumeAnalytics,
    });
  } catch (error) {
    console.error("Error in dashboard analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
