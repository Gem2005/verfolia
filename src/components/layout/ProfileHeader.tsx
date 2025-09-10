"use client";

import { Button } from "@/components/ui/button";
import { Resume as ResumeType } from "@/services/resume-service";
import { BarChart3, Edit, Share2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ProfileHeaderProps {
  resume: ResumeType;
}

export const ProfileHeader = ({ resume }: ProfileHeaderProps) => {
  const handleCopyLink = () => {
    const url = `${window.location.origin}/resume/${resume.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Profile link copied to clipboard!");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
            <h1 className="text-xl font-bold truncate">{resume.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCopyLink} variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </Button>
          <Button asChild variant="outline" size="sm" className="shining-glass-effect">
            <Link href={`/analytics?resumeId=${resume.id}`}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/create-resume?edit=${resume.id}`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
