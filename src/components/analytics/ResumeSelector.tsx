import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Loading resumes...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!resumes || resumes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <FileText className="h-5 w-5" />
            <span className="text-sm">
              No resumes found. Create a resume to see analytics.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1">
            <label
              htmlFor="resume-select"
              className="text-sm font-medium mb-2 block"
            >
              Select Resume
            </label>
            <Select
              value={selectedResumeId || undefined}
              onValueChange={onResumeChange}
            >
              <SelectTrigger id="resume-select" className="w-full">
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
          <div className="text-sm text-muted-foreground">
            {resumes.length} resume{resumes.length !== 1 ? "s" : ""}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
