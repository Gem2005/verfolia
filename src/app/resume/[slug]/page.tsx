"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { resumeService, type Resume } from "@/services/resume-service";
import { Button } from "@/components/ui/button";
import { Share2, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  ViewTracker,
  TrackableLink,
  SectionViewTracker,
} from "@/components/analytics";

interface PublicResumePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface ThemeStyles {
  sectionText: string;
  headerText: string;
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

    // Start time tracking
    const startTime = Date.now();

    // Track view duration when component unmounts or when user leaves the page
    const trackViewDuration = () => {
      const duration = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
      if (duration > 0 && resume?.id) {
        resumeService.updateViewDuration(resume.id, duration);
      }
    };

    // Set up event listeners for when user leaves page
    window.addEventListener("beforeunload", trackViewDuration);

    return () => {
      window.removeEventListener("beforeunload", trackViewDuration);
      trackViewDuration();
    };
  }, [resume]);

  // Track interactions with resume elements
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
          // Track successful share
          trackInteraction("share", "navigator.share", "resume");
        })
        .catch((err) => {
          console.error("Error sharing resume:", err);
        });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert("Resume URL copied to clipboard!");
        trackInteraction("share", "clipboard_copy", "resume");
      });
    }
  };

  const handleDownload = () => {
    // This would be implemented with actual PDF generation
    // For now, we'll just track the interaction
    trackInteraction("download", "pdf", "resume");
    alert("PDF download functionality will be implemented soon!");
  };

  const getThemeStyles = (themeId: string): ThemeStyles => {
    switch (themeId) {
      case "black":
        return {
          sectionText: "text-black",
          headerText: "text-black",
        };
      case "dark-gray":
        return {
          sectionText: "text-gray-800",
          headerText: "text-gray-900",
        };
      case "navy-blue":
        return {
          sectionText: "text-blue-900",
          headerText: "text-blue-900",
        };
      case "professional":
        return {
          sectionText: "text-gray-700",
          headerText: "text-gray-800",
        };
      default:
        return {
          sectionText: "text-black",
          headerText: "text-black",
        };
    }
  };

  const renderResumeLayout = (resume: Resume) => {
    const themeStyles = getThemeStyles(resume.theme_id);

    switch (resume.template_id) {
      case "classic":
        return renderClassicLayout(resume, themeStyles);
      case "executive":
        return renderExecutiveLayout(resume, themeStyles);
      case "creative":
        return renderCreativeLayout(resume, themeStyles);
      case "minimal":
        return renderMinimalLayout(resume, themeStyles);
      case "corporate":
        return renderCorporateLayout(resume, themeStyles);
      default:
        return renderClassicLayout(resume, themeStyles);
    }
  };

  const renderClassicLayout = (resume: Resume, themeStyles: ThemeStyles) => (
    <div className="bg-white p-8 shadow-lg min-h-[700px] w-full max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <SectionViewTracker
          resumeId={resume.id}
          sectionName="header"
          className="text-center border-b border-gray-300 pb-6"
        >
          <h1 className={`text-4xl font-bold ${themeStyles.headerText} mb-4`}>
            {resume.personal_info.firstName} {resume.personal_info.lastName}
          </h1>
          <div className="text-base text-gray-600 space-y-2">
            <div className="flex justify-center items-center gap-2">
              {resume.personal_info.email && (
                <span>{resume.personal_info.email}</span>
              )}
              {resume.personal_info.email && resume.personal_info.phone && (
                <span>•</span>
              )}
              {resume.personal_info.phone && (
                <span>{resume.personal_info.phone}</span>
              )}
            </div>
            {resume.personal_info.location && (
              <div>{resume.personal_info.location}</div>
            )}
            <div className="flex justify-center gap-6 mt-3">
              {resume.personal_info.linkedinUrl && (
                <TrackableLink
                  href={resume.personal_info.linkedinUrl}
                  resumeId={resume.id}
                  interactionType="link_click"
                  sectionName="linkedin"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </TrackableLink>
              )}
              {resume.personal_info.githubUrl && (
                <TrackableLink
                  href={resume.personal_info.githubUrl}
                  resumeId={resume.id}
                  interactionType="link_click"
                  sectionName="github"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </TrackableLink>
              )}
            </div>
          </div>
        </SectionViewTracker>

        {/* Professional Summary */}
        {resume.personal_info.summary && (
          <SectionViewTracker resumeId={resume.id} sectionName="summary">
            <h2
              className={`text-xl font-semibold ${themeStyles.sectionText} mb-4 border-b border-gray-200 pb-2`}
            >
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              {resume.personal_info.summary}
            </p>
          </SectionViewTracker>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <SectionViewTracker resumeId={resume.id} sectionName="experience">
            <h2
              className={`text-xl font-semibold ${themeStyles.sectionText} mb-4 border-b border-gray-200 pb-2`}
            >
              PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-5">
              {resume.experience.map((exp) => (
                <div key={exp.id} className="border-l-4 border-gray-200 pl-6">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {exp.position}
                    </h3>
                    <p className="font-medium text-gray-700">{exp.company}</p>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </SectionViewTracker>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <SectionViewTracker resumeId={resume.id} sectionName="education">
            <h2
              className={`text-xl font-semibold ${themeStyles.sectionText} mb-4 border-b border-gray-200 pb-2`}
            >
              EDUCATION
            </h2>
            <div className="space-y-4">
              {resume.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {edu.degree}
                      </h3>
                      <p className="text-gray-700">{edu.institution}</p>
                      {edu.field && (
                        <p className="text-gray-600 italic">{edu.field}</p>
                      )}
                    </div>
                    <div className="text-right text-gray-600">
                      <p className="font-medium">
                        {edu.startDate} - {edu.endDate}
                      </p>
                      {edu.gpa && <p>CGPA: {edu.gpa}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionViewTracker>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <SectionViewTracker resumeId={resume.id} sectionName="skills">
            <h2
              className={`text-xl font-semibold ${themeStyles.sectionText} mb-4 border-b border-gray-200 pb-2`}
            >
              TECHNICAL SKILLS
            </h2>
            <div className="flex flex-wrap gap-3">
              {resume.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium border"
                  onClick={() =>
                    trackInteraction("skill_click", skill, "skills")
                  }
                >
                  {skill}
                </span>
              ))}
            </div>
          </SectionViewTracker>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <SectionViewTracker resumeId={resume.id} sectionName="projects">
            <h2
              className={`text-xl font-semibold ${themeStyles.sectionText} mb-4 border-b border-gray-200 pb-2`}
            >
              PROJECTS
            </h2>
            <div className="space-y-5">
              {resume.projects.map((project) => (
                <div key={project.id}>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {project.name}
                  </h3>
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium border border-blue-200"
                          onClick={() =>
                            trackInteraction("tech_click", tech, "projects")
                          }
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.description && (
                    <p className="text-gray-700 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </SectionViewTracker>
        )}

        {/* Additional sections */}
        <SectionViewTracker resumeId={resume.id} sectionName="additional">
          <div className="space-y-5">
            {resume.certifications.length > 0 && (
              <div>
                <h2
                  className={`text-xl font-semibold ${themeStyles.sectionText} mb-4 border-b border-gray-200 pb-2`}
                >
                  CERTIFICATIONS
                </h2>
                <div className="space-y-3">
                  {resume.certifications.map((cert) => (
                    <div key={cert.id}>
                      <h3 className="font-medium text-gray-900">{cert.name}</h3>
                      <p className="text-gray-700">{cert.issuer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resume.languages.length > 0 && (
              <div>
                <h2
                  className={`text-xl font-semibold ${themeStyles.sectionText} mb-4 border-b border-gray-200 pb-2`}
                >
                  LANGUAGES
                </h2>
                <div className="flex flex-wrap gap-3">
                  {resume.languages.map((lang) => (
                    <span
                      key={lang.id}
                      className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium border"
                    >
                      {lang.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resume.custom_sections.map(
              (section) =>
                section.title && (
                  <div key={section.id}>
                    <h2
                      className={`text-xl font-semibold ${themeStyles.sectionText} mb-4 border-b border-gray-200 pb-2`}
                    >
                      {section.title.toUpperCase()}
                    </h2>
                    {section.description && (
                      <p className="text-gray-700 leading-relaxed">
                        {section.description}
                      </p>
                    )}
                  </div>
                )
            )}
          </div>
        </SectionViewTracker>
      </div>
    </div>
  );

  // Similar layouts for other templates (executive, creative, minimal, corporate)
  const renderExecutiveLayout = (resume: Resume, themeStyles: ThemeStyles) => {
    // Implementation similar to create resume page but optimized for viewing
    return renderClassicLayout(resume, themeStyles);
  };

  const renderCreativeLayout = (resume: Resume, themeStyles: ThemeStyles) => {
    // Implementation similar to create resume page but optimized for viewing
    return renderClassicLayout(resume, themeStyles);
  };

  const renderMinimalLayout = (resume: Resume, themeStyles: ThemeStyles) => {
    // Implementation similar to create resume page but optimized for viewing
    return renderClassicLayout(resume, themeStyles);
  };

  const renderCorporateLayout = (resume: Resume, themeStyles: ThemeStyles) => {
    // Implementation similar to create resume page but optimized for viewing
    return renderClassicLayout(resume, themeStyles);
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
                  href="/"
                  onClick={() =>
                    resume && trackInteraction("navigation", "home", "nav")
                  }
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
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
        <div className="max-w-4xl mx-auto">{renderResumeLayout(resume)}</div>
      </div>
    </div>
  );
}
