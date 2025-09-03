export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { resumeService } from '@/services/resume-service';

export async function GET() {
  try {
    const themes = await resumeService.getThemes();
    return NextResponse.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    // Guard: return empty list if table is missing or any error occurs
    return NextResponse.json([]);
  }
}
