"use client";

import React, { useState } from "react";
import type {
  PortfolioData,
  PortfolioTemplateProps,
} from "@/types/PortfolioTypes";
import { ExternalLink, Github, Linkedin, Mail, Twitter, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// tracking disabled in templates (analytics handled elsewhere)
import { TrackableLink, SectionViewTracker } from "@/components/analytics";
import { formatDescription } from "@/utils/formatDescription";
import { formatDateToDisplay } from "@/utils/date-utils";
import { formatGradeDisplay, formatDegreeDisplay } from "@/utils/grade-utils";

interface CleanMonoTemplateProps extends PortfolioTemplateProps {
  theme?: string;
  resumeId?: string;
}

export function CleanMonoTemplate({
  data,
  theme = "black",
  resumeId,
  preview = false, // Default to false for public viewing
}: CleanMonoTemplateProps) {
  const [showAllProjects, setShowAllProjects] = useState(false);
  
  // Disable analytics tracking when in preview/creation mode
  const disableTracking = preview || !resumeId;
  
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
      default: // light theme fallback
        return {
          bg: "bg-gray-50",
          text: "text-gray-900",
          accent: "text-blue-600",
          border: "border-gray-300",
          cardBg: "bg-white",
          cardBorder: "border-gray-300",
          sectionBorder: "border-gray-300",
          buttonHover: "hover:bg-blue-600",
          badgeHover: "hover:bg-blue-600",
        };
    }
  };

  const themeClasses = getThemeClasses();

  // click tracking disabled across template

  return (
    <div className={`template-sandbox ${preview ? 'preview-sandbox' : ''} theme-${theme}`}>
      <div className={`min-h-screen ${themeClasses.bg} font-mono`}>
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="header" disableTracking={disableTracking}>
          <header className="mb-16" data-section="header">
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                {portfolioData.personalInfo.photo && (
                  <div className="mb-4 sm:mb-0 sm:mr-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        portfolioData.personalInfo.photo || "/placeholder.svg"
                      }
                      alt={`${portfolioData.personalInfo.firstName} ${portfolioData.personalInfo.lastName}`}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 ${themeClasses.border} shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200`}
                      // click disabled
                      data-trackable="profile-photo"
                    />
                  </div>
                )}
                <div>
                  <h1
                    className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 cursor-pointer ${themeClasses.text} hover:text-blue-600 transition-colors duration-200`}
                    onClick={() => {}}
                    data-trackable="name"
                  >
                    {portfolioData.personalInfo.firstName}{" "}
                    {portfolioData.personalInfo.lastName}
                  </h1>
                  <p
                    className={`text-lg sm:text-xl font-medium cursor-pointer ${themeClasses.text} hover:text-blue-700 transition-colors duration-200`}
                    onClick={() => {}}
                    data-trackable="title"
                  >
                    {portfolioData.personalInfo.title}
                  </p>
                  {portfolioData.personalInfo.location && (
                    <p
                      className={`text-sm ${themeClasses.accent} mt-1 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                      onClick={() => {}}
                      data-trackable="location"
                    >
                      {portfolioData.personalInfo.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-end">
                {portfolioData.personalInfo.social.github && (
                  <TrackableLink
                    href={portfolioData.personalInfo.social.github}
                    resumeId={resumeId || ""}
                    interactionType="social_link_click"
                    sectionName="header"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                    disableTracking={disableTracking}
                  >
                    <Button
                      variant="outline"
                      size="default"
                      className={`rounded-lg border-2 ${themeClasses.buttonHover} hover:text-white transition-all duration-200 bg-transparent ${themeClasses.border} ${themeClasses.text} hover:scale-105`}
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
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
                    className="inline-block"
                    disableTracking={disableTracking}
                  >
                    <Button
                      variant="outline"
                      size="default"
                      className="rounded-lg border-2 hover:bg-blue-500 hover:text-white transition-all duration-200 bg-transparent border-blue-500 text-blue-500 hover:scale-105"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                  </TrackableLink>
                )}

                {portfolioData.personalInfo.email && (
                  <TrackableLink
                    href={`mailto:${portfolioData.personalInfo.email}`}
                    resumeId={resumeId || ""}
                    interactionType="contact_link_click"
                    sectionName="header"
                    className="inline-block"
                    disableTracking={disableTracking}
                  >
                    <Button
                      variant="outline"
                      size="default"
                      className="rounded-lg border-2 hover:bg-red-500 hover:text-white transition-all duration-200 bg-transparent border-red-500 text-red-500 hover:scale-105"
                      // click disabled
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  </TrackableLink>
                )}
              </div>
            </div>

            {portfolioData.personalInfo.about && (
              <div
                className={`mt-8 p-6 ${themeClasses.cardBg} rounded-xl shadow-sm border ${themeClasses.cardBorder} hover:shadow-md transition-all duration-200 cursor-pointer`}
                data-trackable="about-section"
              >
                <p className={`leading-relaxed text-base ${themeClasses.text}`}>
                  {portfolioData.personalInfo.about}
                </p>
              </div>
            )}
          </header>
        </SectionViewTracker>

        {/* Work Experience Section */}
        {portfolioData.experience && portfolioData.experience.length > 0 && (
          <SectionViewTracker
            resumeId={resumeId || ""}
            sectionName="experience"
            disableTracking={disableTracking}
          >
            <section className="mb-16" data-section="experience">
              <h2
                className={`text-2xl font-bold mb-8 ${themeClasses.text} border-b-2 ${themeClasses.sectionBorder} pb-3 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
              >
                Work Experience
              </h2>

              <div className="space-y-8">
                {portfolioData.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className={`${themeClasses.cardBg} p-6 rounded-xl shadow-sm border ${themeClasses.cardBorder} hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]`}
                    data-trackable="experience-item"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 transition-transform duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          data-trackable="company-logo"
                        >
                          <span className="text-white font-bold text-lg">
                            {exp.company.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-lg ${themeClasses.text} mb-1 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          data-trackable="position-title"
                        >
                          {exp.position}
                        </h3>
                        <p
                          className={`text-base ${themeClasses.accent} font-medium mb-1 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          data-trackable="company-name"
                        >
                          {exp.company}{exp.location && <span className="text-sm font-normal">, {exp.location}</span>}
                        </p>
                        <p
                          className={`text-sm ${themeClasses.accent} mb-3 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          data-trackable="date-range"
                        >
                          {formatDateToDisplay(exp.startDate)} -{" "}
                          {exp.isPresent ? "Present" : formatDateToDisplay(exp.endDate || '')}
                        </p>
                        {exp.description && (
                          <div
                            className={`${themeClasses.text} cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            data-trackable="job-description"
                          >
                            {formatDescription(exp.description)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </SectionViewTracker>
        )}

        {/* Education Section */}
        {portfolioData.education && portfolioData.education.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="education" disableTracking={disableTracking}>
            <section className="mb-16" data-section="education">
              <h2
                className={`text-2xl font-bold mb-8 ${themeClasses.text} border-b-2 ${themeClasses.sectionBorder} pb-3 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
              >
                Education
              </h2>

              <div className="space-y-6">
                {portfolioData.education.map((edu) => (
                  <div
                    key={edu.id}
                    className={`${themeClasses.cardBg} p-6 rounded-xl shadow-sm border ${themeClasses.cardBorder} hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]`}
                    data-trackable="education-item"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 transition-transform duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          data-trackable="institution-logo"
                        >
                          <span className="text-white font-bold text-lg">
                            {edu.institution.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-lg ${themeClasses.text} mb-1 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          data-trackable="institution-name"
                        >
                          {edu.institution}{edu.location && <span className="text-base font-normal">, {edu.location}</span>}
                        </h3>
                        <p
                          className={`text-base ${themeClasses.accent} font-medium mb-1 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          data-trackable="degree-title"
                        >
                          {formatDegreeDisplay(edu.degree, edu.field)}
                        </p>
                        <p
                          className={`text-sm ${themeClasses.accent} mb-2 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          data-trackable="education-dates"
                        >
                          {formatDateToDisplay(edu.startYear)} - {formatDateToDisplay(edu.endYear)}
                        </p>
                        {edu.cgpa && (
                          <p
                            className={`text-sm ${themeClasses.text} font-medium cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            data-trackable="cgpa"
                          >
                            {formatGradeDisplay(edu.cgpa)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </SectionViewTracker>
        )}

        {/* Skills Section */}
        {portfolioData.skills && portfolioData.skills.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="skills" disableTracking={disableTracking}>
            <section className="mb-16" data-section="skills">
              <h2
                className={`text-2xl font-bold mb-8 ${themeClasses.text} border-b-2 ${themeClasses.sectionBorder} pb-3 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
              >
                Skills & Technologies
              </h2>

              <div
                className={`${themeClasses.cardBg} p-6 rounded-xl shadow-sm border ${themeClasses.cardBorder} hover:shadow-md transition-all duration-200`}
              >
                <div className="flex flex-wrap gap-3">
                  {portfolioData.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className={`text-sm px-4 py-2 ${themeClasses.cardBg} ${themeClasses.badgeHover} hover:text-white transition-all duration-200 border-2 font-medium ${themeClasses.border} ${themeClasses.text} cursor-pointer hover:scale-105`}
                      // click disabled
                      data-trackable="skill-badge"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </section>
          </SectionViewTracker>
        )}

        {/* Projects Section */}
        {portfolioData.projects && portfolioData.projects.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="projects" disableTracking={disableTracking}>
            <section className="mb-16" data-section="projects">
              <h2
                className={`text-2xl font-bold mb-4 ${themeClasses.text} border-b-2 ${themeClasses.sectionBorder} pb-3 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
              >
                Featured Projects
              </h2>
              <p
                className={`${themeClasses.accent} mb-8 text-base leading-relaxed cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                onClick={() => {}}
                data-trackable="projects-description"
              >
                I&apos;ve worked on a variety of projects, from simple websites to
                complex web applications. Here are a few of my favorites.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(showAllProjects ? portfolioData.projects : portfolioData.projects.slice(0, 3)).map((project) => (
                  <div
                    key={project.id}
                    className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
                    data-trackable="project-card"
                  >
                    <div className="p-6">
                      <h3
                        className={`font-bold text-xl mb-3 ${themeClasses.text} cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        data-trackable="project-title"
                      >
                        {project.name}
                      </h3>
                      <p
                        className={`${themeClasses.text} mb-4 leading-relaxed cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        data-trackable="project-description"
                      >
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.techStack.map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className={`text-xs px-3 py-1 ${themeClasses.cardBg} ${themeClasses.text} font-medium border ${themeClasses.border} cursor-pointer hover:scale-105 transition-transform duration-200`}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            data-trackable="tech-badge"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {project.sourceUrl && project.sourceUrl !== "#" && (
                          <TrackableLink
                            href={project.sourceUrl}
                            resumeId={resumeId || ""}
                            interactionType="project_link_click"
                            sectionName="projects"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                            disableTracking={disableTracking}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className={`border-2 ${themeClasses.buttonHover} hover:text-white transition-all duration-200 bg-transparent ${themeClasses.border} ${themeClasses.text} hover:scale-105`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Github className="w-4 h-4 mr-2" /> Source Code
                            </Button>
                          </TrackableLink>
                        )}
                        {project.demoUrl && project.demoUrl !== "#" && (
                          <TrackableLink
                            href={project.demoUrl}
                            resumeId={resumeId || ""}
                            interactionType="project_demo_click"
                            sectionName="projects"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                            disableTracking={disableTracking}
                          >
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" /> Live
                              Demo
                            </Button>
                          </TrackableLink>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {portfolioData.projects.length > 3 && (
                <div className="text-center mt-8">
                  <Button
                    variant="default"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAllProjects(!showAllProjects);
                      // tracking disabled
                    }}
                    className={`${themeClasses.cardBg} ${themeClasses.buttonHover} ${themeClasses.text} px-8 py-3 text-base transition-all duration-200 border ${themeClasses.border} rounded-lg hover:scale-105`}
                    data-trackable="button"
                  >
                    {showAllProjects ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2 inline" />
                        View Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2 inline" />
                        View All Projects
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
            <section className="mb-16" data-section="certifications">
              <h2
                className={`text-2xl font-bold mb-8 ${themeClasses.text} border-b-2 ${themeClasses.sectionBorder} pb-3`}
              >
                Certifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioData.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} rounded-xl p-6 hover:shadow-md transition-all duration-200`}
                  >
                    <h3 className={`font-bold text-lg mb-2 ${themeClasses.text}`}>
                      {cert.title}
                    </h3>
                    <p className={`${themeClasses.accent} mb-2`}>
                      {cert.issuer}
                    </p>
                    {cert.date && (
                      <p className={`text-sm ${themeClasses.accent} mb-3`}>
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
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        disableTracking={disableTracking}
                      >
                        View Certificate →
                      </TrackableLink>
                    )}
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
              <SectionViewTracker key={section.id} resumeId={resumeId || ""} sectionName={`custom_${section.title}`} disableTracking={disableTracking}>
                <section className="mb-16" data-section={`custom-${section.id}`}>
                  <h2
                    className={`text-2xl font-bold mb-8 ${themeClasses.text} border-b-2 ${themeClasses.sectionBorder} pb-3`}
                  >
                    {section.title}
                  </h2>
                  <div className="space-y-6">
                    {section.items && section.items.length > 0 ? section.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} rounded-xl p-6`}
                      >
                        {item.title && (
                          <h3 className={`font-bold text-lg mb-2 ${themeClasses.text}`}>
                            {item.title}
                          </h3>
                        )}
                        {item.subtitle && (
                          <p className={`${themeClasses.accent} mb-2`}>
                            {item.subtitle}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm mb-3">
                          {item.date && (
                            <span className={`${themeClasses.accent}`}>
                              {formatDateToDisplay(item.date)}
                            </span>
                          )}
                          {item.location && (
                            <span className={`${themeClasses.accent}`}>
                              {item.location}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className={`${themeClasses.text} mb-3 leading-relaxed`}>
                            {item.description}
                          </p>
                        )}
                        {item.details && item.details.length > 0 && (
                          <ul className="list-disc list-inside space-y-1">
                            {item.details.map((detail, dIdx) => (
                              <li key={dIdx} className={`${themeClasses.text} text-sm`}>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )) : <p className={`${themeClasses.text}`}>No items in this section</p>}
                  </div>
                </section>
              </SectionViewTracker>
            ))}
          </>
        )}

        {/* Blogs Section */}
        {portfolioData.blogs && portfolioData.blogs.length > 0 && (
          <section className="mb-16">
            <h2
              className={`text-2xl font-bold mb-8 ${themeClasses.text} border-b-2 ${themeClasses.sectionBorder} pb-3`}
            >
              Latest Blog Posts
            </h2>

            <div className="space-y-6">
              {portfolioData.blogs.map((blog) => (
                <div
                  key={blog.id}
                  className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} rounded-xl p-6 hover:shadow-md transition-all duration-200 ${themeClasses.buttonHover}`}
                >
                  <a
                    href={blog.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <h3
                      className={`font-bold text-xl ${themeClasses.text} mb-2 group-hover:text-blue-600 transition-colors duration-200`}
                    >
                      {blog.title}
                    </h3>
                    <p className={`${themeClasses.text} mb-3 leading-relaxed`}>
                      {blog.summary}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`${themeClasses.accent} font-medium`}>
                        {blog.publishDate}
                      </span>
                      <span className="text-blue-600 group-hover:text-blue-700 font-medium">
                        Read more →
                      </span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button
                variant="outline"
                // click disabled
                className={`border-2 ${themeClasses.buttonHover} hover:text-white px-8 py-3 text-base transition-all duration-200 bg-transparent ${themeClasses.border} ${themeClasses.text}`}
              >
                View All Blog Posts
              </Button>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section className="mb-16">
          <h2
            className={`text-2xl font-bold mb-8 ${themeClasses.text} border-b-2 ${themeClasses.sectionBorder} pb-3`}
          >
            Let&apos;s Work Together
          </h2>
          <div
            className={`${themeClasses.cardBg} p-8 rounded-xl shadow-sm border ${themeClasses.cardBorder}`}
          >
            <p className={`${themeClasses.text} mb-6 text-lg leading-relaxed`}>
              {portfolioData.personalInfo.about ||
                "Want to chat? Just shoot me a message with your project details or questions. I'm always excited to discuss new opportunities and collaborations."}
            </p>
            <div className="flex flex-wrap gap-4">
              {portfolioData.personalInfo.email && (
                <a
                  href={`mailto:${portfolioData.personalInfo.email}`}
                  className="inline-block"
                >
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    {portfolioData.personalInfo.email}
                  </Button>
                </a>
              )}
              {portfolioData.personalInfo.phone && (
                <a
                  href={`tel:${portfolioData.personalInfo.phone}`}
                  className="inline-block"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className={`border-2 ${themeClasses.buttonHover} hover:text-white transition-all duration-200 bg-transparent ${themeClasses.border} ${themeClasses.text}`}
                  >
                    📞 {portfolioData.personalInfo.phone}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className={`text-center border-t-2 ${themeClasses.sectionBorder} pt-8`}
        >
          <div className="flex justify-center space-x-6 mb-6">
            {portfolioData.personalInfo.social.github && (
              <a
                href={portfolioData.personalInfo.social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className={`p-2 rounded-lg ${themeClasses.buttonHover} transition-colors duration-200`}
              >
                <Github
                  className={`w-6 h-6 ${themeClasses.accent} hover:text-gray-900 transition-colors`}
                />
              </a>
            )}

            {portfolioData.personalInfo.social.twitter && (
              <a
                href={portfolioData.personalInfo.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className={`p-2 rounded-lg ${themeClasses.buttonHover} transition-colors duration-200`}
              >
                <Twitter
                  className={`w-6 h-6 ${themeClasses.accent} hover:text-blue-500 transition-colors`}
                />
              </a>
            )}

            {portfolioData.personalInfo.social.linkedin && (
              <a
                href={portfolioData.personalInfo.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className={`p-2 rounded-lg ${themeClasses.buttonHover} transition-colors duration-200`}
              >
                <Linkedin
                  className={`w-6 h-6 ${themeClasses.accent} hover:text-blue-600 transition-colors`}
                />
              </a>
            )}

            {portfolioData.personalInfo.email && (
              <a
                href={`mailto:${portfolioData.personalInfo.email}`}
                aria-label="Email"
                className={`p-2 rounded-lg ${themeClasses.buttonHover} transition-colors duration-200`}
              >
                <Mail
                  className={`w-6 h-6 ${themeClasses.accent} hover:text-red-500 transition-colors`}
                />
              </a>
            )}
          </div>
          <p className={`${themeClasses.accent} text-base`}>
            © {new Date().getFullYear()} {portfolioData.personalInfo.firstName}{" "}
            {portfolioData.personalInfo.lastName}. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
    </div>
  );
}
