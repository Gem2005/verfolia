import { createClient } from "@/utils/supabase/client";

// Types
export interface UploadedFile {
  id: string;
  user_id: string;
  file_path: string;
  file_url: string | null;
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  parsed_data: Record<string, unknown> | null;
  is_used: boolean;
  associated_resume_id: string | null;
  uploaded_at: string;
  last_accessed_at: string;
  deleted_at: string | null;
}

export interface SaveUploadedFileData {
  userId: string;
  filePath: string;
  fileUrl: string;
  originalFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  parsedData: Record<string, unknown>;
}

class UploadedFilesService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Save uploaded file metadata after AI parsing
   * Called immediately after file upload and parsing completes
   */
  async saveUploadedFile(data: SaveUploadedFileData): Promise<UploadedFile> {
    const { data: file, error } = await this.supabase
      .from('uploaded_resume_files')
      .insert({
        user_id: data.userId,
        file_path: data.filePath,
        file_url: data.fileUrl,
        original_filename: data.originalFilename,
        file_size_bytes: data.fileSizeBytes,
        mime_type: data.mimeType,
        parsed_data: data.parsedData,
        is_used: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving uploaded file:', error);
      throw new Error(`Failed to save uploaded file: ${error.message}`);
    }

    return file;
  }

  /**
   * Get all uploaded files for a user
   * @param userId - User ID to fetch files for
   * @param includeUsed - Whether to include files already used in resumes (default: true)
   */
  async getUserUploadedFiles(
    userId: string,
    includeUsed: boolean = true
  ): Promise<UploadedFile[]> {
    let query = this.supabase
      .from('uploaded_resume_files')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false });

    // Filter out used files if requested
    if (!includeUsed) {
      query = query.eq('is_used', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching uploaded files:', error);
      throw new Error(`Failed to fetch uploaded files: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a specific uploaded file by ID
   */
  async getUploadedFile(fileId: string): Promise<UploadedFile | null> {
    const { data, error } = await this.supabase
      .from('uploaded_resume_files')
      .select('*')
      .eq('id', fileId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching uploaded file:', error);
      throw new Error(`Failed to fetch uploaded file: ${error.message}`);
    }

    return data;
  }

  /**
   * Associate uploaded file with a resume
   * Marks the file as "used" and links it to the resume
   */
  async associateFileWithResume(
    fileId: string,
    resumeId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('uploaded_resume_files')
      .update({
        is_used: true,
        associated_resume_id: resumeId,
      })
      .eq('id', fileId);

    if (error) {
      console.error('Error associating file with resume:', error);
      throw new Error(`Failed to associate file with resume: ${error.message}`);
    }
  }

  /**
   * Soft delete an uploaded file
   * Sets deleted_at timestamp without actually removing the record
   */
  async deleteUploadedFile(fileId: string): Promise<void> {
    const { error } = await this.supabase
      .from('uploaded_resume_files')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', fileId);

    if (error) {
      console.error('Error deleting uploaded file:', error);
      throw new Error(`Failed to delete uploaded file: ${error.message}`);
    }
  }

  /**
   * Mark file as unused (when resume is deleted)
   * Allows the file to be reused for another resume
   */
  async markFileAsUnused(fileId: string): Promise<void> {
    const { error } = await this.supabase
      .from('uploaded_resume_files')
      .update({
        is_used: false,
        associated_resume_id: null,
      })
      .eq('id', fileId);

    if (error) {
      console.error('Error marking file as unused:', error);
      throw new Error(`Failed to mark file as unused: ${error.message}`);
    }
  }

  /**
   * Get unused files older than specified days (for cleanup)
   * Used by cleanup job to find orphaned files
   */
  async getUnusedOldFiles(daysOld: number = 30): Promise<UploadedFile[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await this.supabase
      .from('uploaded_resume_files')
      .select('*')
      .eq('is_used', false)
      .is('deleted_at', null)
      .lt('uploaded_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error fetching old unused files:', error);
      throw new Error(`Failed to fetch old unused files: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get file by path (useful for checking if file already exists)
   */
  async getFileByPath(filePath: string): Promise<UploadedFile | null> {
    const { data, error } = await this.supabase
      .from('uploaded_resume_files')
      .select('*')
      .eq('file_path', filePath)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching file by path:', error);
      return null;
    }

    return data;
  }

  /**
   * Get statistics about user's uploaded files
   */
  async getUserFileStats(userId: string): Promise<{
    total: number;
    used: number;
    unused: number;
    totalSize: number;
  }> {
    const { data, error } = await this.supabase
      .from('uploaded_resume_files')
      .select('is_used, file_size_bytes')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching file stats:', error);
      return { total: 0, used: 0, unused: 0, totalSize: 0 };
    }

    const stats = data.reduce(
      (
        acc: { total: number; used: number; unused: number; totalSize: number },
        file: { is_used: boolean; file_size_bytes: number }
      ) => {
        acc.total++;
        if (file.is_used) {
          acc.used++;
        } else {
          acc.unused++;
        }
        acc.totalSize += file.file_size_bytes || 0;
        return acc;
      },
      { total: 0, used: 0, unused: 0, totalSize: 0 }
    );

    return stats;
  }
}

// Export singleton instance
export const uploadedFilesService = new UploadedFilesService();
