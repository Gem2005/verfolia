import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { ResumeData } from "@/types/ResumeData";

interface EducationStepProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  validationErrors: { [key: string]: string };
}

export const EducationStep: React.FC<EducationStepProps> = ({
  resumeData,
  setResumeData,
  validationErrors,
}) => {
  const addEducation = () => {
    const newEdu = {
      id: Math.random().toString(36).substring(2, 11),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  const updateEducationField = (
    educationId: string,
    field: "institution" | "degree" | "field" | "startDate" | "endDate" | "gpa",
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === educationId
          ? {
              ...edu,
              [field]: value,
            }
          : edu
      ),
    }));
  };

  const removeEducation = (educationId: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== educationId),
    }));
  };

  return (
    <Card className="glass-step-card border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-glass-primary flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-glass-blue" />
          Education
        </CardTitle>
        <CardDescription className="text-glass-secondary">Educational background</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {resumeData.education.length === 0 && (
            <p className="text-glass-secondary text-sm italic">No education added yet. Click the button below to add your education.</p>
          )}
          {resumeData.education.map((edu) => (
            <div key={edu.id} className="p-4 border rounded-lg space-y-4 glass-form-card">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-glass-primary">Education</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(edu.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Institution <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducationField(edu.id, "institution", e.target.value)}
                    className={`h-10 ${validationErrors[`education_${edu.id}_institution`] ? "border-red-500" : ""}`}
                    placeholder="e.g., Harvard University"
                  />
                  {validationErrors[`education_${edu.id}_institution`] && (
                    <p className="text-xs text-red-500">{validationErrors[`education_${edu.id}_institution`]}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Degree <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducationField(edu.id, "degree", e.target.value)}
                    className={`h-10 ${validationErrors[`education_${edu.id}_degree`] ? "border-red-500" : ""}`}
                    placeholder="e.g., Bachelor of Science"
                  />
                  {validationErrors[`education_${edu.id}_degree`] && (
                    <p className="text-xs text-red-500">{validationErrors[`education_${edu.id}_degree`]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Field of Study</Label>
                <Input
                  value={edu.field}
                  onChange={(e) => updateEducationField(edu.id, "field", e.target.value)}
                  className="h-10"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start Date</Label>
                  <Input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => updateEducationField(edu.id, "startDate", e.target.value)}
                    className="h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">End Date</Label>
                  <Input
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => updateEducationField(edu.id, "endDate", e.target.value)}
                    className={`h-10 ${validationErrors[`education_${edu.id}_endDate`] ? "border-red-500" : ""}`}
                  />
                  {validationErrors[`education_${edu.id}_endDate`] && (
                    <p className="text-xs text-red-500">{validationErrors[`education_${edu.id}_endDate`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">GPA/Grade</Label>
                  <Input
                    value={edu.gpa}
                    onChange={(e) => updateEducationField(edu.id, "gpa", e.target.value)}
                    className={`h-10 ${validationErrors[`education_${edu.id}_gpa`] ? "border-red-500" : ""}`}
                    placeholder="e.g., 3.8 or 85%"
                  />
                  {validationErrors[`education_${edu.id}_gpa`] && (
                    <p className="text-xs text-red-500">{validationErrors[`education_${edu.id}_gpa`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button onClick={addEducation} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};