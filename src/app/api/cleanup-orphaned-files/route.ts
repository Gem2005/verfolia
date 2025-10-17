import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { deleteResumeFile } from '@/lib/supabase-storage';

/**
 * POST /api/cleanup-orphaned-files
 * Cleanup job to delete unused uploaded files older than specified days
 * Should be called by a cron job (e.g., Vercel Cron)
 * Protected by CRON_SECRET environment variable
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[Cleanup] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cleanup job not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Cleanup] Unauthorized cleanup attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get cleanup parameters from query or use defaults
    const searchParams = request.nextUrl.searchParams;
    const daysOld = parseInt(searchParams.get('daysOld') || '30', 10);
    const dryRun = searchParams.get('dryRun') === 'true';

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    console.log(`[Cleanup] Starting cleanup job (dryRun: ${dryRun}, daysOld: ${daysOld})`);

    // Find unused files older than cutoff date
    const { data: oldFiles, error: fetchError } = await supabase
      .from('uploaded_resume_files')
      .select('*')
      .eq('is_used', false)
      .is('deleted_at', null)
      .lt('uploaded_at', cutoffDate.toISOString());

    if (fetchError) {
      console.error('[Cleanup] Error fetching old files:', fetchError);
      throw new Error(`Failed to fetch old files: ${fetchError.message}`);
    }

    if (!oldFiles || oldFiles.length === 0) {
      console.log('[Cleanup] No orphaned files found');
      return NextResponse.json({
        success: true,
        message: 'No orphaned files to cleanup',
        deletedCount: 0,
        totalFound: 0,
      });
    }

    console.log(`[Cleanup] Found ${oldFiles.length} orphaned files`);

    if (dryRun) {
      // Dry run: just report what would be deleted
      const fileList = oldFiles.map((f) => ({
        id: f.id,
        filename: f.original_filename,
        size: f.file_size_bytes,
        uploadedAt: f.uploaded_at,
      }));

      return NextResponse.json({
        success: true,
        dryRun: true,
        message: `Would delete ${oldFiles.length} file(s)`,
        totalFound: oldFiles.length,
        files: fileList,
      });
    }

    // Actual cleanup
    let deletedCount = 0;
    const errors: Array<{ fileId: string; error: string }> = [];

    for (const file of oldFiles) {
      try {
        // Delete from storage first
        if (file.file_path) {
          try {
            await deleteResumeFile(file.file_path);
            console.log(`[Cleanup] Deleted from storage: ${file.file_path}`);
          } catch (storageError) {
            console.error(
              `[Cleanup] Storage deletion failed for ${file.file_path}:`,
              storageError
            );
            // Continue with DB deletion even if storage fails
          }
        }

        // Soft delete from database
        const { error: deleteError } = await supabase
          .from('uploaded_resume_files')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', file.id);

        if (deleteError) {
          throw deleteError;
        }

        deletedCount++;
        console.log(`[Cleanup] Soft deleted file ${file.id}: ${file.original_filename}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Cleanup] Failed to delete file ${file.id}:`, error);
        errors.push({
          fileId: file.id,
          error: errorMessage,
        });
      }
    }

    const response = {
      success: true,
      message: `Cleaned up ${deletedCount} of ${oldFiles.length} orphaned file(s)`,
      deletedCount,
      totalFound: oldFiles.length,
      errors: errors.length > 0 ? errors : undefined,
      cutoffDate: cutoffDate.toISOString(),
    };

    console.log('[Cleanup] Cleanup job completed:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Cleanup] Cleanup job failed:', error);
    return NextResponse.json(
      {
        error: 'Cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cleanup-orphaned-files
 * Get statistics about orphaned files (dry run without authentication)
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const daysOld = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Count unused files older than cutoff
    const { count, error } = await supabase
      .from('uploaded_resume_files')
      .select('*', { count: 'exact', head: true })
      .eq('is_used', false)
      .is('deleted_at', null)
      .lt('uploaded_at', cutoffDate.toISOString());

    if (error) {
      throw error;
    }

    return NextResponse.json({
      orphanedFiles: count || 0,
      cutoffDate: cutoffDate.toISOString(),
      daysOld,
      message: `Found ${count || 0} orphaned file(s) older than ${daysOld} days`,
    });
  } catch (error) {
    console.error('[Cleanup] Stats fetch failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch cleanup stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
