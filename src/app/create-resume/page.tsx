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
import "./glassmorphism.css";

export const dynamic = "force-dynamic";

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
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
  const [markdown, setMarkdown] = useState("");
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
      <div className="glass-bg flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-glass-blue mx-auto mb-4"></div>
          <p className="text-glass-white">Loading...</p>
            </div>
              </div>
    );
  }

  if (!user) {
    return (
      <div className="glass-bg flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-glass-blue mx-auto mb-4"></div>
          <p className="text-glass-white">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // ** THIS IS THE STRUCTURAL FIX **
  if (showChoice) {
    return (
      <div className="glass-bg min-h-screen">
        <div className="container mx-auto max-w-4xl py-10">
          <h1 className="text-3xl font-bold mb-6 text-glass-white">How would you like to start?</h1>
          <p className="text-glass-gray mb-8">
            Upload your existing PDF resume for instant parsing, or build a new profile from scratch.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card hover:border-glass-blue transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-glass-white">
                  <Upload className="w-5 h-5 text-glass-blue" /> Upload PDF
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-glass-gray">
                  Drag and drop your resume PDF. We&apos;ll parse your info and prefill the editor.
                </p>
                <Button onClick={() => router.push("/upload-resume")} className="glass-button">Upload PDF</Button>
              </CardContent>
            </Card>
            <Card className="glass-card hover:border-glass-blue transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-glass-white">
                  <PenSquare className="w-5 h-5 text-glass-blue" /> Build from Scratch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-glass-gray">Start with a clean canvas using our guided editor.</p>
                <Button onClick={() => setShowChoice(false)} variant="outline" className="glass-button">Start Building</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
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
                onClick={() => setShowChoice(true)}
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
        {/* Markdown Editor Modal */}
        {showMarkdownEditor && (() => {
          // Local editor state/utilities
          const textareaRef = { current: null as HTMLTextAreaElement | null };
          const [editorWidth, setEditorWidth] = useState(50);
          const [dragging, setDragging] = useState(false);
          const [activeTab, setActiveTab] = useState<'edit'|'preview'>('edit');
          const [lastSaved, setLastSaved] = useState<Date | null>(null);

          const applyWrap = (before: string, after: string = before) => {
            const ta = textareaRef.current;
            if (!ta) return;
            const start = ta.selectionStart ?? 0;
            const end = ta.selectionEnd ?? 0;
            const value = markdown || '';
            const selected = value.slice(start, end);
            const next = value.slice(0, start) + before + selected + after + value.slice(end);
            setMarkdown(next);
            requestAnimationFrame(() => {
              ta.focus();
              ta.selectionStart = start + before.length;
              ta.selectionEnd = end + before.length;
            });
          };

          const applyPrefixLines = (prefix: string) => {
            const ta = textareaRef.current; if (!ta) return;
            const start = ta.selectionStart ?? 0; const end = ta.selectionEnd ?? 0;
            const value = markdown || '';
            const before = value.slice(0, start);
            const selected = value.slice(start, end) || '';
            const after = value.slice(end);
            const block = selected || '';
            const transformed = block.split('\n').map(line => `${prefix}${line}`.trimEnd()).join('\n');
            const next = before + transformed + after;
            setMarkdown(next);
          };

          const insertLink = () => {
            const ta = textareaRef.current; if (!ta) return;
            const start = ta.selectionStart ?? 0; const end = ta.selectionEnd ?? 0;
            const value = markdown || '';
            const selected = value.slice(start, end) || 'text';
            const url = 'https://';
            const next = value.slice(0, start) + `[${selected}](${url})` + value.slice(end);
            setMarkdown(next);
          };

          const toHtml = (md: string) => {
            const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            let h = md || '';
            // Code blocks
            h = h.replace(/```([\s\S]*?)```/g, (_m, p1) => `<pre class="rounded-xl p-4 bg-black/50 border border-white/10 overflow-auto"><code>${esc(p1)}</code></pre>`);
            // Blockquotes
            h = h.replace(/^>\s?(.*)$/gm, (_m, p1) => `<blockquote class="border-l-4 pl-3 ml-1 border-[#E6E6FA] text-white/80 italic">${p1}</blockquote>`);
            // Headings
            h = h.replace(/^######\s?(.*)$/gm, '<h6>$1</h6>')
                 .replace(/^#####\s?(.*)$/gm, '<h5>$1</h5>')
                 .replace(/^####\s?(.*)$/gm, '<h4>$1</h4>')
                 .replace(/^###\s?(.*)$/gm, '<h3>$1</h3>')
                 .replace(/^##\s?(.*)$/gm, '<h2>$1</h2>')
                 .replace(/^#\s?(.*)$/gm, '<h1>$1</h1>');
            // Lists
            h = h.replace(/^(\s*)-\s+(.*)$/gm, '$1<li>$2</li>');
            h = h.replace(/^(\s*)\d+\.\s+(.*)$/gm, '$1<li>$2</li>');
            h = h.replace(/(<li>[^<]*<\/li>\n?)+/g, (m) => m.includes('.</li>') ? `<ol class="ml-5 list-decimal">${m}</ol>` : `<ul class="ml-5 list-disc">${m}</ul>`);
            // Inline code
            h = h.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 border border-white/10">$1</code>');
            // Bold/Italic
            h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            h = h.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            // Links
            h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="text-[#E6E6FA] underline-offset-2 hover:underline" href="$2" target="_blank" rel="noreferrer">$1</a>');
            // Paragraphs
            h = h.replace(/^(?!<h\d|<ul|<ol|<li|<pre|<blockquote)(.+)$/gm, '<p>$1</p>');
            return h;
          };

          const words = (markdown || '').trim().split(/\s+/).filter(Boolean).length;
          const chars = (markdown || '').length;

          const onMouseDownDivider = () => setDragging(true);
          const onMouseMove = (e: any) => {
            if (!dragging) return;
            const container = document.getElementById('md-editor-container');
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const pct = Math.min(80, Math.max(20, ((e.clientX - rect.left) / rect.width) * 100));
            setEditorWidth(pct);
          };
          const onMouseUp = () => setDragging(false);

          useEffect(() => {
            if (!dragging) return;
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
          }, [dragging]);

          return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="rounded-3xl w-full max-w-[1200px] max-h-[95vh] overflow-hidden shadow-2xl border border-white/20" style={{background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(30px)'}}>
                {/* Header / Toolbar */}
                <div className="px-4 py-3 border-b border-white/15 flex items-center justify-between" style={{background: 'rgba(255,255,255,0.06)'}}>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-9 px-3 glass-button" onClick={() => setShowMarkdownEditor(false)}>
                      <X className="w-4 h-4 mr-1"/> Close
                    </Button>
                    <div className="hidden md:flex items-center gap-1">
                      <Button variant="outline" className="icon-btn h-9 px-3" onClick={() => applyWrap('**','**')}><strong>B</strong></Button>
                      <Button variant="outline" className="icon-btn h-9 px-3" onClick={() => applyWrap('*','*')}><em>I</em></Button>
                      <Button variant="outline" className="icon-btn h-9 px-3" onClick={() => applyPrefixLines('# ')}>H1</Button>
                      <Button variant="outline" className="icon-btn h-9 px-3" onClick={() => applyPrefixLines('## ')}>H2</Button>
                      <Button variant="outline" className="icon-btn h-9 px-3" onClick={insertLink}>Link</Button>
                      <Button variant="outline" className="icon-btn h-9 px-3" onClick={() => applyWrap('````\n','\n````')}>Code</Button>
                      <Button variant="outline" className="icon-btn h-9 px-3" onClick={() => applyPrefixLines('- ')}>UL</Button>
                      <Button variant="outline" className="icon-btn h-9 px-3" onClick={() => applyPrefixLines('1. ')}>OL</Button>
                      <Button variant="outline" className="icon-btn h-9 px-3" onClick={() => applyPrefixLines('> ')}>Quote</Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-9 px-3 glass-button"
                      onClick={() => {
                        const blob = new Blob([markdown], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = `resume-${Date.now()}.md`; a.click(); URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="w-4 h-4 mr-1"/> Download .md
                    </Button>
                    <Button
                      className="h-9 px-4"
                      onClick={() => { setLastSaved(new Date()); }}
                    >
                      Save
                    </Button>
                  </div>
                </div>

                {/* Mobile tabs */}
                <div className="md:hidden px-4 pt-3 flex gap-2">
                  <button className={`px-4 py-2 rounded-xl border ${activeTab==='edit'?'border-[#E6E6FA] text-white':'border-white/20 text-white/70'}`} onClick={()=>setActiveTab('edit')}>Edit</button>
                  <button className={`px-4 py-2 rounded-xl border ${activeTab==='preview'?'border-[#E6E6FA] text-white':'border-white/20 text-white/70'}`} onClick={()=>setActiveTab('preview')}>Preview</button>
                </div>

                {/* Body */}
                <div id="md-editor-container" className="p-4 grid md:grid-cols-12 gap-3" style={{maxHeight: 'calc(95vh - 140px)'}}>
                  {/* Editor */}
                  <div className={`${activeTab==='edit' ? '' : 'hidden'} md:block md:col-span-6`} style={{width: '100%'}}>
                    <div className="glass-card h-[60vh] md:h-[calc(70vh)] overflow-hidden">
                      <div className="h-full w-full flex">
                        <div className="w-12 text-right pr-2 py-3 text-white/40 select-none bg-white/5 border-r border-white/10">
                          {Array.from({length: Math.max(1, (markdown.match(/\n/g)||[]).length + 1)}).map((_,i)=> (
                            <div key={i} className="leading-6 text-xs">{i+1}</div>
                          ))}
                        </div>
                        <textarea
                          ref={(el) => { textareaRef.current = el; }}
                          value={markdown}
                          onChange={(e) => setMarkdown(e.target.value)}
                          className="flex-1 h-full p-3 text-sm text-white bg-transparent outline-none"
                          placeholder="# Edit your resume in Markdown here\n\n## Education\n- Degree — School (Dates)\n\n## Experience\n- Title — Company (Dates)\n  - Achievement..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Divider (desktop) */}
                  <div className="hidden md:flex md:col-span-0 items-stretch">
                    <div
                      onMouseDown={onMouseDownDivider}
                      className="w-1 mx-1 rounded-full bg-white/10 hover:bg-[#E6E6FA]/40 cursor-col-resize"
                      title="Drag to resize"
                    />
                  </div>

                  {/* Preview */}
                  <div className={`${activeTab==='preview' ? '' : 'hidden'} md:block md:col-span-6`}>
                    <div className="glass-card h-[60vh] md:h-[calc(70vh)] overflow-auto p-5 prose prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: toHtml(markdown) }} />
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className="px-4 py-2 border-t border-white/15 text-sm flex items-center justify-between text-white/70" style={{background: 'rgba(255,255,255,0.06)'}}>
                  <div className="flex gap-4">
                    <span>Words: {words}</span>
                    <span>Chars: {chars}</span>
                  </div>
                  <div>
                    {lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Unsaved changes'}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
