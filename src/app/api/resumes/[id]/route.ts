import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resumeService } from "@/services/resume-service";
import { deleteResumeFile } from "@/lib/supabase-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const resume = await resumeService.getResumeById(id);
    
    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this resume
    if (!resume.is_public && (!user || user.id !== resume.user_id)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Track view if it's a public resume and not the owner viewing
    if (resume.is_public && (!user || user.id !== resume.user_id)) {
      await resumeService.trackResumeView(id);
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Verify user owns this resume
    const existingResume = await resumeService.getResumeById(id);
    if (!existingResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    if (existingResume.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedResume = await resumeService.updateResume(id, body);

    return NextResponse.json(updatedResume);
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the resume directly using server-side client to verify ownership and get file path
    const { data: existingResume, error: fetchError } = await supabase
      .from('resumes')
      .select('id, user_id, uploaded_file_path')
      .eq('id', id)
      .single();

    if (fetchError || !existingResume) {
      console.error('Error fetching resume for deletion:', fetchError);
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (existingResume.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete resume from database first
    const { error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting resume from database:', deleteError);
      return NextResponse.json(
        { error: "Failed to delete resume from database" },
        { status: 500 }
      );
    }

    // If resume has an uploaded file, delete it from storage
    // Continue even if storage deletion fails since DB record is already gone
    if (existingResume.uploaded_file_path) {
      try {
        await deleteResumeFile(existingResume.uploaded_file_path);
      } catch (storageError) {
        console.error("Failed to delete file from storage:", storageError);
        // Don't fail the request - DB deletion succeeded
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
}
