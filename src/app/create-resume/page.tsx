"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ArrowLeft, ArrowRight, Eye, Check, Save, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { resumeService, type Resume } from "@/services/resume-service";
import { analyticsService } from "@/services/analytics-service";
import { storageHelpers } from "@/utils/storage";
import { ResumeData } from "@/types/ResumeData";
import { validateEmail, validatePhone, validateUrl, validateGPA, validateDateRange, validateSkill, validateProficiency } from "../../utils/validation";
import { steps, templates } from "../../../data/constants";
import { getPortfolioData } from "../../components/PortfolioDataProvider";
import { TemplateStep } from "../../components/steps/TemplateStep";
import { PersonalInfoStep } from "../../components/steps/PersonalInfoStep";
import { ExperienceStep } from "../../components/steps/ExperienceStep";
import { EducationStep } from "../../components/steps/EducationStep";
import { SkillsStep } from "../../components/steps/SkillsStep";
import { ProjectsStep } from "../../components/steps/ProjectsStep";
import { AdditionalStep } from "../../components/steps/AdditionalStep";

// Import templates directly instead of lazy loading
import { CleanMonoTemplate } from "@/components/templates/CleanMonoTemplate";
import { DarkMinimalistTemplate } from "@/components/templates/DarkMinimalistTemplate";
import { DarkTechTemplate } from "@/components/templates/DarkTechTemplate";
import { ModernAIFocusedTemplate } from "@/components/templates/ModernAIFocusedTemplate";
import { AnimatedBackground } from "@/components/layout/animated-background";

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
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newTech, setNewTech] = useState<{ [key: string]: string }>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showChoice, setShowChoice] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const prefillLoadedRef = useRef(false); // Track if prefill data has been loaded
  const draftRestoredRef = useRef(false); // Track if draft has been restored

  // Helper function to check if resumeData is completely empty (user hasn't filled anything)
  const isResumeDataEmpty = (data: ResumeData): boolean => {
    const { personalInfo, experience, education, skills, projects, certifications, languages } = data;
    
    // Check if personal info is empty
    const isPersonalInfoEmpty = 
      !personalInfo.firstName &&
      !personalInfo.lastName &&
      !personalInfo.email &&
      !personalInfo.phone &&
      !personalInfo.location &&
      !personalInfo.summary &&
      !personalInfo.title &&
      !personalInfo.photo &&
      !personalInfo.linkedinUrl &&
      !personalInfo.githubUrl;
    
    // Check if all arrays are empty
    const areArraysEmpty = 
      experience.length === 0 &&
      education.length === 0 &&
      skills.length === 0 &&
      projects.length === 0 &&
      certifications.length === 0 &&
      languages.length === 0;
    
    return isPersonalInfoEmpty && areArraysEmpty;
  };

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

  // Handle prefill or edit mode or show choice screen logic
  useEffect(() => {
    // Skip if already loaded
    if (prefillLoadedRef.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    
    // Check for edit mode first
    const editId = params.get("edit");
    if (editId && user) {
      // Mark as loaded to prevent duplicate loads
      prefillLoadedRef.current = true;
      setIsEditMode(true);
      
      // Load existing resume for editing
      const loadResumeForEdit = async () => {
        try {
          toast.loading("Loading resume for editing...");
          const resume = await resumeService.getResumeById(editId);
          
          if (!resume) {
            toast.error("Resume not found");
            router.replace("/dashboard");
            return;
          }
          
          // Check if user owns this resume
          if (resume.user_id !== user.id) {
            toast.error("You don't have permission to edit this resume");
            router.replace("/dashboard");
            return;
          }
          
          toast.dismiss();
          toast.success("Resume loaded successfully!", {
            description: "You can now edit your resume"
          });
          
          // Populate form with existing resume data
          setResumeTitle(resume.title);
          setSelectedTemplate(resume.template_id);
          setSelectedTheme(resume.theme_id);
          
          setResumeData((prev) => ({
            ...prev,
            user_id: resume.user_id,
            title: resume.title,
            template_id: Number(templates.findIndex(t => t.id === resume.template_id)) || 0,
            theme_id: Number(resume.theme_id) || 0,
            is_public: resume.is_public,
            slug: resume.slug,
            personalInfo: {
              firstName: resume.personal_info.firstName || "",
              lastName: resume.personal_info.lastName || "",
              email: resume.personal_info.email || "",
              phone: resume.personal_info.phone || "",
              location: resume.personal_info.location || "",
              summary: resume.personal_info.summary || "",
              title: resume.personal_info.title || "",
              photo: resume.personal_info.photo || "",
              linkedinUrl: resume.personal_info.linkedinUrl || "",
              githubUrl: resume.personal_info.githubUrl || "",
            },
            experience: resume.experience.map(exp => ({
              id: exp.id,
              position: exp.position,
              company: exp.company,
              startDate: exp.startDate,
              endDate: exp.endDate || "",
              isPresent: exp.current,
              description: exp.description,
              location: exp.location || "",
            })),
            education: resume.education.map(edu => ({
              id: edu.id,
              institution: edu.institution,
              degree: edu.degree,
              field: edu.field || "",
              startDate: edu.startDate,
              endDate: edu.endDate || "",
              gpa: edu.gpa || "",
              location: edu.location || "",
            })),
            skills: resume.skills || [],
            projects: resume.projects.map(proj => ({
              id: proj.id,
              name: proj.name,
              description: proj.description,
              techStack: proj.techStack || [],
              sourceUrl: proj.repoUrl || "",
              demoUrl: proj.liveUrl || "",
            })),
            certifications: resume.certifications.map(cert => ({
              id: cert.id,
              name: cert.name,
              issuer: cert.issuer,
              date: cert.date || "",
              url: cert.url || "",
            })),
            languages: resume.languages.map(lang => ({
              id: lang.id,
              name: lang.name,
              proficiency: lang.proficiency || "",
            })),
            customSections: resume.custom_sections || [],
          }));
          
          // Store the resume ID for updating instead of creating
          sessionStorage.setItem("editingResumeId", editId);
          
          setShowChoice(false);
        } catch (error) {
          console.error("Error loading resume for editing:", error);
          toast.error("Failed to load resume", {
            description: error instanceof Error ? error.message : "Please try again"
          });
          router.replace("/dashboard");
        }
      };
      
      loadResumeForEdit();
      return; // Exit early to prevent prefill logic
    } else {
      // Not in edit mode - clear any existing edit session
      sessionStorage.removeItem("editingResumeId");
      setIsEditMode(false);
    }
    
    // Check for prefill mode
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
            experience: (parsed.experience || []).map((exp: { startDate?: string; endDate?: string; current?: boolean; [key: string]: unknown }) => ({
              ...exp,
              startDate: exp.startDate || "",
              endDate: exp.endDate || "",
              isPresent: exp.current,
            })),
            education: (parsed.education || []).map((edu: { startDate?: string; endDate?: string; [key: string]: unknown }) => ({
              ...edu,
              startDate: edu.startDate || "",
              endDate: edu.endDate || "",
            })),
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
          // Check if there's a draft before redirecting
          const savedDraft = sessionStorage.getItem('create-resume-draft');
          if (!savedDraft) {
            toast.error('Resume data not found', {
              description: 'The uploaded resume data expired. Please try uploading again.'
            });
            router.replace('/choice');
          }
        }
      } catch (e) {
        console.error("Failed to prefill from parsed data", e);
        // Check if there's a draft before redirecting
        const savedDraft = sessionStorage.getItem('create-resume-draft');
        if (!savedDraft) {
          toast.error('Failed to load resume', {
            description: e instanceof Error ? e.message : 'Please try uploading again'
          });
          router.replace('/choice');
        }
      }
    } else {
      // Check if there's a draft in sessionStorage before redirecting
      const savedDraft = sessionStorage.getItem('create-resume-draft');
      if (!savedDraft) {
        // No prefill data and no draft, show choice or redirect
        setShowChoice(true);
      } else {
        console.log('Draft found in sessionStorage, staying on page');
      }
    }
  }, [router, user]);

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

  // Handle ESC key to close full screen preview
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showFullPreview) {
          setShowFullPreview(false);
        } else if (previewTemplate) {
          setPreviewTemplate(null);
        }
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [showFullPreview, previewTemplate]);

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

  // Auto-restore resume data from sessionStorage FIRST (before auto-save runs)
  useEffect(() => {
    if (prefillLoadedRef.current || draftRestoredRef.current) return; // Skip if already loaded
    
    // Check if we're in edit mode via URL params
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    const prefillKey = params.get("prefill");
    
    // Check sessionStorage for edit mode
    const editingResumeId = sessionStorage.getItem('editingResumeId');
    
    // Only set edit mode if we have an edit param OR editingResumeId matches
    if (editId || editingResumeId) {
      setIsEditMode(true);
    } else {
      // Clear edit mode and draft if no edit param and no prefill
      setIsEditMode(false);
      if (editingResumeId) {
        sessionStorage.removeItem('editingResumeId');
      }
      // Clear draft when creating new resume (unless coming from prefill/upload)
      if (!prefillKey) {
        sessionStorage.removeItem('create-resume-draft');
        draftRestoredRef.current = true; // Mark as restored to prevent auto-save from running
        return; // Exit early, don't restore any data
      }
    }
    
    try {
      const savedDraft = sessionStorage.getItem('create-resume-draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        
        console.log('Restoring resume draft from session...', parsed);
        
        // Restore all state
        if (parsed.resumeData) setResumeData(parsed.resumeData);
        if (parsed.resumeTitle) setResumeTitle(parsed.resumeTitle);
        if (parsed.selectedTemplate) setSelectedTemplate(parsed.selectedTemplate);
        if (parsed.selectedTheme) setSelectedTheme(parsed.selectedTheme);
        if (typeof parsed.currentStep === 'number') setCurrentStep(parsed.currentStep);
        if (parsed.uploadedFileData) setUploadedFileData(parsed.uploadedFileData);
        
        draftRestoredRef.current = true;
        console.log('✅ Resume draft restored from session');
      }
    } catch (error) {
      console.error('Failed to restore draft:', error);
    }
  }, []); // Only run once on mount

  // Auto-save resume data to sessionStorage on every change (but skip initial empty save)
  useEffect(() => {
    // Skip the very first save to prevent overwriting restored data
    if (!draftRestoredRef.current && !prefillLoadedRef.current) {
      // Mark as restored so future changes will save
      draftRestoredRef.current = true;
      return;
    }

    const dataToSave = {
      resumeData,
      resumeTitle,
      selectedTemplate,
      selectedTheme,
      currentStep,
      uploadedFileData,
    };
    
    try {
      sessionStorage.setItem('create-resume-draft', JSON.stringify(dataToSave));
      console.log('💾 Draft auto-saved');
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [resumeData, resumeTitle, selectedTemplate, selectedTheme, currentStep, uploadedFileData]);

  // Track when user starts interacting with the form
  useEffect(() => {
    // Skip if already marked as interacted
    if (hasUserInteracted) return;
    
    // Skip if we're in edit mode or prefill mode (user already has data)
    if (isEditMode || prefillLoadedRef.current) {
      setHasUserInteracted(true);
      return;
    }
    
    // Check if user has filled any data
    const hasFilledData = !isResumeDataEmpty(resumeData);
    
    if (hasFilledData) {
      setHasUserInteracted(true);
    }
  }, [resumeData, hasUserInteracted, isEditMode]);

  const validatePersonalInfo = useCallback(() => {
    const errors: { [key: string]: string } = {};
    if (!resumeTitle.trim()) errors.resumeTitle = "Resume title is required";
    if (!resumeData.personalInfo.firstName.trim()) errors.firstName = "First name is required";
    if (!resumeData.personalInfo.lastName.trim()) errors.lastName = "Last name is required";
    if (!resumeData.personalInfo.email.trim()) errors.email = "Email is required";
    if (!validateEmail(resumeData.personalInfo.email)) errors.email = "Please enter a valid email address";
    if (resumeData.personalInfo.phone.trim() && !validatePhone(resumeData.personalInfo.phone)) errors.phone = "Please enter a valid phone number";
    if (!resumeData.personalInfo.title.trim()) errors.title = "Current designation is required";
    // Word count suggestion removed - no restriction
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
      // Word count suggestion removed - no restriction
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
      // Word count suggestion removed - no restriction
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
    setIsTemplateLoading(true);
    // Small delay to ensure loading state is visible before state change
    setTimeout(() => {
      setSelectedTemplate(templateId);
      analyticsService.trackTemplateSelection(templateId, currentStep);
      // Keep loading state for smooth transition
      setTimeout(() => setIsTemplateLoading(false), 600);
    }, 100);
  };

  const handleThemeSelect = (themeId: string) => {
    setIsTemplateLoading(true);
    // Small delay to ensure loading state is visible before state change
    setTimeout(() => {
      setSelectedTheme(themeId);
      analyticsService.trackThemeSelection(themeId, currentStep);
      // Keep loading state for smooth transition
      setTimeout(() => setIsTemplateLoading(false), 600);
    }, 100);
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
    // Show loading state prominently
    if (isTemplateLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-base font-medium text-foreground">Loading template...</p>
          </div>
        </div>
      );
    }

    const templateProps = {
      preview: true,
      data: getPortfolioData(resumeData, !hasUserInteracted),
      theme: selectedTheme,
    };

    const themeClass = `theme-${selectedTheme}`;
    
    // Use key to force complete remount when template/theme changes
    const templateKey = `${currentTemplate.layout}-${selectedTheme}`;
    
    const templateComponent = (() => {
      switch (currentTemplate.layout) {
        case "clean-mono":
          return <CleanMonoTemplate key={templateKey} {...templateProps} />;
        case "dark-minimalist":
          return <DarkMinimalistTemplate key={templateKey} {...templateProps} />;
        case "dark-tech":
          return <DarkTechTemplate key={templateKey} {...templateProps} />;
        case "modern-ai-focused":
          return <ModernAIFocusedTemplate key={templateKey} {...templateProps} />;
        default:
          return <CleanMonoTemplate key={templateKey} {...templateProps} />;
      }
    })();

    return (
      <div key={templateKey} className={`preview-sandbox ${themeClass} template-wrapper w-full bg-background`}>
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
    
    // Check if we're in edit mode
    const editingResumeId = sessionStorage.getItem("editingResumeId");
    const isEditMode = !!editingResumeId;
    
    toast.loading(isEditMode ? "Updating your resume..." : "Saving your resume...");

    try {
      const resumePayload = {
        user_id: user.id,
        title: resumeTitle,
        template_id: selectedTemplate,
        theme_id: selectedTheme,
        is_public: resumeData.is_public,
        personal_info: resumeData.personalInfo,
        experience: resumeData.experience.map(exp => ({
          id: exp.id,
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.isPresent || false,
          description: exp.description,
          technologies: [],
          location: exp.location || "",
        })),
        education: resumeData.education.map(edu => ({
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field || "",
          startDate: edu.startDate,
          endDate: edu.endDate,
          current: false,
          description: "",
          gpa: edu.gpa,
          location: edu.location || "",
        })),
        skills: resumeData.skills,
        projects: resumeData.projects.map(proj => ({
          id: proj.id,
          name: proj.name,
          description: proj.description,
          techStack: proj.techStack || [],
          liveUrl: proj.demoUrl,
          repoUrl: proj.sourceUrl,
        })),
        certifications: resumeData.certifications.map(cert => ({
          id: cert.id,
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date,
          url: cert.url,
        })),
        languages: resumeData.languages.map(lang => ({
          id: lang.id,
          name: lang.name,
          proficiency: lang.proficiency,
        })),
        custom_sections: resumeData.customSections,
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

      let savedResume;
      
      if (isEditMode) {
        // Update existing resume
        savedResume = await resumeService.updateResume(editingResumeId, resumePayload);
      } else {
        // Create new resume
        savedResume = await resumeService.createResume(resumePayload);
      }

      if (savedResume && savedResume.slug) {
        // Track successful save
        analyticsService.trackSaveAttempt(true);
        
        // Track session completion
        analyticsService.trackSessionEnd();
        
        // Clear creation session
        await analyticsService.clearCreationSession();
        
        // Clear edit mode session storage
        if (isEditMode) {
          sessionStorage.removeItem("editingResumeId");
        }
        
        // Clear temporary data including draft
        try {
          sessionStorage.removeItem('resumeData');
          sessionStorage.removeItem('create-resume-draft');
        } catch {}
        
        toast.dismiss();
        toast.success(
          isEditMode ? "Resume updated successfully! Redirecting to your dashboard..." : "Resume saved successfully! Redirecting to your dashboard..."
        );
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
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="text-center relative z-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // NO AUTH BLOCKING - Allow users to explore without login

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-background" 
      data-page="create-resume"
    >
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] relative z-10 h-screen flex flex-col">
        {/* Compact Header - Desktop */}
        <div className="hidden lg:flex items-center justify-between mb-6 flex-shrink-0 gap-2">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div className="h-8 w-px bg-border shrink-0"></div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">
                {isEditMode ? 'Edit Resume' : 'Create Resume'}
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
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
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-primary hover:bg-primary/90 border border-primary"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  {isEditMode ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Update Resume' : 'Save Resume'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Header with Progress */}
        <div className="lg:hidden flex-shrink-0 mb-4">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="h-6 sm:h-8 w-px bg-border shrink-0"></div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
                  {isEditMode ? 'Edit Resume' : 'Create Resume'}
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  Step {currentStep + 1}: {steps[currentStep].title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullPreview(true)}
                className="gap-1"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className="bg-primary hover:bg-primary/90 gap-1 border border-primary"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-current" />
                    <span className="hidden sm:inline">{isEditMode ? 'Updating...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{isEditMode ? 'Update' : 'Save'}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Overall Progress Bar - Mobile Only */}
          <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">
                Overall Progress
              </span>
              <span className="text-xs font-semibold text-primary">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <Progress 
              value={((currentStep + 1) / steps.length) * 100}
              variant="default"
              className="h-2 bg-white/20 border-white/30"
              indicatorClassName="bg-white"
            />
          </div>
        </div>

        {/* Full-Width Progress Steps Bar - Desktop Only */}
        <div className="hidden lg:block flex-shrink-0 mb-6 bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-6">
          <div className="flex items-center justify-between gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              // Progress bar shows the connection between THIS step and the NEXT step
              // If we've completed this step (moved past it), the bar is 100%
              // If we're currently on this step, the bar is 50%
              // If we haven't reached this step yet, the bar is 0%
              const getProgressBarValue = () => {
                if (index < currentStep) return 100; // Completed steps show full progress
                if (index === currentStep) return 50; // Current step shows half progress
                return 0; // Future steps show no progress
              };
              
              const progressValue = getProgressBarValue();
              
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => goToStep(step.id)}
                    className={`flex flex-col items-center gap-2 transition-all group ${
                      isActive ? "" : isCompleted ? "" : "opacity-50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium text-center whitespace-nowrap ${
                        isActive
                          ? "text-foreground"
                          : isCompleted
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className="flex-1 flex items-center px-3 -mt-6">
                      <Progress 
                        key={`progress-${index}-${currentStep}`}
                        value={progressValue}
                        variant="default"
                        className="h-2 bg-white/20 border-white/30"
                        indicatorClassName="bg-white"
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[480px_1fr] gap-4 sm:gap-6 overflow-hidden">
          {/* Left Panel - Form/Steps */}
          <div className="flex flex-col h-full overflow-hidden order-2 lg:order-1">
            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-6">
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
                    getPortfolioData={() => getPortfolioData(resumeData, !hasUserInteracted)}
                    previewTemplate={previewTemplate}
                    setPreviewTemplate={setPreviewTemplate}
                    isLoading={isTemplateLoading}
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
            </div>

            {/* Navigation Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 mt-3 sm:mt-4 flex justify-between gap-2 sm:gap-4">
              <Button
                onClick={() => goToStep(currentStep - 1)}
                disabled={currentStep === 0}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => {
                    setHasAttemptedNext(true);
                    if (validateCurrentStep()) {
                      goToStep(currentStep + 1);
                      setHasAttemptedNext(false);
                    }
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 border border-primary"
                  size="sm"
                >
                  Next
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={saving || !canProceedToNext}
                  className="flex-1 bg-primary hover:bg-primary/90 border border-primary"
                  size="sm"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-current mr-1 sm:mr-2" />
                      {isEditMode ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      {isEditMode ? 'Update Resume' : 'Save Resume'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Right Panel - Preview (Desktop only) */}
          <div className="hidden lg:flex flex-col h-full overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50 rounded-xl p-4 xl:p-6 order-1 lg:order-2">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 xl:w-3 xl:h-3 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 xl:w-3 xl:h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 xl:w-3 xl:h-3 rounded-full bg-green-500"></div>
                </div>
                <h3 className="font-semibold text-sm xl:text-base text-foreground ml-2 xl:ml-4 truncate">{resumeTitle || "Resume Preview"}</h3>
              </div>
              <Button
                onClick={() => setShowFullPreview(true)}
                variant="outline"
                size="sm"
                className="gap-1 xl:gap-2 shrink-0"
              >
                <Eye className="w-4 h-4" />
                Full Screen
              </Button>
            </div>

            {/* Preview Container */}
            <div className="flex-1 overflow-auto bg-muted/30">
              <div className="w-full h-full flex items-start justify-center p-4">
                <div
                  className="relative bg-background shadow-2xl w-full"
                  style={
                    isTemplateLoading
                      ? {
                          minHeight: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }
                      : {
                          minHeight: "fit-content",
                        }
                  }
                >
                  {renderResumePreview()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Screen Preview Modal */}
        {showFullPreview && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Navigation Bar - Fixed on top with high z-index */}
            <div className="flex-shrink-0 h-12 sm:h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 relative z-50 shadow-sm">
              <h2 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                {resumeTitle || "Resume Preview"}
              </h2>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">Press ESC to close</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullPreview(false)}
                  className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Full Screen Preview Content - No constraints, just overflow scroll */}
            <div className="flex-1 overflow-auto">
              <div className="min-h-full p-2 sm:p-4">
                {isTemplateLoading ? (
                  <div className="w-full h-screen flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-xs sm:text-sm text-gray-400">Loading template...</p>
                    </div>
                  </div>
                ) : (
                  renderResumePreview()
                )}
              </div>
            </div>
          </div>
        )}

        {/* Template Preview Modal - Rendered at page level */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col">
            {/* Navigation Bar */}
            <div className="flex-shrink-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 relative z-50 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {templates.find((t) => t.id === previewTemplate)?.name} Preview
              </h3>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Press ESC to close</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewTemplate(null)}
                  className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Template Preview Content */}
            <div className="flex-1 overflow-auto">
              <div className="min-h-full">
                {(() => {
                  const templateProps = {
                    preview: true as const,
                    data: getPortfolioData(resumeData, !hasUserInteracted),
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
                      return <CleanMonoTemplate {...templateProps} />;
                  }
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

