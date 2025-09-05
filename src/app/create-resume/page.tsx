"use client";

import type React from "react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  Eye,
  Check,
  Calendar as CalendarIcon,
  Upload,
  PenSquare,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Save,
  Download,
  User,
  Briefcase,
  GraduationCap,
  Code,
  FolderOpen,
  Award,
  Globe,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { resumeService } from "@/services/resume-service";
import {
  CleanMonoTemplate,
  DarkMinimalistTemplate,
  DarkTechTemplate,
  ModernAIFocusedTemplate,
} from "@/components/templates";
import type { PortfolioData } from "@/types/PortfolioTypes";
import { SimpleDateInput } from "@/components/ui/simple-date-input";
import { ResumeData } from "@/types/ResumeData";
import {
  validateEmail,
  validatePhone,
  validateUrl,
  validateWordCount,
  validateGPA,
  validateDateRange,
  validateSkill,
  validateProficiency,
} from "./func/validation";

const steps = [
  { id: 0, title: "Template", description: "Choose a template", icon: Sparkles },
  { id: 1, title: "Personal Info", description: "Basic information", icon: User },
  { id: 2, title: "Experience", description: "Work experience (required)", icon: Briefcase },
  {
    id: 3,
    title: "Education",
    description: "Educational background (optional)",
    icon: GraduationCap,
  },
  { id: 4, title: "Skills", description: "Technical skills (optional)", icon: Code },
  { id: 5, title: "Projects", description: "Project details (optional)", icon: FolderOpen },
  { id: 6, title: "Additional", description: "Extra sections (optional)", icon: Award },
];

