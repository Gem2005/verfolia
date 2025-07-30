"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, User, Loader2 } from "lucide-react";
import Image from "next/image";

// Helper function to validate if a string is a valid URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Helper function to check if URL is safe for Next.js Image component
function isSafeImageUrl(url: string): boolean {
  return (
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    url.startsWith("/") ||
    isValidUrl(url)
  );
}

export default function Avatar({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string | null;
  url: string | null;
  size: number;
  onUpload: (url: string) => void;
}) {
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage
          .from("avatars")
          .download(path);
        if (error) {
          throw error;
        }

        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
      } catch (error) {
        console.log("Error downloading image: ", error);
        setAvatarUrl(null);
      }
    }

    if (!url) {
      setAvatarUrl(null);
      return;
    }

    // If it's already a valid URL (blob, data, http, etc.), use it directly
    if (isSafeImageUrl(url)) {
      setAvatarUrl(url);
    } else {
      // Otherwise, try to download from Supabase storage
      downloadImage(url);
    }
  }, [url, supabase]);

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${uid}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      onUpload(filePath);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <div
          className="relative overflow-hidden rounded-full border-4 border-border bg-muted"
          style={{ width: size, height: size }}
        >
          {avatarUrl && isSafeImageUrl(avatarUrl) ? (
            <Image
              width={size}
              height={size}
              src={avatarUrl}
              alt="Avatar"
              className="object-cover w-full h-full"
              unoptimized={
                avatarUrl.startsWith("blob:") || avatarUrl.startsWith("data:")
              }
              onError={() => setAvatarUrl(null)}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-muted">
              <User className="w-1/3 h-1/3 text-muted-foreground" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={uploading}
        className="text-sm"
        onClick={() => document.getElementById("avatar-upload")?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Avatar
          </>
        )}
      </Button>
    </div>
  );
}
