"use client";

import type React from "react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  { id: 0, title: "Template", description: "Choose a template" },
  { id: 1, title: "Personal Info", description: "Basic information" },
  { id: 2, title: "Experience", description: "Work experience (required)" },
  {
    id: 3,
    title: "Education",
    description: "Educational background (optional)",
  },
  { id: 4, title: "Skills", description: "Technical skills (optional)" },
  { id: 5, title: "Projects", description: "Project details (optional)" },
  { id: 6, title: "Additional", description: "Extra sections (optional)" },
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
  const [newSkill, setNewSkill] = useState(""); // Moved useState to top level
  const [newTech, setNewTech] = useState<{ [key: string]: string }>({});
  const [showChoice, setShowChoice] = useState(true); // Show choice first

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

  // Prefill from parsed data if available
  useEffect(() => {
    // Only run prefill logic when user is authenticated
    if (!user) return;
    
    const params = new URLSearchParams(window.location.search);
    const key = params.get("prefill");
    console.log("Prefill key:", key);
    if (key) {
      try {
        const raw = sessionStorage.getItem(key);
        console.log("Raw sessionStorage data:", raw);
        if (raw) {
          const parsed = JSON.parse(raw);
          console.log("Parsed data:", parsed);
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
          // Hide choice screen when prefill data is loaded
          setShowChoice(false);
          console.log("Resume data loaded successfully!");
        } else {
          console.log("No data found in sessionStorage for key:", key);
          // Show a message to the user that the data wasn't found
          alert("The uploaded resume data couldn't be found. Please try uploading again.");
          // Clear the prefill parameter from URL
          router.replace('/create-resume');
        }
      } catch (e) {
        console.error("Failed to prefill from parsed data", e);
      }
    }
  }, [user, router]);

  const validatePersonalInfo = useCallback(() => {
    const errors: { [key: string]: string } = {};

    // Resume Title validation
    if (!resumeTitle.trim()) {
      errors.resumeTitle = "Resume title is required";
    }

    // First Name validation
    if (!resumeData.personalInfo.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(resumeData.personalInfo.firstName)) {
      errors.firstName = "First name should only contain letters";
    }

    // Last Name validation
    if (!resumeData.personalInfo.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(resumeData.personalInfo.lastName)) {
      errors.lastName = "Last name should only contain letters";
    }

    // Email validation
    if (!resumeData.personalInfo.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(resumeData.personalInfo.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation (optional but must be valid if provided)
    if (
      resumeData.personalInfo.phone.trim() &&
      !validatePhone(resumeData.personalInfo.phone)
    ) {
      errors.phone = "Please enter a valid phone number";
    }

    // Location validation (optional but must be string if provided)
    if (
      resumeData.personalInfo.location.trim() &&
      !/^[a-zA-Z\s,.-]+$/.test(resumeData.personalInfo.location)
    ) {
      errors.location =
        "Location should only contain letters, spaces, commas, periods, and hyphens";
    }

    // Current designation validation
    if (!resumeData.personalInfo.title.trim()) {
      errors.title = "Current designation is required";
    }

    // Summary validation
    if (resumeData.personalInfo.summary.trim()) {
      if (!validateWordCount(resumeData.personalInfo.summary, 20, 100)) {
        errors.summary = "Summary should be between 20 and 100 words";
      }
    }

    // LinkedIn URL validation (optional but must be valid if provided)
    if (
      resumeData.personalInfo.linkedinUrl &&
      resumeData.personalInfo.linkedinUrl.trim()
    ) {
      if (!validateUrl(resumeData.personalInfo.linkedinUrl)) {
        errors.linkedinUrl = "LinkedIn URL must start with https://";
      }
    }

    // GitHub URL validation (optional but must be valid if provided)
    if (
      resumeData.personalInfo.githubUrl &&
      resumeData.personalInfo.githubUrl.trim()
    ) {
      if (!validateUrl(resumeData.personalInfo.githubUrl)) {
        errors.githubUrl = "GitHub URL must start with https://";
      }
    }

    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeTitle, resumeData.personalInfo]);

  const validateExperience = useCallback(() => {
    const errors: { [key: string]: string } = {};

    // Experience is now optional - only validate if entries exist
    resumeData.experience.forEach((exp) => {
      const prefix = `experience_${exp.id}`;

      // Position validation
      if (!exp.position.trim()) {
        errors[`${prefix}_position`] = "Job title is required";
      }

      // Company validation
      if (!exp.company.trim()) {
        errors[`${prefix}_company`] = "Company name is required";
      }

      // Start date validation
      if (!exp.startDate.trim()) {
        errors[`${prefix}_startDate`] = "Start date is required";
      }

      // End date validation (only if not present)
      if (!exp.isPresent && !exp.endDate?.trim()) {
        errors[`${prefix}_endDate`] = "End date is required";
      }

      // Date logic validation
      if (exp.startDate && exp.endDate && !exp.isPresent) {
        const startDate = new Date(exp.startDate);
        const endDate = new Date(exp.endDate);
        if (startDate >= endDate) {
          errors[`${prefix}_endDate`] = "End date must be after start date";
        }
      }

      // Description validation (20-100 words)
      if (!exp.description.trim()) {
        errors[`${prefix}_description`] = "Job description is required";
      } else if (!validateWordCount(exp.description, 20, 100)) {
        errors[`${prefix}_description`] =
          "Description should be between 20 and 100 words";
      }
    });

    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.experience]);

  const validateEducation = useCallback(() => {
    const errors: { [key: string]: string } = {};

    resumeData.education.forEach((edu) => {
      const prefix = `education_${edu.id}`;

      // Institution validation
      if (!edu.institution.trim()) {
        errors[`${prefix}_institution`] = "Institution name is required";
      }

      // Degree validation
      if (!edu.degree.trim()) {
        errors[`${prefix}_degree`] = "Degree is required";
      }

      // Field validation (optional)
      if (edu.field && edu.field.trim() && edu.field.trim().length < 2) {
        errors[`${prefix}_field`] =
          "Field of study must be at least 2 characters";
      }

      // Start date validation
      if (!edu.startDate.trim()) {
        errors[`${prefix}_startDate`] = "Start date is required";
      }

      // End date validation
      if (!edu.endDate.trim()) {
        errors[`${prefix}_endDate`] = "End date is required";
      }

      // Date range validation
      if (edu.startDate && edu.endDate) {
        if (!validateDateRange(edu.startDate, edu.endDate)) {
          errors[`${prefix}_endDate`] = "End date must be after start date";
        }
      }

      // GPA validation (optional)
      if (edu.gpa && !validateGPA(edu.gpa)) {
        errors[`${prefix}_gpa`] =
          "GPA must be a valid format (e.g., 3.8, 8.7/10, 85%)";
      }
    });

    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.education]);

  const validateProjects = useCallback(() => {
    const errors: { [key: string]: string } = {};

    resumeData.projects.forEach((proj) => {
      const prefix = `project_${proj.id}`;

      // Project name validation
      if (!proj.name.trim()) {
        errors[`${prefix}_name`] = "Project name is required";
      }

      // Description validation (20-100 words)
      if (!proj.description.trim()) {
        errors[`${prefix}_description`] = "Project description is required";
      } else if (!validateWordCount(proj.description, 20, 100)) {
        errors[`${prefix}_description`] =
          "Description should be between 20 and 100 words";
      }

      // Tech stack validation (at least one technology)
      if (!proj.techStack || proj.techStack.length === 0) {
        errors[`${prefix}_techStack`] = "At least one technology is required";
      }

      // Source URL validation (optional but must be valid if provided)
      if (proj.sourceUrl && proj.sourceUrl.trim()) {
        if (!validateUrl(proj.sourceUrl)) {
          errors[`${prefix}_sourceUrl`] = "Source URL must start with https://";
        }
      }

      // Demo URL validation (optional but must be valid if provided)
      if (proj.demoUrl && proj.demoUrl.trim()) {
        if (!validateUrl(proj.demoUrl)) {
          errors[`${prefix}_demoUrl`] = "Demo URL must start with https://";
        }
      }
    });

    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.projects]);

  const validateSkills = useCallback(() => {
    const errors: { [key: string]: string } = {};

    // Skills validation - each skill should be meaningful
    resumeData.skills.forEach((skill, index) => {
      if (!validateSkill(skill)) {
        errors[`skill_${index}`] = "Skill must be between 2 and 50 characters";
      }
    });

    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.skills]);

  const validateCertifications = useCallback(() => {
    const errors: { [key: string]: string } = {};

    resumeData.certifications.forEach((cert) => {
      const prefix = `certification_${cert.id}`;

      // Certification name validation
      if (!cert.name.trim()) {
        errors[`${prefix}_name`] = "Certification name is required";
      }

      // Issuer validation
      if (!cert.issuer.trim()) {
        errors[`${prefix}_issuer`] = "Issuer is required";
      }

      // Date validation
      if (!cert.date || !cert.date.trim()) {
        errors[`${prefix}_date`] = "Date is required";
      }
    });

    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.certifications]);

  const validateLanguages = useCallback(() => {
    const errors: { [key: string]: string } = {};

    resumeData.languages.forEach((lang) => {
      const prefix = `language_${lang.id}`;

      // Language name validation
      if (!lang.name.trim()) {
        errors[`${prefix}_name`] = "Language name is required";
      }

      // Proficiency validation
      if (!lang.proficiency || !lang.proficiency.trim()) {
        errors[`${prefix}_proficiency`] = "Proficiency level is required";
      } else if (!validateProficiency(lang.proficiency)) {
        errors[`${prefix}_proficiency`] =
          "Please select a valid proficiency level";
      }
    });

    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.languages]);

  const validateCustomSections = useCallback(() => {
    const errors: { [key: string]: string } = {};

    resumeData.customSections.forEach((section) => {
      const prefix = `customSection_${section.id}`;

      // Title validation
      if (!section.title.trim()) {
        errors[`${prefix}_title`] = "Section title is required";
      }

      // Description validation (20-100 words)
      if (!section.description.trim()) {
        errors[`${prefix}_description`] = "Section description is required";
      } else if (!validateWordCount(section.description, 20, 100)) {
        errors[`${prefix}_description`] =
          "Description should be between 20 and 100 words";
      }
    });

    return { errors, isValid: Object.keys(errors).length === 0 };
  }, [resumeData.customSections]);

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
  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 1: // Personal Info
        const personalInfoValidation = validatePersonalInfo();
        setValidationErrors(personalInfoValidation.errors);
        return personalInfoValidation.isValid;
      case 2: // Experience
        const experienceValidation = validateExperience();
        setValidationErrors(experienceValidation.errors);
        return experienceValidation.isValid;
      case 3: // Education
        const educationValidation = validateEducation();
        setValidationErrors(educationValidation.errors);
        return educationValidation.isValid;
      case 4: // Skills
        const skillsValidation = validateSkills();
        setValidationErrors(skillsValidation.errors);
        return skillsValidation.isValid;
      case 5: // Projects
        const projectsValidation = validateProjects();
        setValidationErrors(projectsValidation.errors);
        return projectsValidation.isValid;
      case 6: // Additional sections (Certifications, Languages, Custom)
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

  // Convert resume data to portfolio data format for templates
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
      // Get preview image based on template
      const getPreviewImage = () => {
        const baseUrl = "/preview-images";

        // Map template IDs to their corresponding image names
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
              {/* Preview Image */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <img
                  src={getPreviewImage()}
                  alt={`${template.name} preview`}
                  className="w-full h-full object-cover object-top transition-opacity duration-200"
                  onLoad={(e) => {
                    // Hide loading state when image loads
                    const target = e.target as HTMLImageElement;
                    const loadingDiv = target.parentElement?.querySelector(
                      ".loading-placeholder"
                    ) as HTMLElement;
                    if (loadingDiv) {
                      loadingDiv.style.display = "none";
                    }
                  }}
                  onError={(e) => {
                    // Fallback to live component preview if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallbackDiv =
                      target.nextElementSibling as HTMLElement;
                    if (fallbackDiv) {
                      fallbackDiv.style.display = "block";
                    }
                  }}
                />

                {/* Loading placeholder */}
                <div className="loading-placeholder absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-gray-400 text-sm">
                    Loading preview...
                  </div>
                </div>

                {/* Fallback to live component preview */}
                <div className="w-full h-full" style={{ display: "none" }}>
                  {getTemplateComponent()}
                </div>
              </div>

              {/* Theme indicator overlay */}
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded-md backdrop-blur-sm">
                {themes.find((t) => t.id === selectedTheme)?.name ||
                  selectedTheme}
              </div>

              {/* Template layout indicator */}
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

  const renderSkillsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Skills (Optional)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add your technical and professional skills - this section is optional
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
        <CardTitle className="text-xl">Work Experience (Required)</CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">
          List your work experience in reverse chronological order - at least
          one experience is required
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {validationErrors.experience && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-500">
              {validationErrors.experience}
            </p>
          </div>
        )}
        {resumeData.experience.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-muted/10">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4 font-medium text-lg">
              No experience added yet
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Add your work experience to strengthen your resume. You'll be able
              to select dates using our calendar picker.
            </p>
            <Button onClick={addExperience} className="h-11 px-6 text-base">
              <Plus className="h-4 w-4 mr-2" /> Add Your First Experience
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
                      className={`h-11 ${
                        validationErrors[`experience_${exp.id}_position`]
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    {validationErrors[`experience_${exp.id}_position`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`experience_${exp.id}_position`]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(exp.id, "company", e.target.value)
                      }
                      placeholder="e.g., Google"
                      className={`h-11 ${
                        validationErrors[`experience_${exp.id}_company`]
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    {validationErrors[`experience_${exp.id}_company`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`experience_${exp.id}_company`]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      Start Date
                    </Label>
                    <SimpleDateInput
                      value={exp.startDate}
                      onChange={(value: string) =>
                        updateExperience(exp.id, "startDate", value)
                      }
                      placeholder="Select start date"
                      error={
                        !!validationErrors[`experience_${exp.id}_startDate`]
                      }
                    />
                    {validationErrors[`experience_${exp.id}_startDate`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`experience_${exp.id}_startDate`]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      End Date
                    </Label>
                    <div className="flex items-center gap-3">
                      {exp.isPresent ? (
                        <Input
                          type="text"
                          value="Present"
                          disabled
                          className="h-11 flex-1 text-muted-foreground bg-muted/50"
                        />
                      ) : (
                        <SimpleDateInput
                          value={exp.endDate || ""}
                          onChange={(value: string) =>
                            updateExperience(exp.id, "endDate", value)
                          }
                          placeholder="Select end date"
                          error={
                            !!validationErrors[`experience_${exp.id}_endDate`]
                          }
                          className="flex-1"
                        />
                      )}
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
                    {validationErrors[`experience_${exp.id}_endDate`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`experience_${exp.id}_endDate`]}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) =>
                      updateExperience(exp.id, "description", e.target.value)
                    }
                    placeholder="Describe your responsibilities and achievements (20-100 words)"
                    rows={4}
                    className={`resize-none ${
                      validationErrors[`experience_${exp.id}_description`]
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {validationErrors[`experience_${exp.id}_description`] && (
                    <p className="text-xs text-red-500">
                      {validationErrors[`experience_${exp.id}_description`]}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {exp.description.trim()
                      ? `${
                          exp.description
                            .trim()
                            .split(/\s+/)
                            .filter((word) => word.length > 0).length
                        } words`
                      : "0 words"}{" "}
                    (20-100 words required)
                  </p>
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
        <CardTitle>Education (Optional)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add your educational background - this section is optional
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
                    <Label className="text-sm font-medium">
                      Institution <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(edu.id, "institution", e.target.value)
                      }
                      placeholder="e.g., Stanford University"
                      className={
                        validationErrors[`education_${edu.id}_institution`]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {validationErrors[`education_${edu.id}_institution`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`education_${edu.id}_institution`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Degree <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(edu.id, "degree", e.target.value)
                      }
                      placeholder="e.g., Bachelor of Science"
                      className={
                        validationErrors[`education_${edu.id}_degree`]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {validationErrors[`education_${edu.id}_degree`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`education_${edu.id}_degree`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Field of Study
                    </Label>
                    <Input
                      value={edu.field || ""}
                      onChange={(e) =>
                        updateEducation(edu.id, "field", e.target.value)
                      }
                      placeholder="e.g., Computer Science"
                      className={
                        validationErrors[`education_${edu.id}_field`]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {validationErrors[`education_${edu.id}_field`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`education_${edu.id}_field`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      GPA (optional)
                    </Label>
                    <Input
                      value={edu.gpa || ""}
                      onChange={(e) =>
                        updateEducation(edu.id, "gpa", e.target.value)
                      }
                      placeholder="e.g., 8.5 (out of 10)"
                      className={
                        validationErrors[`education_${edu.id}_gpa`]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {validationErrors[`education_${edu.id}_gpa`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`education_${edu.id}_gpa`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      Start Date <span className="text-red-500">*</span>
                    </Label>
                    <SimpleDateInput
                      value={edu.startDate || ""}
                      onChange={(value: string) =>
                        updateEducation(edu.id, "startDate", value)
                      }
                      placeholder="Select start date"
                      error={
                        !!validationErrors[`education_${edu.id}_startDate`]
                      }
                    />
                    {validationErrors[`education_${edu.id}_startDate`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`education_${edu.id}_startDate`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      End Date <span className="text-red-500">*</span>
                    </Label>
                    <SimpleDateInput
                      value={edu.endDate || ""}
                      onChange={(value: string) =>
                        updateEducation(edu.id, "endDate", value)
                      }
                      placeholder="Select end date"
                      error={!!validationErrors[`education_${edu.id}_endDate`]}
                    />
                    {validationErrors[`education_${edu.id}_endDate`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`education_${edu.id}_endDate`]}
                      </p>
                    )}
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
          <CardTitle>Projects (Optional)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showcase your best projects - this section is optional
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
                      <Label className="text-sm font-medium">
                        Project Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={proj.name}
                        onChange={(e) =>
                          updateProject(proj.id, "name", e.target.value)
                        }
                        placeholder="e.g., E-commerce Platform"
                        className={
                          validationErrors[`project_${proj.id}_name`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {validationErrors[`project_${proj.id}_name`] && (
                        <p className="text-xs text-red-500">
                          {validationErrors[`project_${proj.id}_name`]}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={proj.description}
                        onChange={(e) =>
                          updateProject(proj.id, "description", e.target.value)
                        }
                        placeholder="Describe the project, your role, and key achievements"
                        rows={3}
                        className={
                          validationErrors[`project_${proj.id}_description`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {validationErrors[`project_${proj.id}_description`] && (
                        <p className="text-xs text-red-500">
                          {validationErrors[`project_${proj.id}_description`]}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {proj.description.trim()
                          ? `${
                              proj.description
                                .trim()
                                .split(/\s+/)
                                .filter((word) => word.length > 0).length
                            } words`
                          : "0 words"}{" "}
                        (20-100 words required)
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Source Code URL (optional)
                      </Label>
                      <Input
                        value={proj.sourceUrl || ""}
                        onChange={(e) =>
                          updateProject(proj.id, "sourceUrl", e.target.value)
                        }
                        placeholder="https://github.com/username/project"
                        className={
                          validationErrors[`project_${proj.id}_sourceUrl`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {validationErrors[`project_${proj.id}_sourceUrl`] && (
                        <p className="text-xs text-red-500">
                          {validationErrors[`project_${proj.id}_sourceUrl`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Live Demo URL (optional)
                      </Label>
                      <Input
                        value={proj.demoUrl || ""}
                        onChange={(e) =>
                          updateProject(proj.id, "demoUrl", e.target.value)
                        }
                        placeholder="https://project-demo.com"
                        className={
                          validationErrors[`project_${proj.id}_demoUrl`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {validationErrors[`project_${proj.id}_demoUrl`] && (
                        <p className="text-xs text-red-500">
                          {validationErrors[`project_${proj.id}_demoUrl`]}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">
                        Technologies Used{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      {validationErrors[`project_${proj.id}_techStack`] && (
                        <p className="text-xs text-red-500 mb-2">
                          {validationErrors[`project_${proj.id}_techStack`]}
                        </p>
                      )}
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
                    <Label className="text-sm font-medium">
                      Certification Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={cert.name}
                      onChange={(e) =>
                        updateCertification(cert.id, "name", e.target.value)
                      }
                      placeholder="e.g., AWS Certified Solutions Architect"
                      className={
                        validationErrors[`certification_${cert.id}_name`]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {validationErrors[`certification_${cert.id}_name`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`certification_${cert.id}_name`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Issuing Organization{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) =>
                        updateCertification(cert.id, "issuer", e.target.value)
                      }
                      placeholder="e.g., Amazon Web Services"
                      className={
                        validationErrors[`certification_${cert.id}_issuer`]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {validationErrors[`certification_${cert.id}_issuer`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`certification_${cert.id}_issuer`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      Date Earned <span className="text-red-500">*</span>
                    </Label>
                    <SimpleDateInput
                      value={cert.date || ""}
                      onChange={(value: string) =>
                        updateCertification(cert.id, "date", value)
                      }
                      placeholder="Select date earned"
                      error={
                        !!validationErrors[`certification_${cert.id}_date`]
                      }
                    />
                    {validationErrors[`certification_${cert.id}_date`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`certification_${cert.id}_date`]}
                      </p>
                    )}
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
      id: Math.random().toString(36).substring(2, 11),
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
                    <Label className="text-sm font-medium">
                      Language <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={lang.name}
                      onChange={(e) =>
                        updateLanguage(lang.id, "name", e.target.value)
                      }
                      placeholder="e.g., Spanish"
                      className={
                        validationErrors[`language_${lang.id}_name`]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {validationErrors[`language_${lang.id}_name`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`language_${lang.id}_name`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Proficiency Level <span className="text-red-500">*</span>
                    </Label>
                    <select
                      value={lang.proficiency || ""}
                      onChange={(e) =>
                        updateLanguage(lang.id, "proficiency", e.target.value)
                      }
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        validationErrors[`language_${lang.id}_proficiency`]
                          ? "border-red-500"
                          : ""
                      }`}
                    >
                      <option value="">Select proficiency</option>
                      <option value="Native">Native</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Beginner">Beginner</option>
                    </select>
                    {validationErrors[`language_${lang.id}_proficiency`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`language_${lang.id}_proficiency`]}
                      </p>
                    )}
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
      id: Math.random().toString(36).substring(2, 11),
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
                    <Label className="text-sm font-medium">
                      Section Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={section.title}
                      onChange={(e) =>
                        updateCustomSection(section.id, "title", e.target.value)
                      }
                      placeholder="e.g., Volunteer Work, Publications, Awards"
                      className={
                        validationErrors[`customSection_${section.id}_title`]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {validationErrors[`customSection_${section.id}_title`] && (
                      <p className="text-xs text-red-500">
                        {validationErrors[`customSection_${section.id}_title`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Content <span className="text-red-500">*</span>
                    </Label>
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
                      className={
                        validationErrors[
                          `customSection_${section.id}_description`
                        ]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {validationErrors[
                      `customSection_${section.id}_description`
                    ] && (
                      <p className="text-xs text-red-500">
                        {
                          validationErrors[
                            `customSection_${section.id}_description`
                          ]
                        }
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {section.description.trim()
                        ? `${
                            section.description
                              .trim()
                              .split(/\s+/)
                              .filter((word) => word.length > 0).length
                          } words`
                        : "0 words"}{" "}
                      (20-100 words required)
                    </p>
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
      {
        name: "Experience (Required)",
        completed: resumeData.experience.length > 0,
      },
      {
        name: "Education (Optional)",
        completed: resumeData.education.length > 0,
      },
      { name: "Skills (Optional)", completed: resumeData.skills.length > 0 },
      {
        name: "Projects (Optional)",
        completed: resumeData.projects.length > 0,
      },
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

  // While auth state is initializing, show a loader
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
    // Redirect to login if not authenticated, with return URL
    router.push('/login?returnTo=/create-resume');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show choice between Upload PDF and Build from Scratch
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">
              Create Resume
            </h1>
            <p className="text-muted-foreground">
              Build your professional resume with real-time preview
            </p>
          </div>

          {/* Quick actions in header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowChoice(true)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Choice
            </Button>

            <div className="hidden sm:flex flex-col">
              <span className="text-sm mb-1 font-medium">Template</span>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="h-9 w-48 px-3 py-1 text-sm border border-border rounded-md bg-background"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-auto flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="self-stretch sm:self-end w-full sm:w-auto shrink-0"
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
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? "flex-1" : ""
                }`}
              >
                <button
                  onClick={() => goToStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.id
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-xs">
                    {step.id + 1}
                  </span>
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className="hidden sm:block flex-1 h-px bg-border mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div
              className={`transition-opacity duration-150 ${
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

          {/* Preview Section */}
          <div className="sticky top-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Preview</h2>
              <Button
                onClick={() => setShowFullPreview(true)}
                variant="outline"
                size="sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Full Screen
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="bg-white p-4">
                <div
                  className="relative overflow-hidden"
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

        {/* Full Preview Modal */}
        {showFullPreview && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
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
              <div className="p-6 overflow-auto max-h-[calc(95vh-120px)] bg-muted/20">
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