// Fallback templates used if API returns empty
const templates = [
  {
    id: "clean-mono",
    name: "Clean Mono",
    hasPhoto: true,
    description: "Elegant mono profile with clarity",
    layout: "clean-mono",
  },
  {
    id: "dark-minimalist",
    name: "Dark Minimalist",
    hasPhoto: true,
    description: "Dark, focused, minimal profile",
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

// Fallback themes used if API returns empty
const themes = [
  { id: "black", name: "Black", color: "bg-black" },
  { id: "dark-gray", name: "Dark Gray", color: "bg-gray-800" },
  { id: "navy-blue", name: "Navy Blue", color: "bg-blue-900" },
  { id: "professional", name: "Professional", color: "bg-gray-700" },
  { id: "white", name: "White", color: "bg-white" },
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
  const [newSkill, setNewSkill] = useState("");
  const [newTech, setNewTech] = useState<{ [key: string]: string }>({});
  const [showChoice, setShowChoice] = useState(false); // Default to false

  // Redirect unauthenticated users after auth state resolves
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?returnTo=/create-resume');
    }
  }, [loading, user, router]);

  // Handle prefill or show choice screen logic
  useEffect(() => {
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const key = params.get("prefill");
    if (key) {
      try {
        const raw = sessionStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          setResumeTitle(parsed.title || "Imported Resume");
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
          setShowChoice(false); // Prefill data exists, hide choice
        } else {
          alert("The uploaded resume data couldn't be found. Please try uploading again.");
          router.replace('/create-resume');
        }
      } catch (e) {
        console.error("Failed to prefill from parsed data", e);
      }
    } else {
      setShowChoice(true); // No prefill data, show choice
    }
  }, [user, router]);

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

  // (Keep all other validation functions as they are)
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

  // (Keep all helper functions like getPortfolioData, renderResumePreview, handleSave, etc.)
  // ...
  const getPortfolioData = (): PortfolioData => ({
    personalInfo: {
      firstName: resumeData.personalInfo.firstName || "John",
      lastName: resumeData.personalInfo.lastName || "Doe",
      title: resumeData.personalInfo.title || "Software Developer",
      email: resumeData.personalInfo.email || "john@example.com",
      phone: resumeData.personalInfo.phone || "+1 (555) 123-4567",
      location: resumeData.personalInfo.location || "San Francisco, CA",
      about:
        resumeData.personalInfo.summary ||
        "Experienced professional with a proven track record of delivering high-quality solutions and driving innovation. Passionate about leveraging technology to solve complex problems and create meaningful impact. Strong collaborative skills with expertise in modern development practices and a commitment to continuous learning and growth.",
      photo:
        resumeData.personalInfo.photo ||
        "https://cdn-icons-png.flaticon.com/512/1999/1999625.png",
      social: {
        github: resumeData.personalInfo.githubUrl || "",
        twitter: "",
        linkedin: resumeData.personalInfo.linkedinUrl || "",
        portfolio: "",
      },
    },
    experience:
      resumeData.experience.length > 0
        ? resumeData.experience.map((exp) => ({
            id: exp.id,
            position: exp.position,
            company: exp.company,
            startDate: exp.startDate,
            endDate: exp.endDate,
            isPresent: exp.isPresent,
            description: exp.description,
          }))
        : [
            {
              id: "exp-1",
              position: "Senior Software Engineer",
              company: "Tech Solutions Inc.",
              startDate: "2022-01",
              endDate: "",
              isPresent: true,
              description:
                "Led development of scalable web applications using modern technologies. Collaborated with cross-functional teams to deliver high-quality software solutions. Mentored junior developers and implemented best practices for code quality and performance optimization.",
            },
            {
              id: "exp-2",
              position: "Software Developer",
              company: "Digital Innovations Ltd.",
              startDate: "2020-06",
              endDate: "2021-12",
              isPresent: false,
              description:
                "Developed and maintained full-stack applications using React, Node.js, and PostgreSQL. Participated in agile development processes and contributed to system architecture decisions. Improved application performance by 40% through code optimization.",
            },
          ],
    skills:
      resumeData.skills.length > 0
        ? resumeData.skills
        : [
            "JavaScript",
            "TypeScript",
            "React",
            "Node.js",
            "Python",
            "PostgreSQL",
            "MongoDB",
            "AWS",
            "Docker",
            "Git",
            "REST APIs",
            "GraphQL",
            "Agile/Scrum",
            "Problem Solving",
            "Team Leadership",
          ],
    education:
      resumeData.education.length > 0
        ? resumeData.education.map((edu) => ({
            id: edu.id,
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field,
            startYear: edu.startDate,
            endYear: edu.endDate,
            cgpa: edu.gpa || "3.8",
          }))
        : [
            {
              id: "edu-1",
              institution: "University of Technology",
              degree: "Bachelor of Science",
              field: "Computer Science",
              startYear: "2016",
              endYear: "2020",
              cgpa: "3.8",
            },
          ],
    projects:
      resumeData.projects.length > 0
        ? resumeData.projects.map((proj) => ({
            id: proj.id,
            name: proj.name,
            description: proj.description,
            techStack: proj.techStack,
            sourceUrl: proj.sourceUrl || "",
            demoUrl: proj.demoUrl || "",
          }))
        : [
            {
              id: "proj-1",
              name: "E-Commerce Platform",
              description:
                "Full-stack e-commerce solution with real-time inventory management, payment processing, and admin dashboard. Features include user authentication, product catalog, shopping cart, and order tracking.",
              techStack: [
                "React",
                "Node.js",
                "PostgreSQL",
                "Stripe API",
                "AWS",
              ],
              sourceUrl: "https://github.com/johndoe/ecommerce-platform",
              demoUrl: "https://ecommerce-demo.johndoe.dev",
            },
            {
              id: "proj-2",
              name: "Task Management App",
              description:
                "Collaborative project management tool with real-time updates, team collaboration features, and advanced reporting. Supports multiple project views including Kanban boards and Gantt charts.",
              techStack: [
                "Vue.js",
                "Express.js",
                "MongoDB",
                "Socket.io",
                "Docker",
              ],
              sourceUrl: "https://github.com/johndoe/task-manager",
              demoUrl: "https://tasks.johndoe.dev",
            },
          ],
    blogs: [], // Not used in resume context
    certifications:
      resumeData.certifications.length > 0
        ? resumeData.certifications.map((cert) => ({
            id: cert.id,
            title: cert.name,
            issuer: cert.issuer,
            date: cert.date || "",
            url: cert.url || "",
          }))
        : [
            {
              id: "cert-1",
              title: "AWS Certified Solutions Architect",
              issuer: "Amazon Web Services",
              date: "2023-08",
              url: "https://aws.amazon.com/certification/",
            },
            {
              id: "cert-2",
              title: "Professional Scrum Master I",
              issuer: "Scrum.org",
              date: "2022-11",
              url: "https://scrum.org/professional-scrum-certifications",
            },
          ],
    interests:
      resumeData.customSections.length > 0
        ? resumeData.customSections.map((section) => section.title)
        : [
            "Open Source Contributions",
            "Machine Learning",
            "Cloud Architecture",
            "Mobile Development",
            "DevOps",
            "Tech Blogging",
            "Mentoring",
            "Innovation",
          ],
  });

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
        user_id: user.id,
        title: (() => {
          if (resumeTitle.trim()) {
            return resumeTitle.trim();
          }
          const firstName = resumeData.personalInfo.firstName?.trim() || "";
          const lastName = resumeData.personalInfo.lastName?.trim() || "";
          const fullName = `${firstName} ${lastName}`.trim();
          return fullName ? `${fullName} - Resume` : "My Resume";
        })(),
        is_public: false,
        template_id: selectedTemplate,
        theme_id: selectedTheme,
        slug: "",
        view_count: 0,
        personal_info: resumeData.personalInfo,
        experience: resumeData.experience.map((exp) => ({
          id: exp.id,
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.isPresent || false,
          description: exp.description,
          technologies: [],
        })),
        education: resumeData.education.map((edu) => ({
          id: edu.id,
          school: edu.institution,
          degree: edu.degree,
          field: edu.field || "",
          startDate: edu.startDate,
          endDate: edu.endDate,
          current: false,
          description: "",
        })),
        skills: resumeData.skills,
        projects: resumeData.projects.map((proj) => ({
          id: proj.id,
          name: proj.name,
          description: proj.description,
          technologies: proj.techStack,
          liveUrl: proj.demoUrl,
          repoUrl: proj.sourceUrl,
        })),
        certifications: resumeData.certifications.map((cert) => ({
          id: cert.id,
          name: cert.name,
          issuer: cert.issuer,
          issueDate: cert.date || new Date().toISOString().split("T")[0],
          credentialUrl: cert.url,
        })),
        languages: resumeData.languages.map((lang) => ({
          name: lang.name,
          proficiency: lang.proficiency || "Beginner",
        })),
        custom_sections: resumeData.customSections.map((section) => ({
          id: section.id,
          title: section.title,
          items: [
            {
              id: section.id,
              title: section.title,
              description: section.description,
            },
          ],
        })),
      });

      if (resume?.slug) {
        router.push(`/resume/${resume.slug}`);
      } else {
        console.error("Failed to create resume or get slug");
      }
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

  const updateExperienceField = (
    experienceId: string,
    field:
      | "position"
      | "company"
      | "startDate"
      | "endDate"
      | "isPresent"
      | "description",
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

  const renderTemplateStep = () => {
    const TemplatePreview = ({
      template,
    }: {
      template: (typeof templates)[0];
    }) => {
      const getPreviewImage = () => {
        const baseUrl = "/preview-images";
        const templateImageMap: { [key: string]: string } = {
          "clean-mono": "Clean Mono.png",
          "dark-minimalist": "Dark Minimalist.png",
          "dark-tech": "Dark Tech.png",
          "modern-ai-focused": "Modern AI Focused.png",
        };
        const imageName = templateImageMap[template.id];
        return imageName
          ? `${baseUrl}/${imageName}`
          : `${baseUrl}/Clean Mono.png`;
      };

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
          <div className="aspect-[4/5] bg-muted/20 flex items-center justify-center p-2">
            <div className="w-full h-full overflow-hidden rounded-lg bg-background shadow-sm relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <img
                  src={getPreviewImage()}
                  alt={`${template.name} preview`}
                  className="w-full h-full object-cover object-top transition-opacity duration-200"
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    const loadingDiv = target.parentElement?.querySelector(
                      ".loading-placeholder"
                    ) as HTMLElement;
                    if (loadingDiv) {
                      loadingDiv.style.display = "none";
                    }
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallbackDiv =
                      target.nextElementSibling as HTMLElement;
                    if (fallbackDiv) {
                      fallbackDiv.style.display = "block";
                    }
                  }}
                />
                <div className="loading-placeholder absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-gray-400 text-sm">
                    Loading preview...
                  </div>
                </div>
                <div className="w-full h-full" style={{ display: "none" }}>
                  {getTemplateComponent()}
                </div>
              </div>
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded-md backdrop-blur-sm">
                {themes.find((t) => t.id === selectedTheme)?.name ||
                  selectedTheme}
              </div>
              <div className="absolute bottom-2 left-2 flex gap-1">
                <div className="px-2 py-1 bg-white/90 text-gray-700 text-xs rounded-md backdrop-blur-sm">
                  {template.layout}
                </div>
              </div>
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

  // (Keep renderPersonalInfoStep and other render steps)
  // ...
  const renderPersonalInfoStep = () => {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Personal Information
          </CardTitle>
          <p className="text-slate-600 leading-relaxed">
            Tell us about yourself
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resume Title - First Field */}
          <div className="space-y-2">
            <Label htmlFor="resumeTitle" className="text-sm font-medium">
              Resume Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="resumeTitle"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              className={`h-11 ${
                validationErrors.resumeTitle ? "border-red-500" : ""
              }`}
              placeholder="e.g., John Doe - Senior Software Engineer"
            />
            {validationErrors.resumeTitle && (
              <p className="text-xs text-red-500">
                {validationErrors.resumeTitle}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              This will be the title of your resume
            </p>
          </div>

          {/* Profile Photo Upload */}
          <ImageUpload
            value={resumeData.personalInfo.photo}
            onChange={(value) =>
              setResumeData((prev) => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  photo: value,
                },
              }))
            }
            label="Profile Photo"
            description="Upload a professional headshot for your resume"
            maxSizeInMB={5}
            uploadToSupabase={true}
          />

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
                className={`h-11 ${
                  validationErrors.firstName ? "border-red-500" : ""
                }`}
                placeholder="Enter your first name"
              />
              {validationErrors.firstName && (
                <p className="text-xs text-red-500">
                  {validationErrors.firstName}
                </p>
              )}
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
                className={`h-11 ${
                  validationErrors.lastName ? "border-red-500" : ""
                }`}
                placeholder="Enter your last name"
              />
              {validationErrors.lastName && (
                <p className="text-xs text-red-500">
                  {validationErrors.lastName}
                </p>
              )}
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
                className={`h-11 ${
                  validationErrors.email ? "border-red-500" : ""
                }`}
                placeholder="your.email@example.com"
              />
              {validationErrors.email && (
                <p className="text-xs text-red-500">{validationErrors.email}</p>
              )}
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
                className={`h-11 ${
                  validationErrors.phone ? "border-red-500" : ""
                }`}
                placeholder="Enter your phone number"
              />
              {validationErrors.phone && (
                <p className="text-xs text-red-500">{validationErrors.phone}</p>
              )}
            </div>
          </div>

          {/* Current Designation */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Current Designation <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={resumeData.personalInfo.title}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    title: e.target.value,
                  },
                }))
              }
              className={`h-11 ${
                validationErrors.title ? "border-red-500" : ""
              }`}
              placeholder="e.g., Senior Software Engineer, Marketing Manager"
            />
            {validationErrors.title && (
              <p className="text-xs text-red-500">{validationErrors.title}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Your current job title or professional designation
            </p>
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
              className={`h-11 ${
                validationErrors.location ? "border-red-500" : ""
              }`}
              placeholder="Enter your location"
            />
            {validationErrors.location && (
              <p className="text-xs text-red-500">
                {validationErrors.location}
              </p>
            )}
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
              className={`resize-none ${
                validationErrors.summary ? "border-red-500" : ""
              }`}
              placeholder="Write a brief summary of your professional experience and goals (20-100 words)"
            />
            {validationErrors.summary && (
              <p className="text-xs text-red-500">{validationErrors.summary}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {resumeData.personalInfo.summary.trim()
                ? `${
                    resumeData.personalInfo.summary
                      .trim()
                      .split(/\s+/)
                      .filter((word) => word.length > 0).length
                  } words`
                : "0 words"}{" "}
              (20-100 words recommended)
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
                className={`h-11 ${
                  validationErrors.linkedinUrl ? "border-red-500" : ""
                }`}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              {validationErrors.linkedinUrl && (
                <p className="text-xs text-red-500">
                  {validationErrors.linkedinUrl}
                </p>
              )}
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
                className={`h-11 ${
                  validationErrors.githubUrl ? "border-red-500" : ""
                }`}
                placeholder="https://github.com/yourusername"
              />
              {validationErrors.githubUrl && (
                <p className="text-xs text-red-500">
                  {validationErrors.githubUrl}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderExperienceStep = () => {
    return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Experience
          </CardTitle>
          <CardDescription className="text-slate-600">Work experience (required)</CardDescription>
      </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resumeData.experience.length === 0 && (
              <p className="text-sm text-muted-foreground">Add your first experience.</p>
            )}
            {resumeData.experience.map((exp) => (
              <div key={exp.id} className="p-4 border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      value={exp.position}
                      onChange={(e) => updateExperienceField(exp.id, "position", e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperienceField(exp.id, "company", e.target.value)}
                      placeholder="e.g., Tech Solutions Inc."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <SimpleDateInput
                      value={exp.startDate}
                      onChange={(val) => updateExperienceField(exp.id, "startDate", val)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                        <SimpleDateInput
                      value={exp.endDate}
                      onChange={(val) => updateExperienceField(exp.id, "endDate", val)}
                      disabled={!!exp.isPresent}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                        <input
                          id={`present-${exp.id}`}
                      type="checkbox"
                      className="h-4 w-4"
                      checked={!!exp.isPresent}
                      onChange={(e) => updateExperienceField(exp.id, "isPresent", e.target.checked)}
                    />
                    <Label htmlFor={`present-${exp.id}`}>I currently work here</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={4}
                    value={exp.description}
                    onChange={(e) => updateExperienceField(exp.id, "description", e.target.value)}
                    placeholder="Describe your responsibilities, achievements, and technologies used (20-100 words)"
                  />
                </div>
                <div className="flex justify-end">
                  <Button variant="destructive" onClick={() => removeExperience(exp.id)}>
                    <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addExperience} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Experience
            </Button>
          </div>
      </CardContent>
    </Card>
  );
  }
  const renderEducationStep = () => {
    return (
    <Card>
      <CardHeader>
          <CardTitle>Education</CardTitle>
          <CardDescription>Educational background</CardDescription>
      </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resumeData.education.length === 0 && (
              <p className="text-sm text-muted-foreground">Add your first education entry.</p>
            )}
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="p-4 border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEducationField(edu.id, "institution", e.target.value)}
                      placeholder="e.g., University of Technology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducationField(edu.id, "degree", e.target.value)}
                      placeholder="e.g., B.Sc. Computer Science"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input
                      value={edu.field}
                      onChange={(e) => updateEducationField(edu.id, "field", e.target.value)}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Year/Date</Label>
                    <SimpleDateInput
                      value={edu.startDate}
                      onChange={(val) => updateEducationField(edu.id, "startDate", val)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Year/Date</Label>
                    <SimpleDateInput
                      value={edu.endDate}
                      onChange={(val) => updateEducationField(edu.id, "endDate", val)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>GPA / Percentage (optional)</Label>
                    <Input
                      value={edu.gpa}
                      onChange={(e) => updateEducationField(edu.id, "gpa", e.target.value)}
                      placeholder="e.g., 8.7/10 or 85%"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="destructive" onClick={() => removeEducation(edu.id)}>
                    <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addEducation} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Education
            </Button>
          </div>
      </CardContent>
    </Card>
  );
  }
  const renderSkillsStep = () => {
    const onAdd = () => {
      if (newSkill.trim()) {
        addSkill(newSkill.trim());
        setNewSkill("");
      }
    };
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Code className="w-6 h-6 text-blue-600" />
            Skills
          </CardTitle>
          <CardDescription className="text-slate-600">Technical and soft skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g., React, Node.js, SQL"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAdd();
                  }
                }}
              />
              <Button variant="outline" onClick={onAdd}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.length === 0 && (
                <p className="text-sm text-muted-foreground">Add skills to showcase your strengths.</p>
              )}
              {resumeData.skills.map((skill, index) => (
                <div key={`${skill}-${index}`} className="inline-flex items-center gap-1">
                  <Badge variant="secondary" className="pr-1">
                    <span className="inline-flex items-center gap-2">
                      <span>{skill}</span>
                    </span>
                  </Badge>
                  <button
                    type="button"
                    className="h-5 px-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeSkillAtIndex(index);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeSkillAtIndex(index);
                    }}
                    aria-label={`Remove ${skill}`}
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {resumeData.skills.length > 0 && (
              <div className="mt-4">
                    <Button
                  type="button"
                  variant="outline"
                      size="sm"
                  onClick={() => setResumeData((prev) => ({ ...prev, skills: [] }))}
                >
                  Clear all skills
                    </Button>
                  </div>
                      )}
                    </div>
        </CardContent>
      </Card>
    );
  }
  const renderProjectsStep = () => {
    const addTech = (projectId: string) => {
      const value = (newTech[projectId] || "").trim();
      if (!value) return;
      const project = resumeData.projects.find((p) => p.id === projectId);
      const next = Array.from(new Set([...(project?.techStack || []), value]));
      updateProjectField(projectId, "techStack", next);
      setNewTech((prev) => ({ ...prev, [projectId]: "" }));
    };
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-blue-600" />
            Projects
          </CardTitle>
          <CardDescription className="text-slate-600">Highlight your notable work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resumeData.projects.length === 0 && (
              <p className="text-sm text-muted-foreground">Add your first project.</p>
            )}
            {resumeData.projects.map((proj) => (
              <div key={proj.id} className="p-4 border rounded-lg space-y-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                      <Input
                        value={proj.name}
                    onChange={(e) => updateProjectField(proj.id, "name", e.target.value)}
                    placeholder="e.g., E-Commerce Platform"
                  />
                    </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                      <Textarea
                    rows={4}
                        value={proj.description}
                    onChange={(e) => updateProjectField(proj.id, "description", e.target.value)}
                    placeholder="Describe what you built, your role, and impact (20-100 words)"
                  />
                    </div>
                <div className="space-y-2">
                  <Label>Tech Stack</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newTech[proj.id] || ""}
                      onChange={(e) => setNewTech((prev) => ({ ...prev, [proj.id]: e.target.value }))}
                      placeholder="e.g., React"
                          onKeyDown={(e) => {
                        if (e.key === "Enter") {
                              e.preventDefault();
                          addTech(proj.id);
                            }
                          }}
                        />
                    <Button variant="outline" onClick={() => addTech(proj.id)}>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                    </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(proj.techStack || []).map((tech) => (
                      <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                        {tech}
                        <button
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            updateProjectField(
                              proj.id,
                              "techStack",
                              (proj.techStack || []).filter((t) => t !== tech)
                            )
                          }
                          aria-label={`Remove ${tech}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source URL</Label>
                        <Input
                      value={proj.sourceUrl}
                      onChange={(e) => updateProjectField(proj.id, "sourceUrl", e.target.value)}
                      placeholder="https://github.com/username/repo"
                    />
                      </div>
                  <div className="space-y-2">
                    <Label>Demo URL</Label>
                    <Input
                      value={proj.demoUrl}
                      onChange={(e) => updateProjectField(proj.id, "demoUrl", e.target.value)}
                      placeholder="https://demo.example.com"
                    />
                    </div>
                  </div>
                <div className="flex justify-end">
                  <Button variant="destructive" onClick={() => removeProject(proj.id)}>
                    <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
                  </div>
                </div>
              ))}
            <Button variant="outline" onClick={addProject} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Project
              </Button>
            </div>
        </CardContent>
      </Card>
    );
  }  
  const renderProgressSummary = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Summary</CardTitle>
          <CardDescription>Summary of your progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            Coming Soon
          </div>
        </CardContent>
      </Card>
    );
  } 
  const renderCertificationsSection = () => {
  const addCertification = () => {
    const newCert = {
      id: Math.random().toString(36).substring(2, 11),
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
    const updateCertificationField = (
      certId: string,
      field: "name" | "issuer" | "date" | "url",
      value: string
    ) => {
      setResumeData((prev) => ({
        ...prev,
        certifications: prev.certifications.map((c) =>
          c.id === certId
            ? {
                ...c,
                [field]: value,
              }
            : c
        ),
      }));
    };
    const removeCertification = (certId: string) => {
      setResumeData((prev) => ({
        ...prev,
        certifications: prev.certifications.filter((c) => c.id !== certId),
      }));
    };
    return (
    <Card>
      <CardHeader>
        <CardTitle>Certifications</CardTitle>
          <CardDescription>Professional certifications</CardDescription>
      </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resumeData.certifications.length === 0 && (
              <p className="text-sm text-muted-foreground">Add a certification if applicable.</p>
            )}
            {resumeData.certifications.map((cert) => (
              <div key={cert.id} className="p-4 border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={cert.name}
                      onChange={(e) => updateCertificationField(cert.id, "name", e.target.value)}
                      placeholder="e.g., AWS Solutions Architect"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issuer</Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) => updateCertificationField(cert.id, "issuer", e.target.value)}
                      placeholder="e.g., Amazon Web Services"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <SimpleDateInput
                      value={cert.date || ""}
                      onChange={(val) => updateCertificationField(cert.id, "date", val)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Credential URL (optional)</Label>
                    <Input
                      value={cert.url || ""}
                      onChange={(e) => updateCertificationField(cert.id, "url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="destructive" onClick={() => removeCertification(cert.id)}>
                    <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addCertification} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Certification
            </Button>
          </div>
      </CardContent>
    </Card>
  );
  } 

  const renderLanguagesSection = () => {
  const addLanguage = () => {
    const newLang = {
      id: Math.random().toString(36).substring(2, 11),
      name: "",
      proficiency: "",
    };
    setResumeData((prev) => ({
      ...prev,
      languages: [...prev.languages, newLang],
    }));
  };
    const updateLanguageField = (
      langId: string,
      field: "name" | "proficiency",
      value: string
    ) => {
      setResumeData((prev) => ({
        ...prev,
        languages: prev.languages.map((l) =>
          l.id === langId
            ? {
                ...l,
                [field]: value,
              }
            : l
        ),
      }));
    };
    const removeLanguage = (langId: string) => {
      setResumeData((prev) => ({
        ...prev,
        languages: prev.languages.filter((l) => l.id !== langId),
      }));
    };
    return (
    <Card>
      <CardHeader>
        <CardTitle>Languages</CardTitle>
          <CardDescription>Spoken languages and proficiency</CardDescription>
      </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resumeData.languages.length === 0 && (
              <p className="text-sm text-muted-foreground">Add languages you are proficient in.</p>
            )}
            {resumeData.languages.map((lang) => (
              <div key={lang.id} className="p-4 border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Input
                      value={lang.name}
                      onChange={(e) => updateLanguageField(lang.id, "name", e.target.value)}
                      placeholder="e.g., English"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Proficiency</Label>
                    <select
                      className="h-11 px-3 py-2 text-sm border border-border rounded-md bg-background"
                      value={lang.proficiency || ""}
                      onChange={(e) => updateLanguageField(lang.id, "proficiency", e.target.value)}
                    >
                      <option value="">Select level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Native">Native</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="destructive" onClick={() => removeLanguage(lang.id)}>
                    <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addLanguage} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Language
            </Button>
          </div>
      </CardContent>
    </Card>
  );
  } 
  const renderCustomSections = () => {
  const addCustomSection = () => {
    const newSection = {
      id: Math.random().toString(36).substring(2, 11),
      title: "",
      description: "",
    };
    setResumeData((prev) => ({
      ...prev,
      customSections: [...prev.customSections, newSection],
    }));
  };
    const updateCustomSectionField = (
      sectionId: string,
      field: "title" | "description",
      value: string
    ) => {
                      setResumeData((prev) => ({
                        ...prev,
        customSections: prev.customSections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                [field]: value,
              }
            : s
        ),
      }));
    };
    const removeCustomSection = (sectionId: string) => {
      setResumeData((prev) => ({
        ...prev,
        customSections: prev.customSections.filter((s) => s.id !== sectionId),
      }));
    };
    return (
      <Card>
        <CardHeader>
          <CardTitle>Additional Sections</CardTitle>
          <CardDescription>Any extra sections you want to include</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {resumeData.customSections.length === 0 && (
              <p className="text-sm text-muted-foreground">Add any additional sections such as interests or awards.</p>
            )}
            {resumeData.customSections.map((section) => (
              <div key={section.id} className="p-4 border rounded-lg space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                    <Input
                      value={section.title}
                    onChange={(e) => updateCustomSectionField(section.id, "title", e.target.value)}
                    placeholder="e.g., Awards, Interests"
                  />
                  </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                    <Textarea
                    rows={3}
                      value={section.description}
                    onChange={(e) => updateCustomSectionField(section.id, "description", e.target.value)}
                    placeholder="Details for this section"
                  />
                  </div>
                <div className="flex justify-end">
                  <Button variant="destructive" onClick={() => removeCustomSection(section.id)}>
                    <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addCustomSection} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Section
            </Button>
          </div>
      </CardContent>
    </Card>
  );
  } 

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
            </div>
              </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // ** THIS IS THE STRUCTURAL FIX **
  if (showChoice) {
    return (
      <div className="container mx-auto max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6">How would you like to start?</h1>
        <p className="text-muted-foreground mb-8">
          Upload your existing PDF resume for instant parsing, or build a new profile from scratch.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" /> Upload PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Drag and drop your resume PDF. We&apos;ll parse your info and prefill the editor.
              </p>
              <Button onClick={() => router.push("/upload-resume")}>Upload PDF</Button>
            </CardContent>
          </Card>
          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenSquare className="w-5 h-5" /> Build from Scratch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Start with a clean canvas using our guided editor.
              </p>
              <Button onClick={() => setShowChoice(false)} variant="outline">Start Building</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Enhanced Header with Animations */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-4 animate-slide-in-left">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-blue-100 animate-pulse hover:animate-spin transition-all duration-500 hover:scale-110">
                  <PenSquare className="w-8 h-8 text-white" />
                </div>
                <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent animate-gradient-x">
                    Create Resume
                  </h1>
                  <p className="text-slate-600 text-xl font-medium animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    Build your professional resume with real-time preview
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 animate-slide-in-right">
              <Button
                variant="outline"
                onClick={() => setShowChoice(true)}
                className="flex items-center gap-2 hover:bg-slate-50 transition-all duration-300 border-2 hover:border-blue-300 hover:shadow-lg px-6 py-3 hover:scale-105 animate-fade-in-up"
                style={{animationDelay: '0.6s'}}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Choice
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-3 text-lg font-semibold hover:scale-105 animate-fade-in-up group"
                style={{animationDelay: '0.8s'}}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span className="animate-pulse">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:animate-bounce" />
                    Save Resume
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Enhanced Progress Indicator with Advanced Animations */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 animate-fade-in-up" style={{animationDelay: '1s'}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 animate-slide-in-left">
                {(() => { const Icon = steps[currentStep].icon as any; return Icon ? <Icon className="w-6 h-6 text-blue-600 animate-pulse" /> : null; })()}
                <span className="animate-gradient-x">{steps[currentStep].title}</span>
              </h2>
              <span className="text-sm text-slate-600 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full font-semibold border border-blue-200 animate-bounce">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                return (
                  <div key={step.id} className="flex items-center animate-fade-in-up" style={{animationDelay: `${1.2 + index * 0.1}s`}}>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-700 transform hover:scale-125 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl scale-110 ring-4 ring-blue-200 animate-pulse"
                          : isCompleted
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:scale-110"
                          : "bg-slate-200 text-slate-500 hover:bg-slate-300 hover:scale-110"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 animate-bounce" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isActive ? 'animate-spin' : ''}`} />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 h-1 mx-3 rounded-full transition-all duration-700 ${
                          isCompleted ? "bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Step Navigation with Advanced Animations */}
        <div className="mb-10 animate-fade-in-up" style={{animationDelay: '1.5s'}}>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
              <div
                key={step.id}
                className={`flex items-center animate-slide-in-up ${
                  index < steps.length - 1 ? "flex-1" : ""
                }`}
                style={{animationDelay: `${1.7 + index * 0.1}s`}}
              >
                <button
                  onClick={() => goToStep(step.id)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-500 transform hover:scale-110 hover:rotate-1 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl ring-4 ring-blue-200 scale-105 animate-pulse"
                        : isCompleted
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:bg-green-200 border-2 border-green-200 shadow-lg hover:scale-105"
                        : "bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white border-2 border-slate-200 hover:border-blue-300 shadow-lg hover:scale-105"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                      isActive ? "bg-white/20 animate-spin" : isCompleted ? "bg-green-200" : "bg-slate-200"
                    }`}>
                      {isCompleted ? (
                        <Check className="w-4 h-4 animate-bounce" />
                      ) : (
                        <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                      )}
                    </div>
                  <span className="hidden sm:inline animate-fade-in">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                    <div className={`hidden sm:block flex-1 h-1 mx-3 rounded-full transition-all duration-500 ${
                      isCompleted ? "bg-gradient-to-r from-green-300 to-emerald-300 animate-pulse" : "bg-slate-200"
                    }`} />
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* Main Content with Advanced Animations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in-up" style={{animationDelay: '2s'}}>
          {/* Form Section */}
          <div className="space-y-8">
            <div
              className={`transition-all duration-500 transform ${
                isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              {currentStep === 0 && renderTemplateStep()}
              {currentStep === 1 && renderPersonalInfoStep()}
              {currentStep === 2 && renderExperienceStep()}
              {currentStep === 3 && renderEducationStep()}
              {currentStep === 4 && renderSkillsStep()}
              {currentStep === 5 && renderProjectsStep()}
              {currentStep === 6 && (
                <div className="space-y-6">
                  {renderProgressSummary()}
                  {renderCertificationsSection()}
                  {renderLanguagesSection()}
                  {renderCustomSections()}
                </div>
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

          {/* Enhanced Preview Section with Advanced Animations */}
          <div className="sticky top-4 space-y-6 animate-slide-in-right" style={{animationDelay: '2.2s'}}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 animate-fade-in-left">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center animate-pulse hover:animate-spin transition-all duration-500">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <span className="animate-gradient-x">Live Preview</span>
                </h2>
              <Button
                onClick={() => setShowFullPreview(true)}
                variant="outline"
                size="lg"
                  className="hover:bg-slate-50 transition-all duration-300 border-2 hover:border-blue-300 hover:shadow-lg px-6 py-3 hover:scale-110 animate-fade-in-right group"
              >
                <Eye className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Full Screen
              </Button>
              </div>
              <p className="text-slate-600 text-lg font-medium animate-fade-in-up">
                See how your resume looks in real-time as you make changes
              </p>
            </div>

            <div className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 animate-fade-in-up" style={{animationDelay: '2.4s'}}>
              <div className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 p-6 border-b border-slate-200">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm animate-pulse"></div>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm animate-pulse" style={{animationDelay: '1s'}}></div>
                  <span className="ml-6 font-bold text-lg animate-fade-in">Resume Preview</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-white p-8">
                <div
                  className="relative overflow-hidden mx-auto shadow-inner rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-500"
                  style={{
                    width: "100%",
                    height: "0",
                    paddingBottom: "141.4%", // A4 aspect ratio (1:1.414)
                  }}
                >
                  <div
                    className="absolute top-0 left-0 transition-all duration-500 hover:scale-105"
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

        {/* Enhanced Full Preview Modal with Advanced Animations */}
        {showFullPreview && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-white/20 animate-scale-in">
              <div className="p-8 border-b flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="animate-slide-in-left">
                  <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center animate-pulse">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <span className="animate-gradient-x">Resume Preview</span>
                  </h2>
                  <p className="text-lg text-slate-600 mt-2 animate-fade-in-up">
                    Full-size preview of your professional resume
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowFullPreview(false)}
                  className="h-12 w-12 p-0 hover:bg-slate-200 rounded-xl transition-all duration-300 hover:scale-110 animate-fade-in-right group"
                >
                  <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                </Button>
              </div>
              <div className="p-8 overflow-auto max-h-[calc(95vh-140px)] bg-gradient-to-br from-slate-50 to-white">
                <div className="bg-white rounded-2xl shadow-2xl p-12 mx-auto max-w-5xl border border-slate-200 animate-fade-in-up hover:shadow-3xl transition-all duration-500">
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
