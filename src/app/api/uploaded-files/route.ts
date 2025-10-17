import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/uploaded-files
 * List all uploaded files for authenticated user
 * Query params:
 *   - includeUsed: boolean (default: true) - whether to include files already used in resumes
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const includeUsed = searchParams.get('includeUsed') !== 'false';

    // Fetch files directly using server-side client
    let query = supabase
      .from('uploaded_resume_files')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false });

    // Filter out used files if requested
    if (!includeUsed) {
      query = query.eq('is_used', false);
    }

    const { data: files, error: filesError } = await query;

    if (filesError) {
      console.error('Error fetching files:', filesError);
      throw filesError;
    }

    // Get stats
    const { data: statsData, error: statsError } = await supabase
      .from('uploaded_resume_files')
      .select('is_used, file_size_bytes')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    const stats = {
      total: 0,
      used: 0,
      unused: 0,
      totalSize: 0,
    };

    if (!statsError && statsData) {
      stats.total = statsData.length;
      stats.used = statsData.filter(f => f.is_used).length;
      stats.unused = statsData.filter(f => !f.is_used).length;
      stats.totalSize = statsData.reduce((sum, f) => sum + (f.file_size_bytes || 0), 0);
    }

    return NextResponse.json({
      files: files || [],
      stats,
      count: files?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching uploaded files:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch uploaded files',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
