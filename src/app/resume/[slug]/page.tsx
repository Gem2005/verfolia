"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import {
  resumeService,
  type Resume,
  type Experience,
  type Education,
  type Project,
  type Certification,
  type CustomSection,
  type Language,
} from "../../../services/resume-service";

import { ViewTracker } from "@/components/analytics";
import {
  CleanMonoTemplate,
  DarkMinimalistTemplate,
  DarkTechTemplate,
  ModernAIFocusedTemplate,
} from "@/components/templates";
import type { PortfolioData } from "@/types/PortfolioTypes";
import "./print.css";

interface PublicResumePageProps {
  params: {
    slug: string;
  };
}

export default function PublicResumePage({ params }: PublicResumePageProps) {
  const { slug } = params;
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResume = async () => {
      try {
        setLoading(true);
        const resumeData = await resumeService.getResumeBySlug(slug);
        setResume(resumeData);
      } catch (error) {
        console.error("Error loading resume:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [slug]);

  // Track view duration
  useEffect(() => {
    if (!resume) return;

    const startTime = Date.now();

    const trackViewDuration = () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (duration > 0 && resume?.id) {
        resumeService.updateViewDuration(resume.id, duration);
      }
    };

    window.addEventListener("beforeunload", trackViewDuration);

    return () => {
      window.removeEventListener("beforeunload", trackViewDuration);
      trackViewDuration();
    };
  }, [resume]);

  // Convert resume data to portfolio data format
  const getPortfolioData = (resume: Resume): PortfolioData => {
    // Validate and provide fallbacks for required data
    const personalInfo = resume.personal_info || {};
    const experience = Array.isArray(resume.experience)
      ? resume.experience
      : [];
    const education = Array.isArray(resume.education) ? resume.education : [];
    const skills = Array.isArray(resume.skills) ? resume.skills : [];
    const projects = Array.isArray(resume.projects) ? resume.projects : [];
    const certifications = Array.isArray(resume.certifications)
      ? resume.certifications
      : [];
    const customSections = Array.isArray(resume.custom_sections)
      ? resume.custom_sections
      : [];
    const languages = Array.isArray(resume.languages) ? resume.languages : [];

    return {
      personalInfo: {
        firstName: personalInfo.firstName || "John",
        lastName: personalInfo.lastName || "Doe",
        title: "Professional", // Hardcoded since it's not in PersonalInfo
        email: personalInfo.email || "contact@example.com",
        phone: personalInfo.phone || "+1 (555) 123-4567",
        location: personalInfo.location || "Location",
        about: "Professional", // Hardcoded since summary is not in PersonalInfo
        photo: "/professional-headshot.png", // Hardcoded since it's not in PersonalInfo
        social: {
          github: personalInfo.website || "", // Using website as a fallback
          twitter: "",
          linkedin: personalInfo.website || "", // Using website as a fallback
          portfolio: personalInfo.website || "",
        },
      },
      experience: experience.map((exp: Experience) => ({
        id: exp.id || Math.random().toString(),
        position: exp.position || "Position",
        company: exp.company || "Company",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        isPresent: !exp.endDate || exp.endDate === "",
        description: exp.description || "Job description",
      })),
      skills: skills.filter((skill: string) => skill && skill.trim()),
      education: education.map((edu: Education) => ({
        id: edu.id || Math.random().toString(),
        institution: edu.school || "Institution", // Changed to match Education type
        degree: edu.degree || "Degree",
        field: edu.field || "",
        startYear: edu.startDate || "",
        endYear: edu.endDate || "",
        cgpa: "", // Education type doesn't have gpa field
      })),
      projects: projects.map((proj: Project) => ({
        id: proj.id || Math.random().toString(),
        name: proj.name || "Project",
        description: proj.description || "Project description",
        techStack: proj.technologies || [],
        sourceUrl: proj.repoUrl || "", // Using repoUrl from Project type
        demoUrl: proj.liveUrl || "", // Using liveUrl from Project type
      })),
      blogs: [],
      certifications: certifications.map((cert: Certification) => ({
        id: cert.id || Math.random().toString(),
        title: cert.name || "Certification",
        issuer: cert.issuer || "Issuer",
        date: cert.issueDate || "",
        url: cert.credentialUrl || "",
      })),
      interests: [
        ...customSections
          .map((section: CustomSection) => section.title)
          .filter((title: string) => title && title.trim()),
        ...languages
          .map(
            (lang: Language) =>
              `${lang.name} (${lang.proficiency || "Proficient"})`
          )
          .filter((lang: string) => lang && lang.trim()),
      ],
    };
  };

  const renderResumeTemplate = (resume: Resume) => {
    const portfolioData = getPortfolioData(resume);
    const templateProps = {
      preview: false,
      data: portfolioData,
      theme: resume.theme_id || "black",
      resumeId: resume.id, // Add resumeId for tracking
    };

    // Log for debugging
    console.log(
      "Rendering template:",
      resume.template_id,
      "with theme:",
      resume.theme_id
    );
    console.log("Portfolio data:", portfolioData);

    try {
      switch (resume.template_id) {
        case "clean-mono":
          return <CleanMonoTemplate {...templateProps} />;
        case "dark-minimalist":
          return <DarkMinimalistTemplate {...templateProps} />;
        case "dark-tech":
          return <DarkTechTemplate {...templateProps} />;
        case "modern-ai-focused":
          return <ModernAIFocusedTemplate {...templateProps} />;
        default:
          console.warn(
            `Unknown template: ${resume.template_id}, falling back to clean-mono`
          );
          return <CleanMonoTemplate {...templateProps} />;
      }
    } catch (error) {
      console.error("Error rendering template:", error);
      // Fallback to interactive clean mono template with error handling
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Resume Display Error
            </h2>
            <p className="text-gray-600 mb-4">
              There was an issue displaying this resume.
            </p>
            <CleanMonoTemplate {...templateProps} />
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-8 bg-muted rounded w-64 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-48 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
          <div className="mt-8 space-y-2">
            <div className="h-32 bg-muted rounded w-80 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-64 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-56 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return notFound();
  }

  return (
    <div className="min-h-screen">
      {resume && <ViewTracker resumeId={resume.id} />}
      {renderResumeTemplate(resume)}
    </div>
  );
}
