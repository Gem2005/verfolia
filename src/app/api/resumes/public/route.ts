import { NextRequest, NextResponse } from "next/server";
import { resumeService } from "@/services/resume-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate pagination parameters
    let limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50); // Max 50 items per page
    if (isNaN(limit) || limit < 1) limit = 12;
    
    let offset = parseInt(searchParams.get("offset") || "0");
    if (isNaN(offset) || offset < 0) offset = 0;
    
    const query = searchParams.get("query")?.trim() || "";
    const template = searchParams.get("template")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";

    let resumes;

    if (query) {
      // Search resumes with filters
      resumes = await resumeService.searchResumes(query, {
        template: template || undefined,
        category: category || undefined,
      });

      // Apply pagination after search
      resumes = resumes.slice(offset, offset + limit);
    } else {
      // Get paginated public resumes
      resumes = await resumeService.getPublicResumes(limit, offset);
    }

    return NextResponse.json({
      resumes,
      pagination: {
        limit,
        offset,
        hasMore: resumes.length === limit,
        total: resumes.length,
      },
    });
  } catch (error) {
    console.error("Error fetching public resumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}
