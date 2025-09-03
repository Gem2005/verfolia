export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { resumeService } from '@/services/resume-service';

export async function GET() {
  try {
    const templates = await resumeService.getTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    // Guard: return empty list if table is missing or any error occurs
    return NextResponse.json([]);
  }
}
