import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Loader2 } from "lucide-react";
import type { Resume } from "@/services/resume-service";

interface ResumeSelectorProps {
  resumes: Resume[];
  selectedResumeId: string | null;
  onResumeChange: (resumeId: string) => void;
  loading?: boolean;
}

export function ResumeSelector({
  resumes,
  selectedResumeId,
  onResumeChange,
  loading = false,
}: ResumeSelectorProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-6">
        <Loader2 className="h-5 w-5 animate-spin text-[#3498DB]" />
        <span className="text-sm text-[#34495E] dark:text-gray-400">
          Loading resumes...
        </span>
      </div>
    );
  }

  if (!resumes || resumes.length === 0) {
    return (
      <div className="flex items-center gap-3 p-6 text-[#34495E] dark:text-gray-400">
        <FileText className="h-5 w-5" />
        <span className="text-sm">
          No resumes found. Create a resume to see analytics.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      {/* Icon */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2C3E50] to-[#3498DB] shadow-lg shadow-[#3498DB]/30">
        <FileText className="h-6 w-6 text-white" />
      </div>
      
      {/* Select Input */}
      <div className="flex-1">
        <label
          htmlFor="resume-select"
          className="text-sm font-semibold mb-2 block text-[#2C3E50] dark:text-white"
        >
          Select Resume to Analyze
        </label>
        <Select
          value={selectedResumeId || undefined}
          onValueChange={onResumeChange}
        >
          <SelectTrigger 
            id="resume-select" 
            className="w-full h-12 border-2 border-[#3498DB]/30 hover:border-[#3498DB]/60 focus:border-[#3498DB] bg-white dark:bg-gray-900 transition-all duration-200 rounded-xl"
          >
            <SelectValue placeholder="Choose a resume to view analytics" />
          </SelectTrigger>
          <SelectContent>
            {resumes.map((resume) => (
              <SelectItem key={resume.id} value={resume.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {resume.personal_info?.firstName && resume.personal_info?.lastName
                      ? `${resume.personal_info.firstName} ${resume.personal_info.lastName}`
                      : "Unnamed Resume"}
                  </span>
                  {resume.template_id && (
                    <span className="text-xs text-muted-foreground">
                      • {resume.template_id}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
