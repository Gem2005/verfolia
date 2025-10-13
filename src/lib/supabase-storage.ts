import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface UploadResumeFileParams {
  userId: string;
  resumeId: string;
  file: Buffer;
  originalFilename: string;
  mimeType: string;
}

interface UploadResumeFileResult {
  filePath: string;
  fileUrl: string;
  fileSize: number;
}

export async function uploadResumeFile({
  userId,
  resumeId,
  file,
  originalFilename,
  mimeType,
}: UploadResumeFileParams): Promise<UploadResumeFileResult> {
  const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${userId}/${resumeId}/${sanitizedFilename}`;

  const { data, error } = await supabaseAdmin.storage
    .from('resume')
    .upload(filePath, file, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('resume')
    .getPublicUrl(filePath);

  return {
    filePath: data.path,
    fileUrl: urlData.publicUrl,
    fileSize: file.length,
  };
}

export async function deleteResumeFile(filePath: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from('resume')
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
