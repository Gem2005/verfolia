import { NextResponse } from 'next/server';
import { resumeService } from '@/services/resume-service';

export async function GET() {
  try {
    const themes = await resumeService.getThemes();
    return NextResponse.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to fetch themes', message: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}
