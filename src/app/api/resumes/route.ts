import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { resumeService } from '@/services/resume-service';
import { uploadedFilesService } from '@/services/uploaded-files-service';

// Helper function to create a unique, URL-friendly slug from a title
function createSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and hyphens with a single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Add a short random string to the end to ensure it's always unique
  const randomString = Math.random().toString(36).substring(2, 8);

  return `${baseSlug}-${randomString}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to save your resume.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // THE FIX IS HERE: Changed "customSections" to "custom_sections" to match the database
    const {
      title,
      template_id,
      theme_id,
      is_public,
      personal_info,
      experience,
      education,
      skills,
      projects,
      certifications,
      languages,
      custom_sections,
      uploaded_file_path,
      uploaded_file_url,
      original_filename,
      file_size_bytes,
      mime_type,
      uploaded_at,
      uploaded_file_id, // NEW: ID from uploaded_resume_files table
    } = body;

    // Validate required fields
    if (!title || !template_id || !theme_id) {
      return NextResponse.json(
        { error: 'Missing required fields (title, template, or theme)' },
        { status: 400 }
      );
    }

    const resumeData = {
      user_id: user.id,
      title,
      slug: createSlug(title),
      template_id,
      theme_id,
      is_public,
      personal_info,
      experience,
      education,
      skills,
      projects,
      certifications,
      languages,
      custom_sections, // This now correctly uses the variable from the request
      view_count: 0,
      // Link to uploaded file if provided
      ...(uploaded_file_id && { uploaded_file_id }),
      // Include uploaded file metadata if provided (for backward compatibility)
      ...(uploaded_file_path && {
        uploaded_file_path,
        uploaded_file_url,
        original_filename,
        file_size_bytes,
        mime_type,
        uploaded_at
      })
    };

    const { data: newResume, error } = await supabase
      .from('resumes')
      .insert(resumeData)
      .select()
      .single();

    if (error) {
        console.error('Database insert error:', error);
        throw new Error(error.message);
    }

    // If uploaded_file_id was provided, mark the file as used
    if (uploaded_file_id && newResume) {
      try {
        await uploadedFilesService.associateFileWithResume(
          uploaded_file_id,
          newResume.id
        );
        console.log(
          `[Resume Create] Associated file ${uploaded_file_id} with resume ${newResume.id}`
        );
      } catch (fileError) {
        console.error('[Resume Create] Failed to associate file:', fileError);
        // Don't fail the request - resume was created successfully
      }
    }

    return NextResponse.json(newResume, { status: 201 });

  } catch (error) {
    console.error('Error creating resume:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: 'Failed to create resume', detail: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resumes = await resumeService.getUserResumes(user.id);

    return NextResponse.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}

