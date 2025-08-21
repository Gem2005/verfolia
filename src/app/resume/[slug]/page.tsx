"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { resumeService, type Resume } from "@/services/resume-service";
import { Button } from "@/components/ui/button";
import { Share2, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ViewTracker } from "@/components/analytics";
import {
  CleanMonoTemplate,
  DarkMinimalistTemplate,
  DarkTechTemplate,
  ModernAIFocusedTemplate,
} from "@/components/templates";
import type { PortfolioData } from "@/types/PortfolioTypes";

interface PublicResumePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PublicResumePage({ params }: PublicResumePageProps) {
  const { slug } = use(params);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResume = async () => {
      try {
        setLoading(true);
        const resumeData = await resumeService.getPublicResume(slug);
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

  const trackInteraction = (
    interactionType: string,
    targetValue?: string,
    sectionName?: string
  ) => {
    if (!resume?.id) return;
    resumeService.trackResumeInteraction(
      resume.id,
      interactionType,
      targetValue,
      sectionName
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${resume?.personal_info.firstName} ${resume?.personal_info.lastName}'s Resume`,
          url: window.location.href,
        })
        .then(() => {
          trackInteraction("share", "navigator.share", "resume");
        })
        .catch((err) => {
          console.error("Error sharing resume:", err);
        });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert("Resume URL copied to clipboard!");
        trackInteraction("share", "clipboard_copy", "resume");
      });
    }
  };

  const handleDownload = () => {
    trackInteraction("download", "pdf", "resume");
    alert("PDF download functionality will be implemented soon!");
  };

  // Convert resume data to portfolio data format
  const getPortfolioData = (resume: Resume): PortfolioData => ({
    personalInfo: {
      firstName: resume.personal_info.firstName,
      lastName: resume.personal_info.lastName,
      title: resume.personal_info.summary || "Professional",
      email: resume.personal_info.email,
      phone: resume.personal_info.phone,
      location: resume.personal_info.location,
      about: resume.personal_info.summary,
      photo: resume.personal_info.photo || "/professional-headshot.png",
      social: {
        github: resume.personal_info.githubUrl || "",
        twitter: "",
        linkedin: resume.personal_info.linkedinUrl || "",
        portfolio: "",
      },
    },
    experience: resume.experience.map((exp) => ({
      ...exp,
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
    })),
    skills: resume.skills,
    education: resume.education.map((edu) => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startYear: edu.startDate,
      endYear: edu.endDate,
      cgpa: edu.gpa || "",
    })),
    projects: resume.projects.map((proj) => ({
      id: proj.id,
      name: proj.name,
      description: proj.description,
      techStack: proj.techStack,
      sourceUrl: (proj as any).sourceUrl || "",
      demoUrl: (proj as any).demoUrl || "",
    })),
    blogs: [],
    certifications: resume.certifications.map((cert) => ({
      id: cert.id,
      title: cert.name,
      issuer: cert.issuer,
      date: cert.date || "",
      url: cert.url || "",
    })),
    interests: [],
  });

  const renderResumeTemplate = (resume: Resume) => {
    const templateProps = {
      preview: false,
      data: getPortfolioData(resume),
      theme: resume.theme_id,
    };

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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-4 bg-muted rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {resume && <ViewTracker resumeId={resume.id} />}

      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="/create-resume"
                  onClick={() =>
                    resume &&
                    trackInteraction("navigation", "create-resume", "nav")
                  }
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Create New Resume
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {resume.personal_info.firstName}{" "}
                  {resume.personal_info.lastName}&lsquo;s Resume
                </h1>
                <p className="text-sm text-muted-foreground">
                  Public Resume • {resume.view_count} views
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">{renderResumeTemplate(resume)}</div>
      </div>
    </div>
  );
}
