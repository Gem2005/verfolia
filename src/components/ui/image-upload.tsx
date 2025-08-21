"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, User } from "lucide-react";
import { imageUploadService } from "@/utils/image-upload";
import { useAuth } from "@/hooks/use-auth";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  className?: string;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  uploadToSupabase?: boolean; // If true, uploads to Supabase and returns URL
}

export function ImageUpload({
  value,
  onChange,
  label = "Profile Photo",
  description = "Upload a professional headshot",
  className = "",
  maxSizeInMB = 5,
  acceptedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  uploadToSupabase = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        throw new Error(
          `Please select a valid image file (${acceptedFormats.join(", ")})`
        );
      }

      // Validate file size
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        throw new Error(`File size must be less than ${maxSizeInMB}MB`);
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;

        if (uploadToSupabase && user) {
          try {
            // Upload to Supabase and get URL
            const uploadResult = await imageUploadService.uploadImage(
              result,
              user.id
            );
            onChange(uploadResult.url);
          } catch (uploadError) {
            console.error("Supabase upload error:", uploadError);
            setError(
              uploadError instanceof Error
                ? uploadError.message
                : "Failed to upload to cloud storage"
            );
          }
        } else {
          // Just store base64 data
          onChange(result);
        }

        setIsUploading(false);
      };
      reader.onerror = () => {
        setError("Failed to read file");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>

      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="relative">
          <div className="w-28 h-28 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/10 hover:border-primary/50 transition-colors">
            {value ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-sm"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <User className="h-10 w-10 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground/70 text-center">
                  Click to upload
                </span>
              </div>
            )}
          </div>

          {/* Upload overlay for empty state */}
          {!value && (
            <button
              onClick={handleClick}
              className="absolute inset-0 rounded-full bg-transparent hover:bg-primary/5 transition-colors"
              type="button"
              disabled={isUploading}
            />
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={isUploading}
              className="h-9"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading
                ? "Uploading..."
                : value
                ? "Change Photo"
                : "Upload Photo"}
            </Button>

            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-9 text-muted-foreground hover:text-destructive"
              >
                Remove
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {description}. Max {maxSizeInMB}MB. Supports JPG, PNG, WebP.
          </p>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
