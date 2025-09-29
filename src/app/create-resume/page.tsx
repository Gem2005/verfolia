"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight, Eye, Check, PenSquare, Save, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { resumeService } from "@/services/resume-service";
import { CleanMonoTemplate, DarkMinimalistTemplate, DarkTechTemplate, ModernAIFocusedTemplate } from "@/components/templates";
import type { PortfolioData } from "@/types/PortfolioTypes";
import { ResumeData } from "@/types/ResumeData";
import { validateEmail, validatePhone, validateUrl, validateWordCount, validateGPA, validateDateRange, validateSkill, validateProficiency } from "../../utils/validation";
import { steps, templates, themes } from "../../../data/constants";
import { getPortfolioData } from "../../components/PortfolioDataProvider";
import { TemplateStep } from "../../components/steps/TemplateStep";
import { PersonalInfoStep } from "../../components/steps/PersonalInfoStep";
import { ExperienceStep } from "../../components/steps/ExperienceStep";
import { EducationStep } from "../../components/steps/EducationStep";
import { SkillsStep } from "../../components/steps/SkillsStep";
import { ProjectsStep } from "../../components/steps/ProjectsStep";
import { AdditionalStep } from "../../components/steps/AdditionalStep";

export const dynamic = "force-dynamic";

export default function CreateResumePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState("black");
  const [selectedTemplate, setSelectedTemplate] = useState("clean-mono");
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [resumeTitle, setResumeTitle] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newTech, setNewTech] = useState<{ [key: string]: string }>({});
  const [showChoice, setShowChoice] = useState(false); // Default to false

  // Redirect unauthenticated users after auth state resolves
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.replace('/login?returnTo=/create-resume');
  //   }
  // }, [loading, user, router]);

    // Handle prefill or show choice screen logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("prefill");
    if (key) {
      try {
        const raw = sessionStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          setResumeTitle(parsed.title || "Imported Resume");
          if (parsed.markdown) {
            setMarkdown(parsed.markdown);
          }
          setResumeData((prev) => ({
            ...prev,
            title: parsed.title || prev.title,
            personalInfo: {
              ...prev.personalInfo,
              ...parsed.personalInfo,
            },
            experience: parsed.experience || prev.experience,
            education: parsed.education || prev.education,
            skills: parsed.skills || prev.skills,
            projects: parsed.projects || prev.projects,
            certifications: parsed.certifications || prev.certifications,
            languages: parsed.languages || prev.languages,
            customSections: parsed.customSections || prev.customSections,
          }));
          setShowChoice(false); // Prefill data exists, go to builder
        } else {
          alert("The uploaded resume data couldn't be found. Please try uploading again.");
          router.replace('/choice');
        }
      } catch (e) {
        console.error("Failed to prefill from parsed data", e);
      }
    } else {
      setShowChoice(true); // No prefill data, show choice
    }
  }, [router]);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [resumeData, setResumeData] = useState<ResumeData>({
    user_id: user?.id || "",
    title: resumeTitle,
    template_id: 1,
    theme_id: 1,
    is_public: false,
    slug: "",
    view_count: 0,
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      title: "",
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

  const validatePersonalInfo = useCallback(() => {
    const errors: { [key: string]: string } = {};
    if (!resumeTitle.trim()) errors.resumeTitle = "Resume title is required";
    if (!resumeData.personalInfo.firstName.trim()) errors.firstName = "First name is required";
    if (!resumeData.personalInfo.lastName.trim()) errors.lastName = "Last name is required";
    if (!resumeData.personalInfo.email.trim()) errors.email = "Email is required";
    if (!validateEmail(resumeData.personalInfo.email)) errors.email = "Please enter a valid email address";
    if (resumeData.personalInfo.phone.trim() && !validatePhone(resumeData.personalInfo.phone)) errors.phone = "Please enter a valid phone number";
    if (!resumeData.personalInfo.title.trim()) errors.title = "Current designation is required";
    if (resumeData.personalInfo.summary.trim() && !validateWordCount(resumeData.personalInfo.summary, 20, 100)) errors.summary = "Summary should be between 20 and 100 words";
    if (resumeData.personalInfo.linkedinUrl && !validateUrl(resumeData.personalInfo.linkedinUrl)) errors.linkedinUrl = "LinkedIn URL must start with https://";
    if (resumeData.personalInfo.githubUrl && !validateUrl(resumeData.personalInfo.githubUrl)) errors.githubUrl = "GitHub URL must start with https://";
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeTitle, resumeData.personalInfo]);

  const validateExperience = useCallback(() => {
    const errors: { [key: string]: string } = {};
    if (resumeData.experience.length === 0) {
      errors.experience = "At least one work experience is required.";
    }
    resumeData.experience.forEach((exp) => {
      const prefix = `experience_${exp.id}`;
      if (!exp.position.trim()) errors[`${prefix}_position`] = "Job title is required";
      if (!exp.company.trim()) errors[`${prefix}_company`] = "Company name is required";
      if (!exp.startDate.trim()) errors[`${prefix}_startDate`] = "Start date is required";
      if (!exp.isPresent && !exp.endDate?.trim()) errors[`${prefix}_endDate`] = "End date is required";
      if (exp.startDate && exp.endDate && !exp.isPresent && !validateDateRange(exp.startDate, exp.endDate)) errors[`${prefix}_endDate`] = "End date must be after start date";
      if (!exp.description.trim()) errors[`${prefix}_description`] = "Job description is required";
      else if (!validateWordCount(exp.description, 20, 100)) errors[`${prefix}_description`] = "Description should be between 20 and 100 words";
    });
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.experience]);

  const validateEducation = useCallback(() => {
    const errors: { [key: string]: string } = {};
    resumeData.education.forEach((edu) => {
      const prefix = `education_${edu.id}`;
      if (!edu.institution.trim()) errors[`${prefix}_institution`] = "Institution name is required";
      if (!edu.degree.trim()) errors[`${prefix}_degree`] = "Degree is required";
      if (edu.startDate && edu.endDate && !validateDateRange(edu.startDate, edu.endDate)) errors[`${prefix}_endDate`] = "End date must be after start date";
      if (edu.gpa && !validateGPA(edu.gpa)) errors[`${prefix}_gpa`] = "GPA must be a valid format (e.g., 3.8, 8.7/10, 85%)";
    });
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.education]);

  const validateProjects = useCallback(() => {
    const errors: { [key: string]: string } = {};
    resumeData.projects.forEach((proj) => {
      const prefix = `project_${proj.id}`;
      if (!proj.name.trim()) errors[`${prefix}_name`] = "Project name is required";
      if (!proj.description.trim()) errors[`${prefix}_description`] = "Project description is required";
      else if (!validateWordCount(proj.description, 20, 100)) errors[`${prefix}_description`] = "Description should be between 20 and 100 words";
      if (!proj.techStack || proj.techStack.length === 0) errors[`${prefix}_techStack`] = "At least one technology is required";
      if (proj.sourceUrl && !validateUrl(proj.sourceUrl)) errors[`${prefix}_sourceUrl`] = "Source URL must start with https://";
      if (proj.demoUrl && !validateUrl(proj.demoUrl)) errors[`${prefix}_demoUrl`] = "Demo URL must start with https://";
    });
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.projects]);

  const validateSkills = useCallback(() => {
    const errors: { [key: string]: string } = {};
    resumeData.skills.forEach((skill, index) => {
      if (!validateSkill(skill)) errors[`skill_${index}`] = "Skill must be between 2 and 50 characters";
    });
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.skills]);

  const validateCertifications = useCallback(() => {
    const errors: { [key: string]: string } = {};
    resumeData.certifications.forEach((cert) => {
      const prefix = `certification_${cert.id}`;
      if (!cert.name.trim()) errors[`${prefix}_name`] = "Certification name is required";
      if (!cert.issuer.trim()) errors[`${prefix}_issuer`] = "Issuer is required";
      if (!cert.date || !cert.date.trim()) errors[`${prefix}_date`] = "Date is required";
    });
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.certifications]);

  const validateLanguages = useCallback(() => {
    const errors: { [key: string]: string } = {};
    resumeData.languages.forEach((lang) => {
      const prefix = `language_${lang.id}`;
      if (!lang.name.trim()) errors[`${prefix}_name`] = "Language name is required";
      if (!lang.proficiency || !lang.proficiency.trim()) errors[`${prefix}_proficiency`] = "Proficiency level is required";
      else if (!validateProficiency(lang.proficiency)) errors[`${prefix}_proficiency`] = "Please select a valid proficiency level";
    });
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.languages]);

  const validateCustomSections = useCallback(() => {
    const errors: { [key: string]: string } = {};
    resumeData.customSections.forEach((section) => {
      const prefix = `customSection_${section.id}`;
      if (!section.title.trim()) errors[`${prefix}_title`] = "Section title is required";
      if (!section.description.trim()) errors[`${prefix}_description`] = "Section description is required";
      else if (!validateWordCount(section.description, 20, 100)) errors[`${prefix}_description`] = "Description should be between 20 and 100 words";
    });
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.customSections]);


  const currentTemplate =
    templates.find((t) => t.id === selectedTemplate) || templates[0];

  const goToStep = (step: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 150);
  };

  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        const personalInfoValidation = validatePersonalInfo();
        setValidationErrors(personalInfoValidation.errors);
        return personalInfoValidation.isValid;
      case 2:
        const experienceValidation = validateExperience();
        setValidationErrors(experienceValidation.errors);
        return experienceValidation.isValid;
      case 3:
        const educationValidation = validateEducation();
        setValidationErrors(educationValidation.errors);
        return educationValidation.isValid;
      case 4:
        const skillsValidation = validateSkills();
        setValidationErrors(skillsValidation.errors);
        return skillsValidation.isValid;
      case 5:
        const projectsValidation = validateProjects();
        setValidationErrors(projectsValidation.errors);
        return projectsValidation.isValid;
      case 6:
        const certificationsValidation = validateCertifications();
        const languagesValidation = validateLanguages();
        const customSectionsValidation = validateCustomSections();

        const allErrors = {
          ...certificationsValidation.errors,
          ...languagesValidation.errors,
          ...customSectionsValidation.errors,
        };

        setValidationErrors(allErrors);
        return (
          certificationsValidation.isValid &&
          languagesValidation.isValid &&
          customSectionsValidation.isValid
        );
      default:
        return true;
    }
  }, [
    currentStep,
    validatePersonalInfo,
    validateExperience,
    validateEducation,
    validateSkills,
    validateProjects,
    validateCertifications,
    validateLanguages,
    validateCustomSections,
  ]);

  const canProceedToNext = useMemo(
    () => validateCurrentStep(),
    [validateCurrentStep]
  );

  const renderResumePreview = () => {
    const templateProps = {
      preview: true,
      data: getPortfolioData(resumeData),
      theme: selectedTheme,
    };

    const themeClass = `theme-${selectedTheme}`;
    const templateComponent = (() => {
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
    })();

    return (
      <div className={`${themeClass} template-wrapper`}>
        {templateComponent}
      </div>
    );
  };

  const handleSave = async () => {
    // Check authentication when trying to save
    if (!user) {
      try {
        const currentData = {
          title: resumeTitle,
          personalInfo: resumeData.personalInfo,
          experience: resumeData.experience,
          education: resumeData.education,
          skills: resumeData.skills,
          projects: resumeData.projects,
          certifications: resumeData.certifications,
          languages: resumeData.languages,
          customSections: resumeData.customSections,
          selectedTemplate,
          selectedTheme,
          currentStep
        };
        sessionStorage.setItem('resumeData', JSON.stringify(currentData));
        
        // Redirect to login with return to create-resume
        router.push('/login?returnTo=/create-resume&action=save');
        return;
      } catch (e) {
        toast.error("Please log in to save your resume.");
        router.push('/login?returnTo=/create-resume');
        return;
      }
    }

    if (!validateCurrentStep()) {
      toast.error("Please fix the errors on this page before saving.");
      return;
    }

    setSaving(true);
    toast.loading("Saving your resume...");

    try {
      const resumePayload = {
        user_id: user.id,
        title: resumeTitle,
        template_id: selectedTemplate,
        theme_id: selectedTheme,
        is_public: false,
        personal_info: resumeData.personalInfo,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills,
        projects: resumeData.projects,
        certifications: resumeData.certifications,
        languages: resumeData.languages,
        custom_sections: resumeData.customSections,
      };

      const savedResume = await resumeService.createResume(resumePayload as any);

      if (savedResume && savedResume.slug) {
        // Clear temporary data
        try {
          sessionStorage.removeItem('resumeData');
        } catch {}
        
        toast.dismiss();
        toast.success("Resume saved successfully!");
        router.push(`/resume/${savedResume.slug}`);
      } else {
        throw new Error("Failed to save resume or receive a valid response.");
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.dismiss();
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred."
      );
    } finally {
      setSaving(false);
    }
  };

  // Restore resume data after login
  useEffect(() => {
    if (user && !loading) {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      
      if (action === 'save') {
        console.log('Restoring resume data after login...');
        
        try {
          const savedData = sessionStorage.getItem('resumeData');
          if (savedData) {
            const parsed = JSON.parse(savedData);
            console.log('Found saved data:', parsed);
            
            // Restore all the data immediately
            setResumeTitle(parsed.title || '');
            setSelectedTemplate(parsed.selectedTemplate || 'clean-mono');
            setSelectedTheme(parsed.selectedTheme || 'black');
            setCurrentStep(parsed.currentStep || 0);
            
            setResumeData(prev => ({
              ...prev,
              title: parsed.title || prev.title,
              personalInfo: parsed.personalInfo || prev.personalInfo,
              experience: parsed.experience || prev.experience,
              education: parsed.education || prev.education,
              skills: parsed.skills || prev.skills,
              projects: parsed.projects || prev.projects,
              certifications: parsed.certifications || prev.certifications,
              languages: parsed.languages || prev.languages,
              customSections: parsed.customSections || prev.customSections,
            }));
            
            // Clean up URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            
            // Show success message
            toast.success("Welcome back! Your resume data has been restored.");
            
            // Auto-save immediately with the parsed data (not component state)
            setTimeout(async () => {
              console.log('Auto-saving restored data...');
              
              if (!user) {
                console.error('No user found during auto-save');
                return;
              }

              setSaving(true);
              toast.loading("Saving your restored resume...");

              try {
                const resumePayload = {
                  user_id: user.id,
                  title: parsed.title || 'My Resume',
                  template_id: parsed.selectedTemplate || 'clean-mono',
                  theme_id: parsed.selectedTheme || 'black',
                  is_public: false,
                  personal_info: parsed.personalInfo,
                  experience: parsed.experience,
                  education: parsed.education,
                  skills: parsed.skills,
                  projects: parsed.projects,
                  certifications: parsed.certifications,
                  languages: parsed.languages,
                  custom_sections: parsed.customSections,
                };

                console.log('Saving resume payload:', resumePayload);
                const savedResume = await resumeService.createResume(resumePayload as any);

                if (savedResume && savedResume.slug) {
                  // Clear temporary data
                  try {
                    sessionStorage.removeItem('resumeData');
                  } catch {}
                  
                  toast.dismiss();
                  toast.success("Resume saved successfully! Redirecting...");
                  
                  // Redirect to the saved resume
                  setTimeout(() => {
                    router.push(`/resume/${savedResume.slug}`);
                  }, 1500);
                } else {
                  throw new Error("Failed to save resume or receive a valid response.");
                }
              } catch (error) {
                console.error("Error saving restored resume:", error);
                toast.dismiss();
                toast.error("Failed to save your resume. You can try saving manually.");
              } finally {
                setSaving(false);
              }
            }, 1000);
          } else {
            console.log('No saved data found in sessionStorage');
            toast.error("No resume data found. Please start over.");
          }
        } catch (e) {
          console.error('Failed to restore resume data', e);
          toast.error("Failed to restore your resume data. Please start over.");
        }
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="glass-bg flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-glass-blue mx-auto mb-4"></div>
          <p className="text-glass-white">Loading...</p>
        </div>
      </div>
    );
  }

  // NO AUTH BLOCKING - Allow users to explore without login

  return (
    <div 
      className="min-h-screen relative overflow-hidden glass-bg" 
      data-page="create-resume"
    >
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-orb absolute -top-40 -right-40 w-80 h-80"></div>
        <div className="floating-orb absolute -bottom-40 -left-40 w-80 h-80" style={{animationDelay: '2s'}}></div>
        <div className="floating-orb absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96" style={{animationDelay: '4s'}}></div>
        
        {/* Glassmorphism orbs */}
        <div className="glass-card absolute top-20 left-20 w-32 h-32"></div>
        <div className="glass-card absolute bottom-20 right-20 w-24 h-24"></div>
        <div className="glass-card absolute top-1/3 right-1/4 w-16 h-16"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Glassmorphism Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-4">
                <div className="glass-card w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl">
                  <PenSquare className="w-8 h-8 text-glass-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-glass-white">
              Create Resume
            </h1>
                  <p className="text-glass-gray text-xl font-medium">
              Build your professional resume with real-time preview
            </p>
          </div>
              </div>
            </div>
          <div className="flex items-center gap-4">
                <Button
                variant="outline"
                onClick={() => router.push('/choice')}
                className="glass-button flex items-center gap-2 px-6 py-3"
                >
                <ArrowLeft className="w-4 h-4" />
                Back to Choice
                </Button>
              <Button
                variant="outline"
                onClick={() => setShowMarkdownEditor(true)}
                className="glass-button flex items-center gap-2 px-6 py-3"
              >
                <PenSquare className="w-4 h-4" />
                Markdown Editor
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    const exportPayload = {
                      title: resumeTitle || "My Resume",
                      personalInfo: resumeData.personalInfo,
                      experience: resumeData.experience,
                      education: resumeData.education,
                      skills: resumeData.skills,
                      projects: resumeData.projects,
                      certifications: resumeData.certifications,
                      languages: resumeData.languages,
                      customSections: resumeData.customSections,
                      markdown,
                    };
                    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `resume-${Date.now()}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  } catch (e) {
                    console.error('JSON export failed', e);
                  }
                }}
                className="glass-button flex items-center gap-2 px-6 py-3"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="glass-button flex items-center gap-2 px-8 py-3 text-lg font-semibold"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Resume
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Glassmorphism Progress Indicator */}
          <div className="rounded-2xl p-8 shadow-2xl border border-white/20" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)'}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {(() => { const Icon = steps[currentStep].icon as any; return Icon ? <Icon className="w-6 h-6 text-white" /> : null; })()}
                {steps[currentStep].title}
              </h2>
              <span className="text-sm text-white/70 px-4 py-2 rounded-full font-semibold border border-white/20" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)'}}>
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isActive
                          ? "text-white shadow-2xl border border-white/40"
                          : isCompleted
                          ? "text-white shadow-lg border border-white/30"
                          : "text-white/50 border border-white/10"
                      }`}
                      style={{
                        background: isActive 
                          ? 'rgba(255, 255, 255, 0.3)' 
                          : isCompleted 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)'
                      }}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 h-1 mx-3 rounded-full transition-all duration-300 ${
                          isCompleted ? "bg-white/30" : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Glassmorphism Step Navigation */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? "flex-1" : ""
                }`}
              >
                <button
                  onClick={() => goToStep(step.id)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "text-white shadow-2xl border border-white/40"
                        : isCompleted
                        ? "text-white border border-white/30 shadow-lg"
                        : "text-white/70 border border-white/20 hover:bg-white/20"
                    }`}
                    style={{
                      background: isActive 
                        ? 'rgba(255, 255, 255, 0.3)' 
                        : isCompleted 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                      isActive ? "bg-white/20" : isCompleted ? "bg-white/30" : "bg-white/10"
                    }`}>
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                    <div className={`hidden sm:block flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${
                      isCompleted ? "bg-white/30" : "bg-white/10"
                    }`} />
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* Glassmorphism Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Form Section */}
          <div className="space-y-8">
            <div
              className={`transition-all duration-300 ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              {currentStep === 0 && (
                <TemplateStep
                  selectedTemplate={selectedTemplate}
                  selectedTheme={selectedTheme}
                  onTemplateSelect={setSelectedTemplate}
                  onThemeSelect={setSelectedTheme}
                  getPortfolioData={() => getPortfolioData(resumeData)}
                  previewTemplate={previewTemplate}
                  setPreviewTemplate={setPreviewTemplate}
                />
              )}
              {currentStep === 1 && (
                <PersonalInfoStep
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  resumeTitle={resumeTitle}
                  setResumeTitle={setResumeTitle}
                  validationErrors={validationErrors}
                />
              )}
              {currentStep === 2 && (
                <ExperienceStep
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  validationErrors={validationErrors}
                />
              )}
              {currentStep === 3 && (
                <EducationStep
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  validationErrors={validationErrors}
                />
              )}
              {currentStep === 4 && (
                <SkillsStep
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  newSkill={newSkill}
                  setNewSkill={setNewSkill}
                  validationErrors={validationErrors}
                />
              )}
              {currentStep === 5 && (
                <ProjectsStep
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  newTech={newTech}
                  setNewTech={setNewTech}
                  validationErrors={validationErrors}
                />
              )}
              {currentStep === 6 && (
                <AdditionalStep
                  resumeData={resumeData}
                  setResumeData={setResumeData}
                  validationErrors={validationErrors}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                onClick={() => goToStep(currentStep - 1)}
                disabled={currentStep === 0}
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => goToStep(currentStep + 1)}
                  disabled={!canProceedToNext}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={saving || !canProceedToNext}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Resume
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Glassmorphism Preview Section */}
          <div className="sticky top-4 space-y-6">
            <div className="rounded-2xl p-8 shadow-2xl border border-white/20" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)'}}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/30" style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(20px)'}}>
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  Live Preview
                </h2>
              <Button
                onClick={() => setShowFullPreview(true)}
                variant="outline"
                size="lg"
                  className="border border-white/20 text-white hover:bg-white/20 transition-all duration-300 px-6 py-3 shadow-xl"
                  style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(30px)'}}
              >
                <Eye className="w-5 h-5 mr-2" />
                Full Screen
              </Button>
              </div>
              <p className="text-white/70 text-lg font-medium">
                See how your resume looks in real-time as you make changes
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'}}>
              <div className="p-6 border-b border-white/20" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)'}}>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-4 h-4 bg-red-500/80 rounded-full shadow-sm"></div>
                  <div className="w-4 h-4 bg-yellow-500/80 rounded-full shadow-sm"></div>
                  <div className="w-4 h-4 bg-green-500/80 rounded-full shadow-sm"></div>
                  <span className="ml-6 font-bold text-lg text-white">Resume Preview</span>
                </div>
              </div>
              <div className="p-8" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'}}>
                <div
                  className="relative overflow-hidden mx-auto shadow-inner rounded-xl border border-white/20"
                  style={{
                    width: "100%",
                    height: "0",
                    paddingBottom: "141.4%", // A4 aspect ratio (1:1.414)
                  }}
                >
                  <div
                    className="absolute top-0 left-0"
                    style={{
                      width: "250%",
                      height: "250%",
                      transform: "scale(0.4)",
                      transformOrigin: "top left",
                    }}
                  >
                    {renderResumePreview()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Glassmorphism Full Preview Modal */}
        {showFullPreview && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-white/20" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)'}}>
              <div className="p-8 border-b border-white/20 flex justify-between items-center" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'}}>
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/30" style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(20px)'}}>
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    Resume Preview
                  </h2>
                  <p className="text-lg text-white/70 mt-2">
                    Full-size preview of your professional resume
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowFullPreview(false)}
                  className="h-12 w-12 p-0 border border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-300"
                  style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(30px)'}}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="p-8 overflow-auto max-h-[calc(95vh-140px)]" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'}}>
                <div className="rounded-2xl shadow-2xl p-12 mx-auto max-w-5xl border border-white/20" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)'}}>
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

