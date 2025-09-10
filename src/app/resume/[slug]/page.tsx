"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
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
import { ProfileHeader } from "@/components/layout/ProfileHeader";
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
  const { user } = useAuth(); // Get the currently logged-in user
  const [isOwner, setIsOwner] = useState(false); // State to check if viewer is owner

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

  // This is a new block of code.
  // It checks if the logged-in user's ID matches the resume's creator ID.
  useEffect(() => {
    if (user && resume) {
      setIsOwner(user.id === resume.user_id);
    } else {
      setIsOwner(false);
    }
  }, [user, resume]);


  // Track view duration
  useEffect(() => {
    // We only track views for people who are NOT the owner
    if (!resume || isOwner) return;

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
  }, [resume, isOwner]);

  // Convert resume data to portfolio data format
  const getPortfolioData = (resume: Resume): PortfolioData => {
    // This function remains mostly the same
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
        title: "Professional",
        email: personalInfo.email || "contact@example.com",
        phone: personalInfo.phone || "+1 (555) 123-4567",
        location: personalInfo.location || "Location",
        about: "Professional",
        photo: "/professional-headshot.png",
        social: {
          github: personalInfo.website || "",
          twitter: "",
          linkedin: personalInfo.website || "",
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
        institution: edu.school || "Institution",
        degree: edu.degree || "Degree",
        field: edu.field || "",
        startYear: edu.startDate || "",
        endYear: edu.endDate || "",
        cgpa: "",
      })),
      projects: projects.map((proj: Project) => ({
        id: proj.id || Math.random().toString(),
        name: proj.name || "Project",
        description: proj.description || "Project description",
        techStack: proj.technologies || [],
        sourceUrl: proj.repoUrl || "",
        demoUrl: proj.liveUrl || "",
        isLocked: proj.isLocked || false,
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
      resumeId: resume.id,
    };

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
          return <CleanMonoTemplate {...templateProps} />;
      }
    } catch (error) {
      console.error("Error rendering template:", error);
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-background flex items-center justify-center">
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
      {/* This is the key change: only show the header if the user is the owner */}
      {isOwner && <ProfileHeader resume={resume} />}
      
      {/* Only track the view if it's NOT the owner */}
      {!isOwner && <ViewTracker resumeId={resume.id} />}
      
      <div className="resume-content">
        {renderResumeTemplate(resume)}
      </div>
    </div>
  );
}

