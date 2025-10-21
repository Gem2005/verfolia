"use client";
import { useState } from "react";
import type {
  PortfolioData,
  PortfolioTemplateProps,
} from "@/types/PortfolioTypes";
import {
  Github,
  Linkedin,
  Mail,
  Twitter,
  Code,
  BookOpen,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateToDisplay } from "@/utils/date-utils";
import { formatGradeDisplay, formatDegreeDisplay } from "@/utils/grade-utils";
import { TrackableLink, SectionViewTracker } from "@/components/analytics";

interface DarkTechTemplateProps extends PortfolioTemplateProps {
  theme?: string;
  resumeId?: string;
}

export function DarkTechTemplate({
  data,
  theme = "black",
  resumeId,
  preview = false,
  disableTracking: disableTrackingProp,
}: DarkTechTemplateProps) {
  const [showAllProjects, setShowAllProjects] = useState(false);
  // Use prop if provided, otherwise fallback to preview mode check
  const disableTracking = disableTrackingProp ?? (preview || !resumeId);
  
  // Use provided data only; do not fallback to mock defaults
  const portfolioData: PortfolioData = data;

  // Theme configuration
  const getThemeClasses = () => {
    switch (theme) {
      case "dark-gray":
        return {
          bg: "bg-gray-900",
          text: "text-white",
          accent: "text-blue-400",
          border: "border-gray-600",
          cardBg: "bg-gray-800",
          cardBorder: "border-gray-600",
          sectionBorder: "border-gray-600",
          buttonHover: "hover:bg-blue-600",
          badgeHover: "hover:bg-blue-600",
        };
      case "navy-blue":
        return {
          bg: "bg-slate-900",
          text: "text-white",
          accent: "text-cyan-400",
          border: "border-blue-500",
          cardBg: "bg-blue-900",
          cardBorder: "border-blue-500",
          sectionBorder: "border-blue-500",
          buttonHover: "hover:bg-cyan-600",
          badgeHover: "hover:bg-cyan-600",
        };
      case "professional":
        return {
          bg: "bg-slate-800",
          text: "text-white",
          accent: "text-emerald-400",
          border: "border-slate-600",
          cardBg: "bg-slate-700",
          cardBorder: "border-slate-600",
          sectionBorder: "border-slate-600",
          buttonHover: "hover:bg-emerald-600",
          badgeHover: "hover:bg-emerald-600",
        };
      case "black":
        return {
          bg: "bg-black",
          text: "text-white",
          accent: "text-gray-300",
          border: "border-gray-700",
          cardBg: "bg-gray-900",
          cardBorder: "border-gray-700",
          sectionBorder: "border-gray-700",
          buttonHover: "hover:bg-gray-800",
          badgeHover: "hover:bg-gray-800",
        };
      case "white":
        return {
          bg: "bg-white",
          text: "text-gray-900",
          accent: "text-blue-700",
          border: "border-gray-400",
          cardBg: "bg-gray-100",
          cardBorder: "border-gray-400",
          sectionBorder: "border-gray-400",
          buttonHover: "hover:bg-blue-700",
          badgeHover: "hover:bg-blue-700",
        };
      default: // dark tech default
        return {
          bg: "bg-black",
          text: "text-white",
          accent: "text-gray-300",
          border: "border-gray-700",
          cardBg: "bg-gray-900",
          cardBorder: "border-gray-700",
          sectionBorder: "border-gray-700",
          buttonHover: "hover:bg-gray-800",
          badgeHover: "hover:bg-gray-800",
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={`template-sandbox ${preview ? 'preview-sandbox' : ''} theme-${theme}`}>
      <div
        className={`min-h-screen ${themeClasses.bg} font-sans`}
      >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(120,119,198,0.3)_0,transparent_600px),radial-gradient(circle_at_0%_60%,rgba(71,118,230,0.3)_0,transparent_400px)]"
        style={{ zIndex: 0 }}
      ></div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12 relative z-10 max-w-6xl">
        {/* Header - Social Links */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="header" disableTracking={disableTracking}>
          <header className="flex justify-center items-center space-x-6 mb-24" data-section="header">
            {portfolioData.personalInfo.social.github && (
              <TrackableLink
                href={portfolioData.personalInfo.social.github}
                resumeId={resumeId || ""}
                interactionType="social_link_click"
                sectionName="header"
                target="_blank"
                rel="noopener noreferrer"
                disableTracking={disableTracking}
                className={`${themeClasses.accent} hover:text-primary transition-colors`}
              >
                <Github className="w-6 h-6" />
              </TrackableLink>
            )}

            {portfolioData.personalInfo.social.linkedin && (
              <TrackableLink
                href={portfolioData.personalInfo.social.linkedin}
                resumeId={resumeId || ""}
                interactionType="social_link_click"
                sectionName="header"
                target="_blank"
                rel="noopener noreferrer"
                disableTracking={disableTracking}
                className={`${themeClasses.accent} hover:text-primary transition-colors`}
              >
                <Linkedin className="w-6 h-6" />
              </TrackableLink>
            )}

            {portfolioData.personalInfo.social.twitter && (
              <TrackableLink
                href={portfolioData.personalInfo.social.twitter}
                resumeId={resumeId || ""}
                interactionType="social_link_click"
                sectionName="header"
                target="_blank"
                rel="noopener noreferrer"
                disableTracking={disableTracking}
                className={`${themeClasses.accent} hover:text-primary transition-colors`}
              >
                <Twitter className="w-6 h-6" />
              </TrackableLink>
            )}

            {portfolioData.personalInfo.email && (
              <TrackableLink
                href={`mailto:${portfolioData.personalInfo.email}`}
                resumeId={resumeId || ""}
                interactionType="email_click"
                sectionName="header"
                disableTracking={disableTracking}
                className={`${themeClasses.accent} hover:text-primary transition-colors`}
              >
                <Mail className="w-6 h-6" />
              </TrackableLink>
            )}
          </header>
        </SectionViewTracker>

        {/* Hero Section */}
        <section className="flex flex-col-reverse md:flex-row justify-between items-center gap-8 md:gap-10 mb-16 md:mb-24">
          <div className="max-w-2xl">
            <h1
              className={`text-3xl md:text-5xl font-bold mb-6 ${themeClasses.text}`}
            >
              Hi, I&apos;m {portfolioData.personalInfo.firstName}
              <span className="inline-block ml-2 text-4xl">👋</span>
            </h1>
            <p className={`text-lg md:text-xl ${themeClasses.accent} mb-6`}>
              {portfolioData.personalInfo.title}
            </p>
            <div className={`${themeClasses.accent} mb-8`}>
              <p>{portfolioData.personalInfo.about}</p>
              <p className="mt-4">
                I&apos;m actively working on{" "}
                <span className="text-green-500">open-source projects</span>.
              </p>
            </div>

            <div
              className={`flex flex-wrap items-center text-sm ${themeClasses.accent} gap-6 mt-8`}
            >
              <p className="flex items-center">
                <span className="inline-flex justify-center items-center w-6 h-6 rounded-full bg-blue-900/30 mr-2">
                  <Code className="w-3 h-3" />
                </span>
                Let&apos;s collaborate ❤️
              </p>
            </div>
          </div>

          {portfolioData.personalInfo.photo && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-bl from-blue-600 to-purple-700 rounded-full blur-lg opacity-20 transform scale-110"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portfolioData.personalInfo.photo || "/placeholder.svg"}
                alt={`${portfolioData.personalInfo.firstName} ${portfolioData.personalInfo.lastName}`}
                className={`w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-full border-2 ${themeClasses.border} shadow-2xl relative z-10`}
              />
            </div>
          )}
        </section>

        {/* Skills Section */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="skills" disableTracking={disableTracking}>
          <section className="mb-24" data-section="skills">
            <h2 className={`text-2xl font-bold mb-8 ${themeClasses.text}`}>
              Skills
            </h2>

            <div className="flex flex-wrap gap-3">
              {portfolioData.skills.map((skill) => (
                <Badge
                  key={skill}
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    theme === "white"
                      ? "text-gray-600"
                      : `${themeClasses.text}`
                  } ${themeClasses.border}`}
                  style={{
                    ...(theme === "white" && {
                      background: "rgba(255, 255, 255, 0.3)",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
                    })
                  }}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        </SectionViewTracker>

        {/* Work Experience Section */}
        {portfolioData.experience && portfolioData.experience.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="experience" disableTracking={disableTracking}>
            <section className="mb-24" data-section="experience">
              <h2 className={`text-2xl font-bold mb-8 ${themeClasses.text}`}>
                Work Experience
              </h2>

              <div className="space-y-8">
                {portfolioData.experience.map((exp) => (
                  <div key={exp.id} className="flex">
                    <div className="mr-4 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center">
                        <Code className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${themeClasses.text} hover:text-blue-400 transition-colors`}>
                        {exp.position}
                      </h3>
                      <p className="text-gray-300 mb-1">
                        {exp.company}{exp.location && <span className="text-sm font-normal">, {exp.location}</span>}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDateToDisplay(exp.startDate)} -{" "}
                        {exp.isPresent ? "Present" : formatDateToDisplay(exp.endDate || '')}
                      </p>
                      {exp.description && (
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </SectionViewTracker>
        )}

        {/* Featured Projects Section */}
        {portfolioData.projects && portfolioData.projects.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="projects" disableTracking={disableTracking}>
            <section className="mb-24" data-section="projects">
              <h2 className={`text-2xl font-bold mb-8 ${themeClasses.text}`}>Featured Projects</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(showAllProjects ? portfolioData.projects : portfolioData.projects.slice(0, 3)).map((project) => (
                  <div
                    key={project.id}
                    className={`group relative ${themeClasses.cardBg} border ${themeClasses.cardBorder} rounded-lg overflow-hidden transition-all ${
                      theme === "white" 
                        ? "hover:border-blue-200 shadow-sm hover:shadow-md" 
                        : "hover:border-blue-500/50"
                    }`}
                    style={{
                      ...(theme === "white" && {
                        background: "rgba(255, 255, 255, 0.25)",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                      })
                    }}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-bold text-xl ${themeClasses.text}`}>{project.name}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-5">
                        {project.techStack.map((tech) => (
                          <Badge
                            key={tech}
                            className={`text-xs transition-colors ${
                              theme === "white"
                                ? "text-gray-600 border-gray-100"
                                : "bg-gray-800 text-gray-300 border-gray-700"
                            }`}
                            style={{
                              ...(theme === "white" && {
                                background: "rgba(255, 255, 255, 0.4)",
                                backdropFilter: "blur(4px)",
                                border: "1px solid rgba(0, 0, 0, 0.06)",
                              })
                            }}
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-start space-x-4">
                        {project.demoUrl && (
                          <TrackableLink
                            href={project.demoUrl}
                            resumeId={resumeId || ""}
                            interactionType="project_demo_click"
                            sectionName="projects"
                            target="_blank"
                            rel="noopener noreferrer"
                            disableTracking={disableTracking}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs px-2 py-1 h-auto"
                            >
                              Website
                            </Button>
                          </TrackableLink>
                        )}

                        {project.sourceUrl && (
                          <TrackableLink
                            href={project.sourceUrl}
                            resumeId={resumeId || ""}
                            interactionType="project_link_click"
                            sectionName="projects"
                            target="_blank"
                            rel="noopener noreferrer"
                            disableTracking={disableTracking}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs px-2 py-1 h-auto"
                            >
                              Source
                            </Button>
                          </TrackableLink>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {portfolioData.projects.length > 3 && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800 bg-transparent"
                    onClick={() => setShowAllProjects(!showAllProjects)}
                  >
                    {showAllProjects ? (
                      <>
                        VIEW LESS <ChevronUp className="ml-2 w-4 h-4" />
                      </>
                    ) : (
                      <>
                        VIEW ALL PROJECTS <ChevronDown className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </section>
          </SectionViewTracker>
        )}

        {/* Certifications Section */}
        {portfolioData.certifications && portfolioData.certifications.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="certifications" disableTracking={disableTracking}>
            <section className="mb-24" data-section="certifications">
              <h2 className={`text-2xl font-bold mb-8 ${themeClasses.text}`}>Certifications</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {portfolioData.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className={`p-5 rounded-lg border transition-all ${
                      theme === "white"
                        ? "border-gray-200 hover:border-blue-200"
                        : "bg-gray-900/50 border-gray-800 hover:border-blue-500/50"
                    }`}
                    style={{
                      ...(theme === "white" && {
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(5px)",
                        boxShadow: "0 1px 6px rgba(0, 0, 0, 0.04)",
                      })
                    }}
                  >
                    <h3 className={`font-bold text-lg mb-1 ${themeClasses.text}`}>{cert.title}</h3>
                    <p className={`text-sm mb-2 ${theme === "white" ? "text-gray-600" : "text-gray-400"}`}>
                      {cert.issuer}
                    </p>
                    {cert.date && (
                      <p className={`text-sm ${theme === "white" ? "text-gray-500" : "text-gray-500"}`}>
                        {formatDateToDisplay(cert.date)}
                      </p>
                    )}
                    {cert.url && (
                      <TrackableLink
                        href={cert.url}
                        resumeId={resumeId || ""}
                        interactionType="certification_link_click"
                        sectionName="certifications"
                        target="_blank"
                        rel="noopener noreferrer"
                        disableTracking={disableTracking}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-block mt-2"
                      >
                        View Certificate
                      </TrackableLink>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </SectionViewTracker>
        )}


        {/* Languages Section */}
        {portfolioData.languages && portfolioData.languages.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="languages" disableTracking={disableTracking}>
            <section className="mb-24" data-section="languages">
              <h2 className={`text-2xl font-bold mb-8 ${themeClasses.text}`}>Languages</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {portfolioData.languages.map((lang) => (
                  <div
                    key={lang.id}
                    className={`p-4 rounded-lg border ${
                      theme === "white"
                        ? "border-gray-200"
                        : "bg-gray-900/50 border-gray-800"
                    }`}
                    style={{
                      ...(theme === "white" && {
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(5px)",
                      })
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{lang.name}</span>
                      <Badge
                        className={`${
                          theme === "white"
                            ? "text-gray-600 border-gray-200"
                            : "bg-gray-800 text-gray-300 border-gray-700"
                        }`}
                        style={{
                          ...(theme === "white" && {
                            background: "rgba(255, 255, 255, 0.4)",
                            backdropFilter: "blur(4px)",
                          })
                        }}
                      >
                        {lang.proficiency}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </SectionViewTracker>
        )}

        {/* Custom Sections */}
        {portfolioData.customSections && portfolioData.customSections.length > 0 && (
          <>
            {portfolioData.customSections.map((section) => (
              <SectionViewTracker 
                key={section.id} 
                resumeId={resumeId || ""} 
                sectionName={`custom_${section.title.toLowerCase().replace(/\s+/g, '_')}`}
                disableTracking={disableTracking}
              >
                <section className="mb-24">
                  <h2 className={`text-2xl font-bold mb-8 ${themeClasses.text}`}>{section.title}</h2>
                  <div className="space-y-6">
                    {section.items && section.items.length > 0 ? section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-lg border ${
                        theme === "white"
                          ? "border-gray-200"
                          : "bg-gray-900/50 border-gray-800"
                      }`}
                      style={{
                        ...(theme === "white" && {
                          background: "rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(5px)",
                        })
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg ${themeClasses.text}`}>{item.title}</h3>
                          {item.subtitle && (
                            <p className={`text-sm ${theme === "white" ? "text-gray-600" : "text-gray-400"}`}>
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          {item.date && (
                            <p className={`text-sm ${theme === "white" ? "text-gray-500" : "text-gray-500"}`}>
                              {formatDateToDisplay(item.date)}
                            </p>
                          )}
                          {item.location && (
                            <p className={`text-sm ${theme === "white" ? "text-gray-500" : "text-gray-500"}`}>
                              {item.location}
                            </p>
                          )}
                        </div>
                      </div>
                      {item.description && (
                        <p className={`mb-3 ${theme === "white" ? "text-gray-700" : "text-gray-300"}`}>
                          {item.description}
                        </p>
                      )}
                      {item.details && item.details.length > 0 && (
                        <ul className={`list-disc list-inside space-y-1 ${theme === "white" ? "text-gray-600" : "text-gray-400"}`}>
                          {item.details.map((detail, detailIdx) => (
                            <li key={detailIdx}>{detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )) : (
                    <p className={theme === "white" ? "text-gray-600" : "text-gray-400"}>
                      No items in this section
                    </p>
                  )}
                </div>
              </section>
              </SectionViewTracker>
            ))}
          </>
        )}

        {/* Education Section */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="education" disableTracking={disableTracking}>
          <section className="mb-24" data-section="education">
            <h2 className={`text-2xl font-bold mb-8 ${themeClasses.text}`}>Education</h2>

            <div className="space-y-8">
              {portfolioData.education.map((edu) => (
                <div key={edu.id} className="flex">
                  <div className="mr-4 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${themeClasses.text} hover:text-blue-400 transition-colors flex items-center`}>
                      {edu.institution}{edu.location && <span className="text-base font-normal">, {edu.location}</span>}
                      {edu.institution.includes("Trident") && (
                        <Badge 
                          className={`ml-2 ${
                            theme === "white" 
                              ? "text-gray-600" 
                              : "bg-gray-800 text-gray-300"
                          }`}
                          style={{
                            ...(theme === "white" && {
                              background: "rgba(255, 255, 255, 0.3)",
                              backdropFilter: "blur(4px)",
                              border: "1px solid rgba(0, 0, 0, 0.06)",
                            })
                          }}
                        >
                          <ChevronRight className="w-3 h-3 mr-1" />
                        </Badge>
                      )}
                    </h3>
                    <p className="text-gray-300 mb-1">{formatDegreeDisplay(edu.degree, edu.field)}</p>
                    <p className="text-sm text-gray-500 mb-1">
                      {formatDateToDisplay(edu.startYear)} - {formatDateToDisplay(edu.endYear)}
                    </p>
                    {edu.cgpa && (
                      <p className="text-sm text-gray-400 font-medium">
                        {formatGradeDisplay(edu.cgpa)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </SectionViewTracker>

        {/* Recent Blog Posts */}
        {portfolioData.blogs && portfolioData.blogs.length > 0 && (
          <section className="mb-24">
            <h2 className={`text-2xl font-bold mb-8 ${themeClasses.text}`}>Recent Blog Posts</h2>

            <div className="space-y-6">
              {portfolioData.blogs.map((blog) => (
                <div
                  key={blog.id}
                  className={`p-5 rounded-lg transition-all ${
                    theme === "white"
                      ? "border hover:border-blue-200"
                      : "bg-gray-900/50 border border-gray-800 hover:border-blue-500/50"
                  }`}
                  style={{
                    ...(theme === "white" && {
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(5px)",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                      boxShadow: "0 1px 6px rgba(0, 0, 0, 0.04)",
                    })
                  }}
                >
                  <h3 className="font-bold text-lg mb-2">{blog.title}</h3>
                  <p className={`mb-4 ${theme === "white" ? "text-gray-600" : "text-gray-400"}`}>
                    {blog.summary}
                  </p>
                  <div className={`text-sm ${theme === "white" ? "text-gray-500" : "text-gray-500"}`}>
                    {new Date(blog.publishDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 bg-transparent"
              >
                Read More Blogs
              </Button>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="contact" disableTracking={disableTracking}>
          <section className="mb-16" data-section="contact">
            <h2 className={`text-2xl font-bold mb-6 ${themeClasses.text}`}>Contact</h2>
            <p className="text-gray-300 mb-6">
              Always open to discussing new projects, creative ideas, or
              opportunities to be part of your visions. Feel free to reach out!
            </p>

            {portfolioData.personalInfo.email && (
              <TrackableLink
                href={`mailto:${portfolioData.personalInfo.email}`}
                resumeId={resumeId || ""}
                interactionType="email_click"
                sectionName="contact"
                disableTracking={disableTracking}
                className="inline-block"
              >
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Connect via Email
                </Button>
              </TrackableLink>
            )}

            {portfolioData.personalInfo.social.twitter && (
              <TrackableLink
                href={portfolioData.personalInfo.social.twitter}
                resumeId={resumeId || ""}
                interactionType="social_link_click"
                sectionName="contact"
                target="_blank"
                rel="noopener noreferrer"
                disableTracking={disableTracking}
                className="ml-4 inline-block"
              >
                <Button
                  variant="outline"
                  className="border-gray-700 hover:bg-gray-800 bg-transparent"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Connect on X
                </Button>
              </TrackableLink>
            )}
          </section>
        </SectionViewTracker>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm border-t border-gray-800 pt-8">
          <div className="mb-4">
            <p>
              &copy; 2025 {portfolioData.personalInfo.firstName}{" "}
              {portfolioData.personalInfo.lastName}. All rights reserved.
            </p>
            <p>
              Open source under MIT License and available on{" "}
              <Link href="#" className="text-blue-400 hover:underline">
                GitHub
              </Link>
            </p>
          </div>

          <div className="flex justify-center space-x-6 text-gray-600">
            <Link href="#">Sitemap</Link>
            <Link href="#">RSS</Link>
          </div>
        </footer>
      </div>
    </div>
    </div>
  );
}
