import { NextRequest, NextResponse } from 'next/server';
import { resumeService } from '@/services/resume-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');
    const query = searchParams.get('query') || '';
    const template = searchParams.get('template') || '';
    const category = searchParams.get('category') || '';

    let resumes;

    if (query) {
      // Search resumes
      resumes = await resumeService.searchResumes(query, {
        template: template || undefined,
        category: category || undefined,
      });
    } else {
      // Get public resumes
      resumes = await resumeService.getPublicResumes(limit, offset);
    }

    return NextResponse.json({
      resumes,
      pagination: {
        limit,
        offset,
        total: resumes.length
      }
    });
  } catch (error) {
    console.error('Error fetching public resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}
