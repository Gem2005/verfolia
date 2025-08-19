import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Get heatmap data for resume views by hour and day of week
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient();
    const { slug } = params;

    // Get the resume ID from the slug
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, title")
      .eq("slug", slug)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Get views heatmap data
    const { data: heatmapData, error: heatmapError } = await supabase.rpc(
      "get_resume_views_by_hour",
      {
        p_resume_id: resume.id,
      }
    );

    if (heatmapError) {
      console.error("Error fetching heatmap data:", heatmapError);
      return NextResponse.json(
        { error: "Failed to fetch heatmap data" },
        { status: 500 }
      );
    }

    // Process heatmap data for visualization
    // Initialize a 7x24 grid with zeros
    const heatmapGrid = Array(7)
      .fill(0)
      .map(() => Array(24).fill(0));

    // Fill in the grid with actual data
    heatmapData.forEach((item: any) => {
      heatmapGrid[item.day_of_week][item.hour_of_day] = item.view_count;
    });

    // Find the maximum view count for normalization
    const maxViewCount = Math.max(
      ...heatmapData.map((item: any) => item.view_count)
    );

    return NextResponse.json({
      resumeInfo: {
        id: resume.id,
        title: resume.title,
        slug,
      },
      heatmapData: {
        grid: heatmapGrid,
        maxValue: maxViewCount,
        rawData: heatmapData,
      },
    });
  } catch (error) {
    console.error("Error in heatmap API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
