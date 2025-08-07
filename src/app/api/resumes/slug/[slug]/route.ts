import { NextRequest, NextResponse } from "next/server";
import { resumeService } from "@/services/resume-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const resume = await resumeService.getResumeBySlug(slug);

    // Only return public resumes via slug
    if (!resume.is_public) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Increment view count
    await resumeService.incrementViewCount(resume.id);

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error fetching resume by slug:", error);
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }
}
