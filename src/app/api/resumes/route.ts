import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { resumeService } from '@/services/resume-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      templateId,
      themeId,
      isPublic,
      personalInfo,
      experience,
      education,
      skills,
      projects,
      certifications,
      languages,
      customSections
    } = body;

    // Validate required fields
    if (!title || !templateId || !themeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const resumeData = {
      user_id: user.id,
      title,
      template_id: templateId,
      theme_id: themeId,
      is_public: isPublic,
      personal_info: personalInfo,
      experience,
      education,
      skills,
      projects,
      certifications,
      languages,
      custom_sections: customSections,
      slug: title.toLowerCase().replace(/[^\w-]+/g, '-'), // Convert title to URL-friendly slug
      view_count: 0 // Initialize view count to 0
    };

    const resume = await resumeService.createResume(resumeData);

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json(
      { error: 'Failed to create resume' },
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
