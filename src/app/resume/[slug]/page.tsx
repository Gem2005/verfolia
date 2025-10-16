"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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

// Import only the tracking component - avoid importing chart components
import { ResumeViewTracker } from "@/components/analytics/ResumeViewTracker";
import type { PortfolioData } from "@/types/PortfolioTypes";
import { ProfileHeader } from "@/components/layout/ProfileHeader";
import "./print.css";

// Lazy load the template renderer - it will load only the specific template needed
const DynamicTemplateRenderer = dynamic(
  () => import("@/components/templates/DynamicTemplateRenderer").then((mod) => ({ default: mod.DynamicTemplateRenderer })),
  { loading: () => <div className="flex items-center justify-center min-h-screen">Loading template...</div> }
);

interface PublicResumePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PublicResumePage({ params }: PublicResumePageProps) {
  const { slug } = React.use(params);
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

    const mappedCustomSections = customSections.map((section: CustomSection) => ({
      id: section.id || Math.random().toString(),
      title: section.title || "Custom Section",
      items: section.items || [],
    }));

    return {
      personalInfo: {
        firstName: personalInfo.firstName || "John",
        lastName: personalInfo.lastName || "Doe",
        title: personalInfo.title || resume.title || "Professional",
        email: personalInfo.email || "contact@example.com",
        phone: personalInfo.phone || "+1 (555) 123-4567",
        location: personalInfo.location || "Location",
        about: personalInfo.summary || "Professional summary",
        photo: personalInfo.photo || "/professional-headshot.png",
        social: {
          github: personalInfo.githubUrl || personalInfo.website || "",
          twitter: "",
          linkedin: personalInfo.linkedinUrl || personalInfo.website || "",
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
        location: exp.location || "",
      })),
      skills: skills.filter((skill: string) => skill && skill.trim()),
      education: education.map((edu: Education) => ({
        id: edu.id || Math.random().toString(),
        institution: edu.institution || "Institution",
        degree: edu.degree || "Degree",
        field: edu.field || "",
        startYear: edu.startDate || "",
        endYear: edu.endDate || "",
        cgpa: edu.gpa || "",
        location: edu.location || "",
      })),
      projects: projects.map((proj: Project) => ({
        id: proj.id || Math.random().toString(),
        name: proj.name || "Project",
        description: proj.description || "Project description",
        techStack: proj.techStack || [],
        sourceUrl: proj.repoUrl || "",
        demoUrl: proj.liveUrl || "",
        isLocked: proj.isLocked || false,
      })),
      blogs: [],
      certifications: certifications.map((cert: Certification) => ({
        id: cert.id || Math.random().toString(),
        title: cert.name || "Certification",
        issuer: cert.issuer || "Issuer",
        date: cert.date || "",
        url: cert.url || "",
      })),
      languages: languages.map((lang: Language) => ({
        id: lang.id || Math.random().toString(),
        name: lang.name || "Language",
        proficiency: lang.proficiency || "",
      })),
      customSections: mappedCustomSections,
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

    return (
      <DynamicTemplateRenderer
        templateId={resume.template_id || "clean-mono"}
        data={portfolioData}
        theme={resume.theme_id || "black"}
        resumeId={resume.id}
      />
    );
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
      
      {/* Only track the view if it's NOT the owner - Use new ResumeViewTracker */}
      {!isOwner ? (
        <ResumeViewTracker resumeId={resume.id}>
          <div className="resume-content">
            {renderResumeTemplate(resume)}
          </div>
        </ResumeViewTracker>
      ) : (
        <div className="resume-content">
          {renderResumeTemplate(resume)}
        </div>
      )}
    </div>
  );
}

