"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ArrowLeft, ArrowRight, Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { resumeService } from "@/services/resume-service";
import {
  CleanMonoTemplate,
  DarkMinimalistTemplate,
  DarkTechTemplate,
  ModernAIFocusedTemplate,
} from "@/components/templates";
import type { PortfolioData } from "@/types/PortfolioTypes";

interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    photo?: string;
    linkedinUrl?: string;
    githubUrl?: string;
  };
  experience: Array<{
    id: string;
    position: string;
    company: string;
    startDate: string;
    endDate?: string;
    isPresent?: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    description: string;
    techStack: string[];
    sourceUrl?: string;
    demoUrl?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date?: string;
    url?: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    proficiency?: string;
  }>;
  customSections: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

const steps = [
  { id: 0, title: "Template", description: "Choose a template" },
  { id: 1, title: "Personal Info", description: "Basic information" },
  { id: 2, title: "Experience", description: "Work experience" },
  { id: 3, title: "Education", description: "Educational background" },
  { id: 4, title: "Skills", description: "Technical skills" },
  { id: 5, title: "Projects", description: "Project details" },
  { id: 6, title: "Additional", description: "Extra sections" },
];

export default function CreateResumePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState("black");
  const [selectedTemplate, setSelectedTemplate] = useState("clean-mono");
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [newSkill, setNewSkill] = useState(""); // Moved useState to top level

  const templates = [
    {
      id: "clean-mono",
      name: "Clean Mono",
      hasPhoto: true,
      description: "Elegant mono resume with clarity",
      layout: "clean-mono",
    },
    {
      id: "dark-minimalist",
      name: "Dark Minimalist",
      hasPhoto: true,
      description: "Dark, focused, minimal resume",
      layout: "dark-minimalist",
    },
    {
      id: "dark-tech",
      name: "Dark Tech",
      hasPhoto: true,
      description: "Techy dark theme with emphasis",
      layout: "dark-tech",
    },
    {
      id: "modern-ai-focused",
      name: "Modern AI Focused",
      hasPhoto: true,
      description: "Modern AI-oriented presentation",
      layout: "modern-ai-focused",
    },
  ];

  const themes = [
    { id: "black", name: "Black", color: "bg-black" },
    { id: "dark-gray", name: "Dark Gray", color: "bg-gray-800" },
    { id: "navy-blue", name: "Navy Blue", color: "bg-blue-900" },
    { id: "professional", name: "Professional", color: "bg-gray-700" },
  ];

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      photo: "",
      linkedinUrl: "",
      githubUrl: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    customSections: [],
  });

  // Get current template
  const currentTemplate =
    templates.find((t) => t.id === selectedTemplate) || templates[0];

  // Convert resume data to portfolio data format for templates
  const getPortfolioData = (): PortfolioData => ({
    personalInfo: {
      firstName: resumeData.personalInfo.firstName || "John",
      lastName: resumeData.personalInfo.lastName || "Doe",
      title: resumeData.personalInfo.summary || "Software Developer",
      email: resumeData.personalInfo.email || "john@example.com",
      phone: resumeData.personalInfo.phone || "+1 (555) 123-4567",
      location: resumeData.personalInfo.location || "San Francisco, CA",
      about:
        resumeData.personalInfo.summary ||
        "Passionate developer focused on building scalable applications.",
      photo: resumeData.personalInfo.photo || "/professional-headshot.png",
      social: {
        github:
          resumeData.personalInfo.githubUrl || "https://github.com/johndoe",
        twitter: "https://twitter.com/johndoe",
        linkedin:
          resumeData.personalInfo.linkedinUrl ||
          "https://linkedin.com/in/johndoe",
        portfolio: "https://johndoe.dev",
      },
    },
    experience: resumeData.experience.map((exp) => ({
      id: exp.id,
      position: exp.position,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate,
      isPresent: exp.isPresent,
      description: exp.description,
    })),
    skills: resumeData.skills,
    education: resumeData.education.map((edu) => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startYear: edu.startDate,
      endYear: edu.endDate,
      cgpa: edu.gpa || "3.8",
    })),
    projects: resumeData.projects.map((proj) => ({
      id: proj.id,
      name: proj.name,
      description: proj.description,
      techStack: proj.techStack,
      sourceUrl: proj.sourceUrl || "",
      demoUrl: proj.demoUrl || "",
    })),
    blogs: [], // Not used in resume context
    certifications: resumeData.certifications.map((cert) => ({
      id: cert.id,
      title: cert.name,
      issuer: cert.issuer,
      date: cert.date || "",
      url: cert.url || "",
    })),
    interests: [], // Could be derived from custom sections
  });

  // Render different template layouts
  const renderResumePreview = () => {
    const templateProps = {
      preview: true,
      data: getPortfolioData(),
    };

    switch (currentTemplate.layout) {
      case "clean-mono":
        return <CleanMonoTemplate {...templateProps} />;
      case "dark-minimalist":
        return <DarkMinimalistTemplate {...templateProps} />;
      case "dark-tech":
        return <DarkTechTemplate {...templateProps} />;
      case "modern-ai-focused":
        return <ModernAIFocusedTemplate {...templateProps} />;
      default:
        return <CleanMonoTemplate {...templateProps} />;
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const resume = await resumeService.createResume({
        user_id: user.id, // Add user_id
        title:
          resumeData.personalInfo.summary ||
          `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName} Resume`, // Add title
        is_public: false, // Or true, depending on your logic
        template_id: selectedTemplate,
        theme_id: selectedTheme,
        personal_info: {
          ...resumeData.personalInfo,
          linkedinUrl: resumeData.personalInfo.linkedinUrl || "",
          githubUrl: resumeData.personalInfo.githubUrl || "",
        },
        experience: resumeData.experience,
        education: resumeData.education.map((edu) => ({
          ...edu,
          field: edu.field || "",
          gpa: edu.gpa || "",
        })),
        skills: resumeData.skills,
        projects: resumeData.projects.map((proj) => ({
          ...proj,
          startDate: new Date().toISOString().split("T")[0], // Add required startDate
          endDate: new Date().toISOString().split("T")[0], // Add required endDate
        })),
        certifications: resumeData.certifications,
        languages: resumeData.languages,
        custom_sections: resumeData.customSections,
      });

      router.push(`/resume/${resume.slug}`);
    } catch (error) {
      console.error("Error saving resume:", error);
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    const newExp = {
      id: Math.random().toString(36).substr(2, 9),
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

  const addEducation = () => {
    const newEdu = {
      id: Math.random().toString(36).substr(2, 9),
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

  const addProject = () => {
    const newProject = {
      id: Math.random().toString(36).substr(2, 9),
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

  const renderTemplateStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Choose Template</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select a template that best fits your style
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="aspect-[3/4] bg-muted rounded mb-3 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Preview</span>
              </div>
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </div>
          ))}
        </div>

        <div>
          <Label>Theme Color</Label>
          <div className="flex gap-2 mt-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedTheme === theme.id
                    ? "border-primary"
                    : "border-gray-300"
                } ${theme.color}`}
                onClick={() => setSelectedTheme(theme.id)}
                title={theme.name}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPersonalInfoStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <p className="text-sm text-muted-foreground">Tell us about yourself</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={resumeData.personalInfo.firstName}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    firstName: e.target.value,
                  },
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={resumeData.personalInfo.lastName}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    lastName: e.target.value,
                  },
                }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={resumeData.personalInfo.email}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, email: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={resumeData.personalInfo.phone}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, phone: e.target.value },
                }))
              }
            />
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={resumeData.personalInfo.location}
            onChange={(e) =>
              setResumeData((prev) => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  location: e.target.value,
                },
              }))
            }
          />
        </div>

        <div>
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea
            id="summary"
            rows={4}
            value={resumeData.personalInfo.summary}
            onChange={(e) =>
              setResumeData((prev) => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, summary: e.target.value },
              }))
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={resumeData.personalInfo.linkedinUrl}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    linkedinUrl: e.target.value,
                  },
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="github">GitHub URL</Label>
            <Input
              id="github"
              value={resumeData.personalInfo.githubUrl}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    githubUrl: e.target.value,
                  },
                }))
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSkillsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add your technical and professional skills
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                addSkill(newSkill);
                setNewSkill("");
              }
            }}
          />
          <Button
            onClick={() => {
              addSkill(newSkill);
              setNewSkill("");
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {resumeData.skills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {skill}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeSkill(skill)}
              />
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderTemplateStep();
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return <div>Experience Step - Coming Soon</div>;
      case 3:
        return <div>Education Step - Coming Soon</div>;
      case 4:
        return renderSkillsStep();
      case 5:
        return <div>Projects Step - Coming Soon</div>;
      case 6:
        return <div>Additional Step - Coming Soon</div>;
      default:
        return renderTemplateStep();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to create a resume.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Panel - Form */}
          <div className="flex-1 max-w-2xl">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Create Resume</h1>
                <Button
                  variant="outline"
                  onClick={() => setShowFullPreview(!showFullPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showFullPreview ? "Hide" : "Show"} Preview
                </Button>
              </div>

              <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-2 whitespace-nowrap ${
                      index <= currentStep
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === currentStep
                          ? "bg-primary text-primary-foreground"
                          : index < currentStep
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Current Step Content */}
            {renderCurrentStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentStep === steps.length - 1 ? (
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Resume"}
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      setCurrentStep(
                        Math.min(steps.length - 1, currentStep + 1)
                      )
                    }
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          {!showFullPreview && (
            <div className="w-80 sticky top-8 h-fit">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[3/4] bg-muted rounded overflow-hidden">
                    <div className="scale-[0.3] origin-top-left w-[333%] h-[333%]">
                      {renderResumePreview()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Full Preview Modal */}
        {showFullPreview && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Resume Preview</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowFullPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">{renderResumePreview()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
