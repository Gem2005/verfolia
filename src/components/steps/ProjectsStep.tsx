import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, Trash2, X } from "lucide-react";
import { ResumeData } from "@/types/ResumeData";

interface ProjectsStepProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  validationErrors: { [key: string]: string };
  newTech: { [key: string]: string };
  setNewTech: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

export const ProjectsStep: React.FC<ProjectsStepProps> = ({
  resumeData,
  setResumeData,
  validationErrors,
  newTech,
  setNewTech,
}) => {
  const addProject = () => {
    const newProject = {
      id: Math.random().toString(36).substring(2, 11),
      name: "",
      description: "",
      techStack: [],
      sourceUrl: "",
      demoUrl: "",
    };
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };

  const updateProjectField = (
    projectId: string,
    field: "name" | "description" | "techStack" | "sourceUrl" | "demoUrl",
    value: string | string[]
  ) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === projectId
          ? {
              ...proj,
              [field]: value,
            }
          : proj
      ),
    }));
  };

  const removeProject = (projectId: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((proj) => proj.id !== projectId),
    }));
  };

  const addTech = (projectId: string) => {
    const value = (newTech[projectId] || "").trim();
    if (!value) return;
    const project = resumeData.projects.find((p) => p.id === projectId);
    const next = Array.from(new Set([...(project?.techStack || []), value]));
    updateProjectField(projectId, "techStack", next);
    setNewTech((prev) => ({ ...prev, [projectId]: "" }));
  };

  return (
    <Card className="border-0 shadow-lg bg-card">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-primary" />
          Projects
        </CardTitle>
        <CardDescription className="text-muted-foreground">Highlight your notable work</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {resumeData.projects.length === 0 && (
            <p className="text-muted-foreground text-sm italic">No projects added yet. Click the button below to add your first project.</p>
          )}
          {resumeData.projects.map((proj) => (
            <div key={proj.id} className="p-4 border rounded-lg space-y-4 bg-muted/50">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-foreground">Project</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(proj.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={proj.name}
                  onChange={(e) => updateProjectField(proj.id, "name", e.target.value)}
                  className={`h-10 ${validationErrors[`project_${proj.id}_name`] ? "border-red-500" : ""}`}
                  placeholder="e.g., E-commerce Website"
                />
                {validationErrors[`project_${proj.id}_name`] && (
                  <p className="text-xs text-red-500">{validationErrors[`project_${proj.id}_name`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  rows={3}
                  value={proj.description}
                  onChange={(e) => updateProjectField(proj.id, "description", e.target.value)}
                  className={`resize-none ${validationErrors[`project_${proj.id}_description`] ? "border-red-500" : ""}`}
                  placeholder="Describe your project, its features, and impact (20-100 words)"
                />
                {validationErrors[`project_${proj.id}_description`] && (
                  <p className="text-xs text-red-500">{validationErrors[`project_${proj.id}_description`]}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {proj.description.trim() 
                    ? `${proj.description.trim().split(/\s+/).filter(word => word.length > 0).length} words` 
                    : "0 words"} (20-100 words recommended)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Technologies <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTech[proj.id] || ""}
                    onChange={(e) => setNewTech((prev) => ({ ...prev, [proj.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTech(proj.id);
                      }
                    }}
                    className="h-9 flex-grow bg-transparent"
                    placeholder="Add a technology and press Enter"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      addTech(proj.id);
                    }}
                    className="h-9"
                  >
                    Add
                  </Button>
                </div>
                
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {proj.techStack.map((tech, index) => (
                      <div
                        key={`${tech}-${index}`}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-medium text-blue-700"
                      >
                        <span>{tech}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newStack = proj.techStack.filter((_, i) => i !== index);
                            updateProjectField(proj.id, "techStack", newStack);
                          }}
                          className="h-3 w-3 p-0 hover:bg-transparent text-glass-blue hover:text-red-600"
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {validationErrors[`project_${proj.id}_techStack`] && (
                  <p className="text-xs text-red-500">{validationErrors[`project_${proj.id}_techStack`]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Source Code URL</Label>
                  <Input
                    value={proj.sourceUrl}
                    onChange={(e) => updateProjectField(proj.id, "sourceUrl", e.target.value)}
                    className={`h-10 ${validationErrors[`project_${proj.id}_sourceUrl`] ? "border-red-500" : ""}`}
                    placeholder="https://github.com/username/project"
                  />
                  {validationErrors[`project_${proj.id}_sourceUrl`] && (
                    <p className="text-xs text-red-500">{validationErrors[`project_${proj.id}_sourceUrl`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Live Demo URL</Label>
                  <Input
                    value={proj.demoUrl}
                    onChange={(e) => updateProjectField(proj.id, "demoUrl", e.target.value)}
                    className={`h-10 ${validationErrors[`project_${proj.id}_demoUrl`] ? "border-red-500" : ""}`}
                    placeholder="https://project-demo.com"
                  />
                  {validationErrors[`project_${proj.id}_demoUrl`] && (
                    <p className="text-xs text-red-500">{validationErrors[`project_${proj.id}_demoUrl`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button onClick={addProject} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};