import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Get basic analytics for a resume
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    // Get the resume ID from the slug
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, title")
      .eq("slug", slug)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Get engagement metrics
    let metrics: any = {};
    try {
      const { data, error } = await supabase.rpc(
        "get_resume_engagement_metrics",
        {
          p_resume_id: resume.id,
        }
      );

      if (error) {
        console.error("Error fetching engagement metrics:", error);
      } else {
        metrics = data;
      }
    } catch (error) {
      console.error("Error in engagement metrics:", error);
      // Continue with empty metrics instead of failing the whole request
    }

    // Get views over time (last 30 days)
    let viewsOverTime: any[] = [];
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase.rpc("get_resume_views_over_time", {
        p_resume_id: resume.id,
        p_start_date: thirtyDaysAgo.toISOString(),
        p_end_date: new Date().toISOString(),
        p_interval: "day",
      });

      if (error) {
        console.error("Error fetching views over time:", error);
      } else {
        viewsOverTime = data;
      }
    } catch (error) {
      console.error("Error in views over time:", error);
      // Continue with empty views data instead of failing the whole request
    }

    // Get geographic distribution
    let geoDistribution: any[] = [];
    try {
      // First try the RPC function
      const { data, error } = await supabase.rpc(
        "get_geographic_view_distribution",
        {
          p_resume_id: resume.id,
        }
      );

      if (error) {
        console.error("Error fetching geographic distribution:", error);

        // Fallback to direct query if the RPC fails
        // Instead of using the complex groupBy query, just fetch all views and process them in memory
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: viewData, error: viewError } = await supabase
          .from("resume_views")
          .select("country")
          .eq("resume_id", resume.id)
          .gte("viewed_at", thirtyDaysAgo.toISOString());

        if (viewError) {
          console.error("Error in fallback geographic query:", viewError);
        } else if (viewData) {
          // Process the data to group by country
          const countryMap: Record<string, number> = {};
          viewData.forEach((view: any) => {
            const country = view.country || "Unknown";
            countryMap[country] = (countryMap[country] || 0) + 1;
          });

          // Transform to expected format
          geoDistribution = Object.entries(countryMap).map(([name, count]) => ({
            name,
            count,
          }));
        }
      } else {
        geoDistribution = data;
      }
    } catch (fallbackError) {
      console.error(
        "Error in geographic distribution fallback:",
        fallbackError
      );
      // Continue with empty geo data instead of failing the whole request
    }

    // Get device analytics
    let deviceAnalytics: any[] = [];
    try {
      const { data, error } = await supabase.rpc("get_device_analytics", {
        p_resume_id: resume.id,
      });

      if (error) {
        console.error("Error fetching device analytics:", error);
      } else {
        deviceAnalytics = data;
      }
    } catch (error) {
      console.error("Error in device analytics:", error);
      // Continue with empty device data instead of failing the whole request
    }

    // Get referrer analytics
    let referrerAnalytics: any[] = [];
    try {
      const { data, error } = await supabase.rpc("get_referrer_analytics", {
        p_resume_id: resume.id,
      });

      if (error) {
        console.error("Error fetching referrer analytics:", error);
      } else {
        referrerAnalytics = data;
      }
    } catch (error) {
      console.error("Error in referrer analytics:", error);
      // Continue with empty referrer data instead of failing the whole request
    }

    // Get section popularity
    let sectionPopularity: any[] = [];
    try {
      const { data, error } = await supabase.rpc("get_section_popularity", {
        p_resume_id: resume.id,
      });

      if (error) {
        console.error("Error fetching section popularity:", error);
      } else {
        sectionPopularity = data;
      }
    } catch (error) {
      console.error("Error in section popularity:", error);
      // Continue with empty section data instead of failing the whole request
    }

    // Combine all analytics data
    const analyticsData = {
      resumeInfo: {
        id: resume.id,
        title: resume.title,
        slug,
      },
      engagementMetrics: metrics || {},
      viewsOverTime: viewsOverTime || [],
      geoDistribution: geoDistribution || [],
      deviceAnalytics: deviceAnalytics || [],
      referrerAnalytics: referrerAnalytics || [],
      sectionPopularity: sectionPopularity || [],
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error in analytics API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// Compare two time periods
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;
    const { period1Start, period1End, period2Start, period2End } =
      await req.json();

    // Validate the request body
    if (!period1Start || !period1End || !period2Start || !period2End) {
      return NextResponse.json(
        { error: "Missing required time period parameters" },
        { status: 400 }
      );
    }

    // Get the resume ID from the slug
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id")
      .eq("slug", slug)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Get comparison metrics
    const { data: comparisonData, error: comparisonError } = await supabase.rpc(
      "compare_resume_metrics",
      {
        p_resume_id: resume.id,
        p_period_1_start: period1Start,
        p_period_1_end: period1End,
        p_period_2_start: period2Start,
        p_period_2_end: period2End,
      }
    );

    if (comparisonError) {
      console.error("Error fetching comparison metrics:", comparisonError);
      return NextResponse.json(
        { error: "Failed to fetch comparison metrics" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      resumeId: resume.id,
      comparisonData,
    });
  } catch (error) {
    console.error("Error in analytics comparison API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// Note: The code below is commented out as it's been replaced by Supabase RPC functions above
// Example of the original SQL query for reference:
/*
SELECT v.country, COUNT(*) as view_count, 
ROUND((COUNT(*) * 100.0 / total_views), 1) as percentage
FROM views v, (SELECT COUNT(*) as total_views FROM views WHERE resume_slug = $1) as total
WHERE v.resume_slug = $1
GROUP BY v.country
ORDER BY view_count DESC
LIMIT 10
*/
