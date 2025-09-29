import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Code, Plus, X } from "lucide-react";
import { ResumeData } from "@/types/ResumeData";

interface SkillsStepProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  validationErrors: { [key: string]: string };
  newSkill: string;
  setNewSkill: React.Dispatch<React.SetStateAction<string>>;
}

export const SkillsStep: React.FC<SkillsStepProps> = ({
  resumeData,
  setResumeData,
  validationErrors,
  newSkill,
  setNewSkill,
}) => {
  const addSkill = (skill: string) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill.trim()],
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const removeSkillAtIndex = (removeIndex: number) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, index) => index !== removeIndex),
    }));
    // Force re-render for stubborn browsers
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        setResumeData((prev) => ({ ...prev, skills: [...prev.skills] }));
      }, 0);
    }
  };

  const onAdd = () => {
    if (newSkill.trim()) {
      addSkill(newSkill.trim());
      setNewSkill("");
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-card">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Code className="w-6 h-6 text-primary" />
          Skills
        </CardTitle>
        <CardDescription className="text-muted-foreground">Technical and soft skills</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAdd();
                }
              }}
              className="flex-grow h-10"
              placeholder="Enter a skill and press Enter"
            />
            <Button
              onClick={onAdd}
              disabled={!newSkill.trim()}
              className="h-10 px-4"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          {resumeData.skills.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Your Skills ({resumeData.skills.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <div
                    key={`${skill}-${index}`}
                    className={`flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors ${
                      validationErrors[`skill_${index}`] ? "border-red-300 bg-red-50 text-red-700" : ""
                    }`}
                  >
                    <span>{skill}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkillAtIndex(index)}
                      className="h-4 w-4 p-0 hover:bg-transparent text-glass-blue hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              {Object.keys(validationErrors).some(key => key.startsWith("skill_")) && (
                <p className="text-xs text-red-500">
                  Please ensure all skills are between 2 and 50 characters
                </p>
              )}
            </div>
          )}
          
          {resumeData.skills.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Code className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No skills added yet</p>
              <p className="text-xs mt-1">Add your technical and soft skills above</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};