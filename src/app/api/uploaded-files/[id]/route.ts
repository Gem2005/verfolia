import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { deleteResumeFile } from '@/lib/supabase-storage';

/**
 * GET /api/uploaded-files/[id]
 * Get a specific uploaded file
 */
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

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: file, error } = await supabase
      .from('uploaded_resume_files')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Verify ownership
    if (file.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ file });
  } catch (error) {
    console.error('Error fetching uploaded file:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/uploaded-files/[id]
 * Delete an uploaded file (soft delete + storage cleanup)
 * Cannot delete files currently associated with resumes
 */
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: file, error: fetchError } = await supabase
      .from('uploaded_resume_files')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Verify ownership
    if (file.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Don't allow deletion if file is associated with a resume
    if (file.is_used && file.associated_resume_id) {
      return NextResponse.json(
        {
          error:
            'Cannot delete file associated with a resume. Delete the resume first or it will be automatically marked as unused.',
        },
        { status: 400 }
      );
    }

    // Soft delete from database
    const { error: deleteError } = await supabase
      .from('uploaded_resume_files')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (deleteError) {
      console.error('Error soft deleting file:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete file from database' },
        { status: 500 }
      );
    }

    // Delete from storage
    // Continue even if storage deletion fails since DB deletion succeeded
    if (file.file_path) {
      try {
        await deleteResumeFile(file.file_path);
        console.log(`[Uploaded Files] Deleted file from storage: ${file.file_path}`);
      } catch (storageError) {
        console.error(
          '[Uploaded Files] Failed to delete from storage:',
          storageError
        );
        // Don't fail the request - file is marked as deleted in DB
        console.warn(
          '[Uploaded Files] File marked as deleted but may still exist in storage:',
          file.file_path
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting uploaded file:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
