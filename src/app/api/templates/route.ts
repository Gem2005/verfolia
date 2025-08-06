import { NextResponse } from 'next/server';
import { resumeService } from '@/services/resume-service';

export async function GET() {
  try {
    const templates = await resumeService.getTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
