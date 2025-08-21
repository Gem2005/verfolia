"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ArrowLeft, ArrowRight, Eye, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { resumeService } from "@/services/resume-service";
// import { ImageUpload } from "@/components/ui/image-upload";
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
  const [resumeTitle, setResumeTitle] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newSkill, setNewSkill] = useState(""); // Moved useState to top level
  const [newTech, setNewTech] = useState<{ [key: string]: string }>({});

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

  // Smooth step transition
  const goToStep = (step: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 150);
  };

  // Validation for current step
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Personal Info
        return (
          resumeData.personalInfo.firstName.trim() &&
          resumeData.personalInfo.lastName.trim() &&
          resumeData.personalInfo.email.trim()
        );
      case 2: // Experience
        return resumeData.experience.length > 0;
      case 3: // Education
        return resumeData.education.length > 0;
      case 4: // Skills
        return resumeData.skills.length > 0;
      default:
        return true;
    }
  };

  const canProceedToNext = validateCurrentStep();

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    let completed = 0;
    const total = 5; // Total steps

    // Template selection (always completed if we're past step 0)
    if (currentStep > 0) completed++;

    // Personal info
    if (
      resumeData.personalInfo.firstName &&
      resumeData.personalInfo.lastName &&
      resumeData.personalInfo.email
    ) {
      completed++;
    }

    // Experience
    if (resumeData.experience.length > 0) completed++;

    // Education
    if (resumeData.education.length > 0) completed++;

    // Skills
    if (resumeData.skills.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

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
      theme: selectedTheme,
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
        title: (() => {
          if (resumeTitle.trim()) {
            return resumeTitle.trim();
          }

          const firstName = resumeData.personalInfo.firstName?.trim() || "";
          const lastName = resumeData.personalInfo.lastName?.trim() || "";
          const fullName = `${firstName} ${lastName}`.trim();

          if (fullName) {
            return `${fullName} - Resume`;
          } else if (firstName) {
            return `${firstName} - Resume`;
          } else {
            return "My Resume";
          }
        })(),
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

  const renderTemplateStep = () => {
    const TemplatePreview = ({
      template,
    }: {
      template: (typeof templates)[0];
    }) => {
      const getTemplateComponent = () => {
        const templateProps = {
          preview: true as const,
          data: getPortfolioData(),
          theme: selectedTheme,
        };

        const templateWrapper = (
          Component: React.ComponentType<{
            preview: boolean;
            data: PortfolioData;
            theme?: string;
          }>
        ) => (
          <div className="w-full h-full scale-[0.15] origin-top-left transform transition-transform duration-200 overflow-hidden">
            <div className="w-[800px] h-[1000px]">
              <Component {...templateProps} />
            </div>
          </div>
        );

        switch (template.id) {
          case "clean-mono":
            return templateWrapper(CleanMonoTemplate);
          case "dark-minimalist":
            return templateWrapper(DarkMinimalistTemplate);
          case "dark-tech":
            return templateWrapper(DarkTechTemplate);
          case "modern-ai-focused":
            return templateWrapper(ModernAIFocusedTemplate);
          default:
            return null;
        }
      };

      return (
        <div
          className={`relative rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden hover:shadow-lg ${
            selectedTemplate === template.id
              ? "ring-2 ring-primary border-primary shadow-md"
              : "border-border hover:border-muted-foreground/30"
          }`}
          onClick={() => setSelectedTemplate(template.id)}
        >
          <div className="aspect-[4/5] bg-muted/20 flex items-start justify-start p-2">
            <div className="w-full h-full overflow-hidden rounded-lg bg-background shadow-sm">
              {getTemplateComponent()}
            </div>
          </div>
          <div className="p-4 border-t bg-card">
            <h3 className="font-semibold text-center text-sm">
              {template.name}
            </h3>
            <p className="text-xs text-muted-foreground text-center mt-1 leading-relaxed">
              {template.description}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 h-8 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewTemplate(template.id);
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
          </div>
          {selectedTemplate === template.id && (
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1.5 shadow-sm">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>
      );
    };

    return (
      <>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl">Choose a Template</CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Select a design that best fits your professional style
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {templates.map((template) => (
                <TemplatePreview key={template.id} template={template} />
              ))}
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Color Theme</h3>
              <div className="flex flex-wrap gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    className={`w-12 h-12 rounded-full ${
                      theme.color
                    } flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-md ${
                      selectedTheme === theme.id
                        ? "ring-4 ring-offset-2 ring-primary shadow-lg scale-105"
                        : "shadow-sm"
                    }`}
                    onClick={() => setSelectedTheme(theme.id)}
                    title={theme.name}
                  >
                    {selectedTheme === theme.id && (
                      <Check className="h-4 w-4 text-white drop-shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {previewTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">
                  {templates.find((t) => t.id === previewTemplate)?.name}{" "}
                  Preview
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewTemplate(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                <div className="scale-75 origin-top">
                  {(() => {
                    const templateProps = {
                      preview: true as const,
                      data: getPortfolioData(),
                      theme: selectedTheme,
                    };

                    switch (previewTemplate) {
                      case "clean-mono":
                        return <CleanMonoTemplate {...templateProps} />;
                      case "dark-minimalist":
                        return <DarkMinimalistTemplate {...templateProps} />;
                      case "dark-tech":
                        return <DarkTechTemplate {...templateProps} />;
                      case "modern-ai-focused":
                        return <ModernAIFocusedTemplate {...templateProps} />;
                      default:
                        return null;
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderPersonalInfoStep = () => {
    return (
      <Card>
        <CardHeader className="pb-6">
          <CardTitle className="text-xl">Personal Information</CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tell us about yourself
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo Upload */}
          {/* TODO: Add ImageUpload component back after fixing syntax */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Photo</label>
            <p className="text-xs text-muted-foreground">
              Image upload functionality will be added here
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name <span className="text-red-500">*</span>
              </Label>
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
                className="h-11"
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name <span className="text-red-500">*</span>
              </Label>
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
                className="h-11"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={resumeData.personalInfo.email}
                onChange={(e) =>
                  setResumeData((prev) => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      email: e.target.value,
                    },
                  }))
                }
                className="h-11"
                placeholder="your.email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone
              </Label>
              <Input
                id="phone"
                value={resumeData.personalInfo.phone}
                onChange={(e) =>
                  setResumeData((prev) => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      phone: e.target.value,
                    },
                  }))
                }
                className="h-11"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Location
            </Label>
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
              className="h-11"
              placeholder="Enter your location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary" className="text-sm font-medium">
              Professional Summary
            </Label>
            <Textarea
              id="summary"
              rows={4}
              value={resumeData.personalInfo.summary}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    summary: e.target.value,
                  },
                }))
              }
              className="resize-none"
              placeholder="Write a brief summary of your professional experience and goals"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resumeTitle" className="text-sm font-medium">
              Resume Title{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="resumeTitle"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              className="h-11"
              placeholder="e.g., John Doe - Senior Software Engineer"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to auto-generate from your name
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm font-medium">
                LinkedIn URL
              </Label>
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
                className="h-11"
                placeholder="Enter your LinkedIn URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github" className="text-sm font-medium">
                GitHub URL
              </Label>
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
                className="h-11"
                placeholder="Enter your GitHub URL"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
            onKeyDown={(e) => {
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

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const renderExperienceStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Work Experience</CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">
          List your work experience in reverse chronological order
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {resumeData.experience.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-muted/10">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4 font-medium">
              No experience added yet
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Add your work experience to strengthen your resume
            </p>
            <Button onClick={addExperience} className="h-11 px-6">
              <Plus className="h-4 w-4 mr-2" /> Add Experience
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {resumeData.experience.map((exp, index) => (
              <div
                key={exp.id}
                className="border border-border rounded-xl p-6 space-y-6 bg-card shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">
                      Experience #{index + 1}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setResumeData((prev) => ({
                        ...prev,
                        experience: prev.experience.filter(
                          (e) => e.id !== exp.id
                        ),
                      }))
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Job Title</Label>
                    <Input
                      value={exp.position}
                      onChange={(e) =>
                        updateExperience(exp.id, "position", e.target.value)
                      }
                      placeholder="e.g., Senior Software Engineer"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(exp.id, "company", e.target.value)
                      }
                      placeholder="e.g., Google"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperience(exp.id, "startDate", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">End Date</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type={exp.isPresent ? "text" : "month"}
                        value={exp.isPresent ? "Present" : exp.endDate || ""}
                        onChange={(e) =>
                          updateExperience(exp.id, "endDate", e.target.value)
                        }
                        disabled={exp.isPresent}
                        className={`h-11 flex-1 ${
                          exp.isPresent
                            ? "text-muted-foreground bg-muted/50"
                            : ""
                        }`}
                      />
                      <div className="flex items-center space-x-2 bg-muted/30 px-3 py-2 rounded-lg">
                        <input
                          type="checkbox"
                          id={`present-${exp.id}`}
                          checked={exp.isPresent}
                          onChange={(e) =>
                            updateExperience(
                              exp.id,
                              "isPresent",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label
                          htmlFor={`present-${exp.id}`}
                          className="text-sm font-medium"
                        >
                          Present
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) =>
                      updateExperience(exp.id, "description", e.target.value)
                    }
                    placeholder="Describe your responsibilities and achievements"
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addExperience}
              className="w-full mt-4 h-11 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Experience
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const updateEducation = (id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const renderEducationStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add your educational background
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {resumeData.education.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No education added yet</p>
            <Button onClick={addEducation}>
              <Plus className="h-4 w-4 mr-2" /> Add Education
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {resumeData.education.map((edu, index) => (
              <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">Education #{index + 1}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setResumeData((prev) => ({
                        ...prev,
                        education: prev.education.filter(
                          (e) => e.id !== edu.id
                        ),
                      }))
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(edu.id, "institution", e.target.value)
                      }
                      placeholder="e.g., Stanford University"
                    />
                  </div>
                  <div>
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(edu.id, "degree", e.target.value)
                      }
                      placeholder="e.g., Bachelor of Science"
                    />
                  </div>
                  <div>
                    <Label>Field of Study</Label>
                    <Input
                      value={edu.field || ""}
                      onChange={(e) =>
                        updateEducation(edu.id, "field", e.target.value)
                      }
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div>
                    <Label>GPA</Label>
                    <Input
                      value={edu.gpa || ""}
                      onChange={(e) =>
                        updateEducation(edu.id, "gpa", e.target.value)
                      }
                      placeholder="e.g., 3.8"
                    />
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) =>
                        updateEducation(edu.id, "startDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>End Date (or expected)</Label>
                    <Input
                      type="month"
                      value={edu.endDate}
                      onChange={(e) =>
                        updateEducation(edu.id, "endDate", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addEducation}
              className="w-full mt-4 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Education
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const updateProject = (id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    }));
  };

  const addTechStack = (projectId: string, tech: string) => {
    if (tech.trim()) {
      setResumeData((prev) => ({
        ...prev,
        projects: prev.projects.map((proj) =>
          proj.id === projectId
            ? {
                ...proj,
                techStack: [...proj.techStack, tech.trim()],
              }
            : proj
        ),
      }));
    }
  };

  const removeTechStack = (projectId: string, techToRemove: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === projectId
          ? {
              ...proj,
              techStack: proj.techStack.filter((tech) => tech !== techToRemove),
            }
          : proj
      ),
    }));
  };

  const renderProjectsStep = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showcase your best projects
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {resumeData.projects.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">
                No projects added yet
              </p>
              <Button onClick={addProject}>
                <Plus className="h-4 w-4 mr-2" /> Add Project
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {resumeData.projects.map((proj, index) => (
                <div key={proj.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">Project #{index + 1}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setResumeData((prev) => ({
                          ...prev,
                          projects: prev.projects.filter(
                            (p) => p.id !== proj.id
                          ),
                        }))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Project Name</Label>
                      <Input
                        value={proj.name}
                        onChange={(e) =>
                          updateProject(proj.id, "name", e.target.value)
                        }
                        placeholder="e.g., E-commerce Platform"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={proj.description}
                        onChange={(e) =>
                          updateProject(proj.id, "description", e.target.value)
                        }
                        placeholder="Describe the project, your role, and key achievements"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Source Code URL (optional)</Label>
                      <Input
                        value={proj.sourceUrl || ""}
                        onChange={(e) =>
                          updateProject(proj.id, "sourceUrl", e.target.value)
                        }
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                    <div>
                      <Label>Live Demo URL (optional)</Label>
                      <Input
                        value={proj.demoUrl || ""}
                        onChange={(e) =>
                          updateProject(proj.id, "demoUrl", e.target.value)
                        }
                        placeholder="https://project-demo.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Technologies Used</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {proj.techStack.map((tech) => (
                          <Badge
                            key={`${proj.id}-${tech}`}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {tech}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeTechStack(proj.id, tech)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newTech[proj.id] || ""}
                          onChange={(e) =>
                            setNewTech((prev) => ({
                              ...prev,
                              [proj.id]: e.target.value,
                            }))
                          }
                          placeholder="Add a technology"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newTech[proj.id]) {
                              addTechStack(proj.id, newTech[proj.id]);
                              setNewTech((prev) => ({
                                ...prev,
                                [proj.id]: "",
                              }));
                              e.preventDefault();
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            if (newTech[proj.id]) {
                              addTechStack(proj.id, newTech[proj.id]);
                              setNewTech((prev) => ({
                                ...prev,
                                [proj.id]: "",
                              }));
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addProject}
                className="w-full mt-4 bg-transparent"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Another Project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Helper functions for Additional step
  const updateCertification = (id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    }));
  };

  const addCertification = () => {
    const newCert = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      issuer: "",
      date: "",
      url: "",
    };
    setResumeData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, newCert],
    }));
  };

  const renderCertificationsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Certifications</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add any professional certifications you've earned
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {resumeData.certifications.length === 0 ? (
          <div className="text-center py-4 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-2">
              No certifications added yet
            </p>
            <Button variant="outline" onClick={addCertification} size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Certification
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {resumeData.certifications.map((cert, index) => (
              <div key={cert.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">Certification #{index + 1}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setResumeData((prev) => ({
                        ...prev,
                        certifications: prev.certifications.filter(
                          (c) => c.id !== cert.id
                        ),
                      }))
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Certification Name</Label>
                    <Input
                      value={cert.name}
                      onChange={(e) =>
                        updateCertification(cert.id, "name", e.target.value)
                      }
                      placeholder="e.g., AWS Certified Solutions Architect"
                    />
                  </div>
                  <div>
                    <Label>Issuing Organization</Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) =>
                        updateCertification(cert.id, "issuer", e.target.value)
                      }
                      placeholder="e.g., Amazon Web Services"
                    />
                  </div>
                  <div>
                    <Label>Date Earned</Label>
                    <Input
                      type="month"
                      value={cert.date || ""}
                      onChange={(e) =>
                        updateCertification(cert.id, "date", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Credential URL (optional)</Label>
                    <Input
                      value={cert.url || ""}
                      onChange={(e) =>
                        updateCertification(cert.id, "url", e.target.value)
                      }
                      placeholder="https://example.com/cert/123"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addCertification}
              className="w-full mt-2 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Certification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const updateLanguage = (id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.map((lang) =>
        lang.id === id ? { ...lang, [field]: value } : lang
      ),
    }));
  };

  const addLanguage = () => {
    const newLang = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      proficiency: "",
    };
    setResumeData((prev) => ({
      ...prev,
      languages: [...prev.languages, newLang],
    }));
  };

  const renderLanguagesSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Languages</CardTitle>
        <p className="text-sm text-muted-foreground">
          List languages you're proficient in
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {resumeData.languages.length === 0 ? (
          <div className="text-center py-4 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-2">No languages added yet</p>
            <Button variant="outline" onClick={addLanguage} size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Language
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {resumeData.languages.map((lang, index) => (
              <div key={lang.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium">Language #{index + 1}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setResumeData((prev) => ({
                        ...prev,
                        languages: prev.languages.filter(
                          (l) => l.id !== lang.id
                        ),
                      }))
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Language</Label>
                    <Input
                      value={lang.name}
                      onChange={(e) =>
                        updateLanguage(lang.id, "name", e.target.value)
                      }
                      placeholder="e.g., Spanish"
                    />
                  </div>
                  <div>
                    <Label>Proficiency Level</Label>
                    <select
                      value={lang.proficiency || ""}
                      onChange={(e) =>
                        updateLanguage(lang.id, "proficiency", e.target.value)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select proficiency</option>
                      <option value="Native">Native</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Basic">Basic</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addLanguage}
              className="w-full mt-2 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Language
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const updateCustomSection = (id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      ),
    }));
  };

  const addCustomSection = () => {
    const newSection = {
      id: Math.random().toString(36).substr(2, 9),
      title: "",
      description: "",
    };
    setResumeData((prev) => ({
      ...prev,
      customSections: [...prev.customSections, newSection],
    }));
  };

  const renderCustomSections = () => (
    <Card>
      <CardHeader>
        <CardTitle>Custom Sections</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add any additional sections to highlight your unique qualifications
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {resumeData.customSections.length === 0 ? (
          <div className="text-center py-4 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-2">
              No custom sections added yet
            </p>
            <Button variant="outline" onClick={addCustomSection} size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Custom Section
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {resumeData.customSections.map((section, index) => (
              <div key={section.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">Section #{index + 1}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setResumeData((prev) => ({
                        ...prev,
                        customSections: prev.customSections.filter(
                          (s) => s.id !== section.id
                        ),
                      }))
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={section.title}
                      onChange={(e) =>
                        updateCustomSection(section.id, "title", e.target.value)
                      }
                      placeholder="e.g., Volunteer Work, Publications, Awards"
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={section.description}
                      onChange={(e) =>
                        updateCustomSection(
                          section.id,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Enter the content for this section. You can use bullet points or paragraphs."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addCustomSection}
              className="w-full mt-2 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Custom Section
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderProgressSummary = () => {
    const completedSections = [
      {
        name: "Personal Info",
        completed:
          resumeData.personalInfo.firstName &&
          resumeData.personalInfo.lastName &&
          resumeData.personalInfo.email,
      },
      { name: "Experience", completed: resumeData.experience.length > 0 },
      { name: "Education", completed: resumeData.education.length > 0 },
      { name: "Skills", completed: resumeData.skills.length > 0 },
      { name: "Projects", completed: resumeData.projects.length > 0 },
      {
        name: "Certifications",
        completed: resumeData.certifications.length > 0,
      },
      { name: "Languages", completed: resumeData.languages.length > 0 },
    ];

    const completedCount = completedSections.filter((s) => s.completed).length;
    const totalSections = completedSections.length;

    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Resume Progress</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Complete all sections for a strong resume
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {completedCount}/{totalSections}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Sections Complete
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completedSections.map((section) => (
              <div
                key={section.name}
                className="flex items-center justify-between p-2 rounded-lg bg-background/50"
              >
                <div className="flex items-center">
                  <div
                    className={`h-3 w-3 rounded-full mr-3 transition-colors ${
                      section.completed
                        ? "bg-green-500 shadow-sm"
                        : "bg-muted-foreground/30"
                    }`}
                  ></div>
                  <span
                    className={`text-sm font-medium ${
                      section.completed
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {section.name}
                  </span>
                </div>
                {section.completed && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderTemplateStep();
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderExperienceStep();
      case 3:
        return renderEducationStep();
      case 4:
        return renderSkillsStep();
      case 5:
        return renderProjectsStep();
      case 6:
        return (
          <div className="space-y-6">
            {renderProgressSummary()}
            {renderCertificationsSection()}
            {renderLanguagesSection()}
            {renderCustomSections()}
          </div>
        );
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex gap-8">
          {/* Left Panel - Form */}
          <div className="flex-1 max-w-3xl">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Create Resume
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Build your professional resume step by step
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${getCompletionPercentage()}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {getCompletionPercentage()}% complete
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFullPreview(!showFullPreview)}
                  className="h-11 px-6"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showFullPreview ? "Hide" : "Show"} Preview
                </Button>
              </div>

              <div className="bg-card rounded-xl p-4 shadow-sm border">
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3 whitespace-nowrap px-3 py-2 rounded-lg transition-all ${
                        index <= currentStep
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          index === currentStep
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : index < currentStep
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index < currentStep ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm">
                          {step.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {step.description}
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Step Content */}
            <div
              className={`mb-8 transition-all duration-300 ${
                isTransitioning
                  ? "opacity-50 scale-95"
                  : "opacity-100 scale-100"
              }`}
            >
              {renderCurrentStep()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center p-6 bg-card rounded-xl shadow-sm border">
              <Button
                variant="outline"
                onClick={() => goToStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0 || isTransitioning}
                className="h-11 px-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-3">
                {currentStep === steps.length - 1 ? (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-11 px-8"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      "Save Resume"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      goToStep(Math.min(steps.length - 1, currentStep + 1))
                    }
                    disabled={isTransitioning || !canProceedToNext}
                    className="h-11 px-6"
                    title={
                      !canProceedToNext ? "Please fill in required fields" : ""
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
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Live Preview
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    See your resume as you build it
                  </p>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg overflow-hidden border shadow-inner">
                    <div className="scale-[0.35] origin-top-left w-[285%] h-[285%] bg-white">
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b flex justify-between items-center bg-card">
                <div>
                  <h2 className="text-xl font-semibold">Resume Preview</h2>
                  <p className="text-sm text-muted-foreground">
                    Full-size preview of your resume
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowFullPreview(false)}
                  className="h-10 w-10 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-6 overflow-auto max-h-[calc(95vh-100px)] bg-muted/20">
                <div className="bg-white rounded-lg shadow-lg p-8 mx-auto max-w-4xl">
                  {renderResumePreview()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
