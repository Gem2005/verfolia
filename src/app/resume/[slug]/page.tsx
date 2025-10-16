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

  // Convert resume data to portfolio data format (no default placeholder values)
  const getPortfolioData = (resume: Resume): PortfolioData => {
    const personalInfo = resume.personal_info || {};
    const experience = Array.isArray(resume.experience) ? resume.experience : [];
    const education = Array.isArray(resume.education) ? resume.education : [];
    const skills = Array.isArray(resume.skills) ? resume.skills : [];
    const projects = Array.isArray(resume.projects) ? resume.projects : [];
    const certifications = Array.isArray(resume.certifications) ? resume.certifications : [];
    const customSections = Array.isArray(resume.custom_sections) ? resume.custom_sections : [];
    const languages = Array.isArray(resume.languages) ? resume.languages : [];

    const mappedCustomSections = customSections
      .map((section: CustomSection) => ({
        id: section.id || Math.random().toString(),
        title: section.title || "",
        items: Array.isArray(section.items) ? section.items : [],
      }))
      .filter((section) => section.title || (section.items && section.items.length > 0));

    return {
      personalInfo: {
        firstName: personalInfo.firstName || "",
        lastName: personalInfo.lastName || "",
        title: personalInfo.title || resume.title || "",
        email: personalInfo.email || "",
        phone: personalInfo.phone || "",
        location: personalInfo.location || "",
        about: personalInfo.summary || "",
        photo: personalInfo.photo || "",
        social: {
          github: personalInfo.githubUrl || "",
          twitter: personalInfo.twitterUrl || "",
          linkedin: personalInfo.linkedinUrl || "",
          portfolio: personalInfo.website || "",
        },
      },
      experience: experience.map((exp: Experience) => ({
        id: exp.id || Math.random().toString(),
        position: exp.position || "",
        company: exp.company || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        isPresent: !exp.endDate || exp.endDate === "",
        description: exp.description || "",
        location: exp.location || "",
      })).filter((exp) => exp.position || exp.company || exp.description),
      skills: skills.filter((skill: string) => !!(skill && skill.trim())),
      education: education.map((edu: Education) => ({
        id: edu.id || Math.random().toString(),
        institution: edu.institution || "",
        degree: edu.degree || "",
        field: edu.field || "",
        startYear: edu.startDate || "",
        endYear: edu.endDate || "",
        cgpa: edu.gpa || "",
        location: edu.location || "",
      })).filter((edu) => edu.institution || edu.degree || edu.field),
      projects: projects.map((proj: Project) => ({
        id: proj.id || Math.random().toString(),
        name: proj.name || "",
        description: proj.description || "",
        techStack: Array.isArray(proj.techStack) ? proj.techStack : [],
        sourceUrl: proj.repoUrl || "",
        demoUrl: proj.liveUrl || "",
        isLocked: !!proj.isLocked,
      })).filter((proj) => proj.name || proj.description || (proj.techStack && proj.techStack.length > 0)),
      blogs: Array.isArray((resume as any).blogs) ? (resume as any).blogs : [],
      certifications: certifications.map((cert: Certification) => ({
        id: cert.id || Math.random().toString(),
        title: cert.name || "",
        issuer: cert.issuer || "",
        date: cert.date || "",
        url: cert.url || "",
      })).filter((cert) => cert.title || cert.issuer || cert.url),
      languages: languages.map((lang: Language) => ({
        id: lang.id || Math.random().toString(),
        name: lang.name || "",
        proficiency: lang.proficiency || "",
      })).filter((lang) => lang.name),
      customSections: mappedCustomSections,
      interests: Array.isArray((resume as any).interests) ? (resume as any).interests : [],
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

