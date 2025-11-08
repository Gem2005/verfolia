import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { ResumeData } from "@/types/ResumeData";

interface ExperienceStepProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  validationErrors: { [key: string]: string };
}

export const ExperienceStep: React.FC<ExperienceStepProps> = ({
  resumeData,
  setResumeData,
  validationErrors,
}) => {
  const addExperience = () => {
    const newExp = {
      id: Math.random().toString(36).substring(2, 11),
      position: "",
      company: "",
      startDate: "",
      endDate: "",
      isPresent: false,
      description: "",
    };
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }));
  };

  const updateExperienceField = (
    experienceId: string,
    field:
      | "position"
      | "company"
      | "startDate"
      | "endDate"
      | "isPresent"
      | "description"
      | "location",
    value: string | boolean
  ) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === experienceId
          ? {
              ...exp,
              [field]: value,
              ...(field === "isPresent" && value === true
                ? { endDate: "" }
                : {}),
            }
          : exp
      ),
    }));
  };

  const removeExperience = (experienceId: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== experienceId),
    }));
  };

  return (
    <Card className="card-enhanced border-0 shadow-lg bg-card">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          Experience
        </CardTitle>
        <CardDescription className="text-muted-foreground">Work experience (required)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {resumeData.experience.length === 0 && (
            <p className="text-muted-foreground text-sm italic">No work experience added yet. Click the button below to add your first experience.</p>
          )}
          {resumeData.experience.map((exp) => (
            <div key={exp.id} className="p-4 border rounded-lg space-y-4 bg-muted/50">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-foreground">Work Experience</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(exp.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={exp.position}
                    onChange={(e) => updateExperienceField(exp.id, "position", e.target.value)}
                    className={`h-10 ${validationErrors[`experience_${exp.id}_position`] ? "border-red-500" : ""}`}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {validationErrors[`experience_${exp.id}_position`] && (
                    <p className="text-xs text-red-500">{validationErrors[`experience_${exp.id}_position`]}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Company <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperienceField(exp.id, "company", e.target.value)}
                    className={`h-10 ${validationErrors[`experience_${exp.id}_company`] ? "border-red-500" : ""}`}
                    placeholder="e.g., Google Inc."
                  />
                  {validationErrors[`experience_${exp.id}_company`] && (
                    <p className="text-xs text-red-500">{validationErrors[`experience_${exp.id}_company`]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Location
                </Label>
                <Input
                  value={exp.location || ""}
                  onChange={(e) => updateExperienceField(exp.id, "location", e.target.value)}
                  className="h-10"
                  placeholder="e.g., San Francisco, CA or Remote"
                />
                <p className="text-xs text-muted-foreground">
                  Where this position is/was based
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <MonthYearPicker
                    value={exp.startDate}
                    onChange={(value) => updateExperienceField(exp.id, "startDate", value)}
                    error={!!validationErrors[`experience_${exp.id}_startDate`]}
                  />
                  {validationErrors[`experience_${exp.id}_startDate`] && (
                    <p className="text-xs text-red-500">{validationErrors[`experience_${exp.id}_startDate`]}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`current-${exp.id}`}
                      checked={exp.isPresent}
                      onCheckedChange={(checked) => updateExperienceField(exp.id, "isPresent", !!checked)}
                    />
                    <Label htmlFor={`current-${exp.id}`} className="text-sm font-medium">
                      Currently working here
                    </Label>
                  </div>
                  {!exp.isPresent && (
                    <>
                      <Label className="text-sm font-medium">
                        End Date <span className="text-red-500">*</span>
                      </Label>
                      <MonthYearPicker
                        value={exp.endDate || ""}
                        onChange={(value) => updateExperienceField(exp.id, "endDate", value)}
                        error={!!validationErrors[`experience_${exp.id}_endDate`]}
                      />
                      {validationErrors[`experience_${exp.id}_endDate`] && (
                        <p className="text-xs text-red-500">{validationErrors[`experience_${exp.id}_endDate`]}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Job Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  rows={4}
                  value={exp.description}
                  onChange={(e) => updateExperienceField(exp.id, "description", e.target.value)}
                  className={`resize-none ${validationErrors[`experience_${exp.id}_description`] ? "border-red-500" : ""}`}
                  placeholder="Describe your responsibilities, achievements, and key contributions (20-100 words)"
                />
                {validationErrors[`experience_${exp.id}_description`] && (
                  <p className="text-xs text-red-500">{validationErrors[`experience_${exp.id}_description`]}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {exp.description.trim() 
                    ? `${exp.description.trim().split(/\s+/).filter(word => word.length > 0).length} words` 
                    : "0 words"} (20-100 words recommended)
                </p>
              </div>
            </div>
          ))}
          <Button onClick={addExperience} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Work Experience
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

