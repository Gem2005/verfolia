import { createClient } from "@/utils/supabase/client";

// Helper function to decode base64 to Uint8Array for file upload
function decode(base64String: string): Uint8Array {
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export interface ImageUploadResult {
  url: string;
  fileName: string;
}

export class ImageUploadService {
  private supabase = createClient();

  /**
   * Upload an image to Supabase storage
   * @param base64Data - Base64 encoded image data (with data:image prefix)
   * @param userId - User ID for file naming
   * @param bucket - Storage bucket name (default: 'profileimg')
   * @returns Promise with upload result
   */
  async uploadImage(
    base64Data: string,
    userId: string,
    bucket: string = "profileimg"
  ): Promise<ImageUploadResult> {
    try {
      // Validate base64 data
      if (!base64Data.startsWith("data:image")) {
        throw new Error("Invalid image data format");
      }

      // Extract file extension from MIME type
      const mimeMatch = base64Data.match(/data:image\/([^;]+)/);
      const extension = mimeMatch ? mimeMatch[1] : "jpg";
      
      // Remove the data URL prefix and convert to binary
      const base64Content = base64Data.split(",")[1];
      if (!base64Content) {
        throw new Error("Invalid base64 data");
      }

      const fileName = `${userId}_${Date.now()}.${extension}`;
      const fileData = decode(base64Content);

      // Upload to Supabase storage
      const { error: uploadError } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, fileData, {
          contentType: `image/${extension}`,
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        url: urlData.publicUrl,
        fileName,
      };
    } catch (error) {
      console.error("Image upload error:", error);
      throw error instanceof Error ? error : new Error("Failed to upload image");
    }
  }

  /**
   * Delete an image from Supabase storage
   * @param fileName - Name of the file to delete
   * @param bucket - Storage bucket name (default: 'profileimg')
   */
  async deleteImage(fileName: string, bucket: string = "profileimg"): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        console.error("Delete error:", error);
        throw new Error(`Failed to delete image: ${error.message}`);
      }
    } catch (error) {
      console.error("Image delete error:", error);
      throw error instanceof Error ? error : new Error("Failed to delete image");
    }
  }

  /**
   * Get the file name from a Supabase storage URL
   * @param url - The full URL from Supabase storage
   * @returns The file name or null if not found
   */
  getFileNameFromUrl(url: string): string | null {
    try {
      const urlParts = url.split("/");
      return urlParts[urlParts.length - 1] || null;
    } catch {
      return null;
    }
  }
}

// Export a singleton instance
export const imageUploadService = new ImageUploadService();
