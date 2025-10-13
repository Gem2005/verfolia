"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight, Eye, Check, PenSquare, Save, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { resumeService, type Resume } from "@/services/resume-service";
import { analyticsService } from "@/services/analytics-service";
import { storageHelpers } from "@/utils/storage";
import { CleanMonoTemplate, DarkMinimalistTemplate, DarkTechTemplate, ModernAIFocusedTemplate } from "@/components/templates";
import { ResumeData } from "@/types/ResumeData";
import { validateEmail, validatePhone, validateUrl, validateWordCount, validateGPA, validateDateRange, validateSkill, validateProficiency } from "../../utils/validation";
import { steps, templates } from "../../../data/constants";
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
  const [markdown, setMarkdown] = useState("");
  const [resumeTitle, setResumeTitle] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newTech, setNewTech] = useState<{ [key: string]: string }>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showChoice, setShowChoice] = useState(false);
  const prefillLoadedRef = useRef(false); // Track if prefill data has been loaded
  const [uploadedFileData, setUploadedFileData] = useState<{
    id?: string; // ID from uploaded_resume_files table
    filePath: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    originalFilename: string;
  } | null>(null);

  // Analytics tracking state
  const [sessionStartTime] = useState<number>(Date.now());
  const [stepStartTimes, setStepStartTimes] = useState<{ [key: number]: number }>({});
  const [pageViewTracked, setPageViewTracked] = useState(false);

  // Redirect unauthenticated users after auth state resolves
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.replace('/login?returnTo=/create-resume');
  //   }
  // }, [loading, user, router]);

  // Handle prefill or show choice screen logic
  useEffect(() => {
    // Skip if already loaded
    if (prefillLoadedRef.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const key = params.get("prefill");
    if (key) {
      try {
        const raw = sessionStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          
          // Validate parsed data structure
          if (!parsed || typeof parsed !== 'object') {
            throw new Error('Invalid prefill data structure');
          }

          // Mark as loaded before showing toasts to prevent duplicates
          prefillLoadedRef.current = true;

          console.log('[Prefill] Loaded resume data:', {
            title: parsed.title,
            hasPersonalInfo: !!parsed.personalInfo,
            experienceCount: parsed.experience?.length || 0,
            educationCount: parsed.education?.length || 0,
            skillsCount: parsed.skills?.length || 0,
            projectsCount: parsed.projects?.length || 0,
            certificationsCount: parsed.certifications?.length || 0,
            languagesCount: parsed.languages?.length || 0,
            customSectionsCount: parsed.customSections?.length || 0,
            hasUploadedFile: !!parsed.uploadedFile,
          });

          // Store uploaded file metadata if present
          if (parsed.uploadedFile) {
            setUploadedFileData({
              id: parsed.uploadedFileId, // NEW: Store the uploaded_file_id
              filePath: parsed.uploadedFile.filePath,
              fileUrl: parsed.uploadedFile.fileUrl,
              fileSize: parsed.uploadedFile.fileSize,
              mimeType: parsed.mimeType || 'application/pdf',
              originalFilename: parsed.originalFilename || 'resume.pdf',
            });
            console.log('[Prefill] Stored uploaded file metadata:', parsed.uploadedFile);
          }
          
          // Also check for uploadedFileId directly in sessionStorage (set by "Use This File" button)
          const uploadedFileId = sessionStorage.getItem('uploadedFileId');
          if (uploadedFileId) {
            setUploadedFileData((prev) => ({
              ...prev,
              id: uploadedFileId,
            }) as typeof uploadedFileData);
            // Clean up after reading
            sessionStorage.removeItem('uploadedFileId');
            console.log('[Prefill] Found uploadedFileId in sessionStorage:', uploadedFileId);
          }

          // Show success toast
          toast.success('Resume data loaded successfully!', {
            description: 'Your resume has been imported and is ready to edit'
          });

          // Show warnings if any
          if (parsed.warnings && Array.isArray(parsed.warnings) && parsed.warnings.length > 0) {
            toast.warning('Some fields may need review', {
              description: `${parsed.warnings.length} warning(s) during parsing`,
              duration: 5000,
            });
          }

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
          
          // Clean up session storage after a short delay to ensure data is loaded
          setTimeout(() => {
            sessionStorage.removeItem(key);
          }, 1000);
        } else {
          toast.error('Resume data not found', {
            description: 'The uploaded resume data expired. Please try uploading again.'
          });
          router.replace('/choice');
        }
      } catch (e) {
        console.error("Failed to prefill from parsed data", e);
        toast.error('Failed to load resume', {
          description: e instanceof Error ? e.message : 'Please try uploading again'
        });
        router.replace('/choice');
      }
    } else {
      setShowChoice(true); // No prefill data, show choice
    }
  }, [router]);

  // Analytics tracking useEffects
  useEffect(() => {
    if (!pageViewTracked) {
      // Track initial page view with user context
      analyticsService.trackInitialPageView(user?.id);
      setPageViewTracked(true);
      
      // Set initial step start time
      setStepStartTimes(prev => ({ ...prev, [currentStep]: Date.now() }));
    }
  }, [pageViewTracked, currentStep, user?.id]);

  // Track step changes
  useEffect(() => {
    if (pageViewTracked && stepStartTimes[currentStep] === undefined) {
      // Track step change
      analyticsService.trackStepChange(currentStep, steps[currentStep]?.title || `Step ${currentStep}`);
      
      // Set start time for new step
      setStepStartTimes(prev => ({ ...prev, [currentStep]: Date.now() }));
    }
  }, [currentStep, pageViewTracked, stepStartTimes]);

  // Track session end on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Track final step time
      const currentStepStartTime = stepStartTimes[currentStep];
      if (currentStepStartTime) {
        const timeSpent = Date.now() - currentStepStartTime;
        analyticsService.trackStepDuration(currentStep, steps[currentStep]?.title || `Step ${currentStep}`, timeSpent);
      }
      
      // Track session end on page unload
      analyticsService.trackSessionEnd();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionStartTime, stepStartTimes, currentStep, user?.id]);

  // Track when user authentication state changes (login/logout)
  useEffect(() => {
    if (pageViewTracked && user?.id) {
      // If user just logged in and we haven't tracked for this user yet, track as potentially first-time user
      analyticsService.trackInitialPageView(user.id);
    }
  }, [user?.id, pageViewTracked]);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false); // Track if user tried to proceed

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
      
      // Validate items if present
      if (section.items && section.items.length > 0) {
        section.items.forEach((item, index) => {
          const itemPrefix = `${prefix}_item_${index}`;
          // At least one of title or description should be present
          if (!item.title?.trim() && !item.description?.trim()) {
            errors[itemPrefix] = "Item must have a title or description";
          }
        });
      } else {
        errors[`${prefix}_items`] = "Section must have at least one item";
      }
    });
    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.customSections]);


  const currentTemplate =
    templates.find((t) => t.id === selectedTemplate) || templates[0];

  const goToStep = (step: number) => {
    // Track time spent on current step before moving
    const currentStepStartTime = stepStartTimes[currentStep];
    if (currentStepStartTime && pageViewTracked) {
      const timeSpent = Date.now() - currentStepStartTime;
      analyticsService.trackStepDuration(currentStep, steps[currentStep]?.title || `Step ${currentStep}`, timeSpent);
    }

    setIsTransitioning(true);
    // Clear validation errors and reset attempt flag when changing steps
    setValidationErrors({});
    setHasAttemptedNext(false);
    
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
      
      // Set start time for new step
      setStepStartTimes(prev => ({ ...prev, [step]: Date.now() }));
    }, 150);
  };

  // Enhanced template and theme selection handlers with analytics
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    analyticsService.trackTemplateSelection(templateId, currentStep);
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    analyticsService.trackThemeSelection(themeId, currentStep);
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
    () => {
      // Don't show validation errors until user tries to proceed
      if (!hasAttemptedNext) return true;
      return validateCurrentStep();
    },
    [validateCurrentStep, hasAttemptedNext]
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
      analyticsService.trackSaveAttempt(false, 'User not authenticated');
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
        storageHelpers.setResumeData(currentData);
        
        // Redirect to login with return to create-resume with action parameter
        const returnUrl = encodeURIComponent('/create-resume?action=save');
        router.push(`/login?returnTo=${returnUrl}`);
        return;
      } catch {
        toast.error("Please log in to save your resume.");
        router.push('/login?returnTo=/create-resume');
        return;
      }
    }

    if (!validateCurrentStep()) {
      analyticsService.trackSaveAttempt(false, 'Validation failed');
      toast.error("Please fix the errors on this page before saving.");
      return;
    }

    setSaving(true);
    toast.loading("Saving your resume...");

    try {
      const resumePayload = {
        user_id: user.id,
        title: resumeTitle,
        slug: '', // Will be generated by backend
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
        view_count: 0,
        // Add uploaded file ID if available (links to uploaded_resume_files table)
        ...(uploadedFileData?.id && {
          uploaded_file_id: uploadedFileData.id,
        }),
        // Add uploaded file metadata if available (for backward compatibility)
        ...(uploadedFileData && {
          uploaded_file_path: uploadedFileData.filePath,
          uploaded_file_url: uploadedFileData.fileUrl,
          original_filename: uploadedFileData.originalFilename,
          file_size_bytes: uploadedFileData.fileSize,
          mime_type: uploadedFileData.mimeType,
          uploaded_at: new Date().toISOString(),
        }),
      } as unknown as Omit<Resume, 'id' | 'created_at' | 'updated_at'>;

      const savedResume = await resumeService.createResume(resumePayload);

      if (savedResume && savedResume.slug) {
        // Track successful save
        analyticsService.trackSaveAttempt(true);
        
        // Track session completion
        analyticsService.trackSessionEnd();
        
        // Clear creation session
        await analyticsService.clearCreationSession();
        
        // Clear temporary data
        try {
          sessionStorage.removeItem('resumeData');
        } catch {}
        
        toast.dismiss();
        toast.success("Resume saved successfully! Redirecting to your dashboard...");
        router.push(`/dashboard?fromSave=true`);
      } else {
        throw new Error("Failed to save resume or receive a valid response.");
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      
      // Track failed save
      analyticsService.trackSaveAttempt(false, error instanceof Error ? error.message : "Unknown error");
      
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
          const savedData = storageHelpers.getResumeData();
          if (savedData) {
            const parsed = typeof savedData === 'string' ? JSON.parse(savedData) : savedData;
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
                  slug: '',
                  view_count: 0,
                } as unknown as Omit<Resume, 'id' | 'created_at' | 'updated_at'>;

                console.log('Saving resume payload:', resumePayload);
                const savedResume = await resumeService.createResume(resumePayload);

                if (savedResume && savedResume.slug) {
                  // Track successful auto-save
                  analyticsService.trackSaveAttempt(true);
                  
                  // Track session completion
                  analyticsService.trackSessionEnd();
                  
                  // Clear creation session
                  await analyticsService.clearCreationSession();
                  
                  // Clear temporary data
                  try {
                    sessionStorage.removeItem('resumeData');
                  } catch {}
                  
                  toast.dismiss();
                  toast.success("Resume saved successfully! Redirecting to your dashboard...");
                  
                  // Redirect to dashboard where user can see all their resumes
                  setTimeout(() => {
                    router.push(`/dashboard?fromSave=true`);
                  }, 1500);
                } else {
                  throw new Error("Failed to save resume or receive a valid response.");
                }
              } catch (error) {
                console.error("Error saving restored resume:", error);
                
                // Track failed auto-save
                analyticsService.trackSaveAttempt(false, error instanceof Error ? error.message : "Auto-save failed");
                
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // NO AUTH BLOCKING - Allow users to explore without login

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20" 
      data-page="create-resume"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl blur-xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl blur-lg animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-4">
                <div className="card-enhanced w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border border-border/50 bg-gradient-to-br from-primary/10 to-accent/10">
                  <PenSquare className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-foreground">
                    Create Resume
                  </h1>
                  <p className="text-muted-foreground text-xl font-medium">
                    Build your professional resume with real-time preview
                  </p>
                </div>
              </div>
            </div>
          <div className="flex items-center gap-4">
                <Button
                variant="outline"
                onClick={() => router.push('/choice')}
                className="glass-button flex items-center gap-2 px-6 py-3 border-border/50 hover:bg-muted/50"
                >
                <ArrowLeft className="w-4 h-4" />
                Back to Choice
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
                className="glass-button flex items-center gap-2 px-6 py-3 border-border/50 hover:bg-muted/50"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="button-enhanced flex items-center gap-2 px-8 py-3 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
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

          {/* Enhanced Progress Indicator */}
          <div className="card-enhanced rounded-2xl p-8 shadow-lg border border-border/50 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                {(() => { 
                  const Icon = steps[currentStep].icon as React.ComponentType<{ className?: string }>;
                  return Icon ? <Icon className="w-6 h-6 text-primary" /> : null; 
                })()}
                {steps[currentStep].title}
              </h2>
              <span className="text-sm text-muted-foreground px-4 py-2 rounded-full font-semibold border border-border/50 bg-muted/50">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <div className="relative">
              {/* Progress Line Container */}
              <div className="absolute top-7 left-0 right-0 flex items-center px-7">
                <div className="flex-1 h-1 bg-border/50 rounded-full relative">
                  {/* Progress Fill */}
                  <div 
                    className="absolute left-0 top-0 h-1 bg-primary rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: `${(currentStep / (steps.length - 1)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Steps */}
              <div className="flex justify-between relative z-10">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      {/* Step Circle */}
                      <button
                        onClick={() => goToStep(step.id)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 relative ${
                          isActive
                            ? "text-primary-foreground bg-primary border-primary shadow-lg cursor-pointer transform scale-110"
                            : isCompleted
                            ? "text-primary-foreground bg-primary border-primary cursor-pointer hover:scale-105 shadow-md"
                            : "text-muted-foreground bg-background border-border hover:bg-muted/50 cursor-pointer hover:scale-105"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </button>
                      
                      {/* Step Label */}
                      <span className={`mt-3 text-xs font-medium text-center max-w-20 leading-tight transition-colors duration-300 ${
                        isActive 
                          ? "text-primary font-semibold" 
                          : isCompleted 
                          ? "text-foreground" 
                          : "text-muted-foreground"
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
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
                  onTemplateSelect={handleTemplateSelect}
                  onThemeSelect={handleThemeSelect}
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
                className="glass-button border-border/50 hover:bg-muted/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => {
                    setHasAttemptedNext(true);
                    if (validateCurrentStep()) {
                      goToStep(currentStep + 1);
                      setHasAttemptedNext(false); // Reset for next step
                    }
                  }}
                  className="button-enhanced bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={saving || !canProceedToNext}
                  className="button-enhanced bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
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

          {/* Enhanced Preview Section */}
          <div className="sticky top-4 space-y-6">
            <div className="card-enhanced rounded-2xl p-8 shadow-lg border border-border/50 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-border/50 bg-primary/10">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  Live Preview
                </h2>
              <Button
                onClick={() => setShowFullPreview(true)}
                variant="outline"
                size="lg"
                  className="glass-button border-border/50 hover:bg-muted/50 px-6 py-3"
              >
                <Eye className="w-5 h-5 mr-2" />
                Full Screen
              </Button>
              </div>
              <p className="text-muted-foreground text-lg font-medium">
                See how your resume looks in real-time as you make changes
              </p>
            </div>

            <div className="card-enhanced rounded-2xl overflow-hidden shadow-lg border border-border/50 bg-background/50 backdrop-blur-sm">
              <div className="p-6 border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></div>
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="ml-6 font-bold text-lg text-foreground">Resume Preview</span>
                </div>
              </div>
              <div className="p-8 bg-background/30">
                <div
                  className="relative overflow-hidden mx-auto shadow-lg rounded-xl border border-border/50 bg-background"
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

        {/* Enhanced Full Preview Modal */}
        {showFullPreview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="card-enhanced rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-border bg-background">
              <div className="p-8 border-b border-border flex justify-between items-center bg-muted/30">
                <div>
                  <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-border bg-primary/10">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                    Resume Preview
                  </h2>
                  <p className="text-lg text-muted-foreground mt-2">
                    Full-size preview of your professional resume
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowFullPreview(false)}
                  className="h-12 w-12 p-0 border border-border hover:bg-muted/50 rounded-xl transition-all duration-300"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="p-8 overflow-auto max-h-[calc(95vh-140px)] bg-background/50">
                <div className="card-enhanced rounded-2xl shadow-lg p-12 mx-auto max-w-5xl border border-border bg-background">
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

