import { NextRequest, NextResponse } from "next/server";
import { resumeService } from "@/services/resume-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const resume = await resumeService.getResumeBySlug(slug);

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    // Only return public resumes via slug
    if (!resume.is_public) {
      return NextResponse.json(
        { error: "This resume is private" },
        { status: 403 }
      );
    }

    // Increment view count
    try {
      await resumeService.incrementViewCount(resume.id);
    } catch (error) {
      // Log the error but don't fail the request if view count update fails
      console.error("Error incrementing view count:", error);
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error fetching resume by slug:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Internal server error", message: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
