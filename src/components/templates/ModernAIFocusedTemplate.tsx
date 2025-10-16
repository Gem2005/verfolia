"use client";
import { useState } from "react";
import type {
  PortfolioData,
  PortfolioTemplateProps,
} from "@/types/PortfolioTypes";
import { Github, Linkedin, Mail, Twitter, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateToDisplay } from "@/utils/date-utils";
import { formatGradeDisplay, formatDegreeDisplay } from "@/utils/grade-utils";
import { TrackableLink, SectionViewTracker } from "@/components/analytics";

interface ModernAIFocusedTemplateProps extends PortfolioTemplateProps {
  theme?: string;
  resumeId?: string;
}

export function ModernAIFocusedTemplate({
  data,
  theme = "black",
  resumeId,
  preview = false,
}: ModernAIFocusedTemplateProps) {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const disableTracking = preview || !resumeId;
  
  // Use provided data or fallback to mock data only if no data is provided
  const portfolioData: PortfolioData =
    data && data.personalInfo && data.personalInfo.firstName
      ? data
      : {
          personalInfo: {
            firstName: "John",
            lastName: "Doe",
            title: "Full Stack Developer (AI-leaning)",
            email: "john.doe@example.com",
            phone: "+1 (555) 123-4567",
            location: "San Francisco, CA",
            about:
              "Experienced developer building intelligent, scalable solutions across web and cloud.",
            photo:
              "https://api.dicebear.com/7.x/adventurer/svg?seed=John%20Doe",
            social: {
              github: "",
              linkedin: "",
              twitter: "",
              portfolio: "",
            },
          },
          experience: [
            {
              id: "exp1",
              position: "Full Stack Developer | Team Lead",
              company: "HealthCode Services - IT Technology",
              startDate: "Feb 2023",
              isPresent: true,
              description:
                "Leading development of AI-driven healthcare solutions.",
            },
            {
              id: "exp2",
              position: "Assistant Systems Engineer",
              company: "Tata Consultancy Services",
              startDate: "Feb 2021",
              endDate: "Nov 2022",
              description: "Developed healthcare data integration systems.",
            },
            {
              id: "exp3",
              position: "Trainee",
              company: "Tata Consultancy Services",
              startDate: "Feb 2020",
              endDate: "Feb 2021",
              description:
                "Trained in full stack development and healthcare IT.",
            },
          ],
          skills: [
            "React",
            "Next.js",
            "Node.js",
            "MongoDB",
            "Python",
            "TypeScript",
            "PostgreSQL",
            "AWS",
            "Azure",
          ],
          education: [
            {
              id: "edu1",
              institution: "Trivandhan Bhulania College",
              degree: "Bachelor of Computer Science",
              field: "Computer Science",
              startYear: "2016",
              endYear: "2019",
              cgpa: "8.5",
            },
            {
              id: "edu2",
              institution: "Orissa High School",
              degree: "Higher Secondary (XI-XII-CS - Science)",
              field: "Science",
              startYear: "2014",
              endYear: "2016",
              cgpa: "85%",
            },
            {
              id: "edu3",
              institution: "Dakshinkhanda High School",
              degree: "Secondary (X.R.B.S.E)",
              field: "General",
              startYear: "2012",
              endYear: "2014",
              cgpa: "82%",
            },
          ],
          projects: [],
          blogs: [
            {
              id: "blog1",
              title: "Building AI-Powered Applications with React",
              summary:
                "A comprehensive guide to integrating AI capabilities into modern React applications.",
              publishDate: "2024-01-15",
              url: "https://johndoe.dev/blog/ai-powered-react-apps",
            },
            {
              id: "blog2",
              title: "The Future of Healthcare Technology",
              summary:
                "Exploring how AI and machine learning are transforming healthcare delivery.",
              publishDate: "2023-12-10",
              url: "https://johndoe.dev/blog/healthcare-tech-future",
            },
          ],
          certifications: [
            {
              id: "cert1",
              title: "AWS Certified Solutions Architect",
              issuer: "Amazon Web Services",
              date: "2023-08-15",
              url: "https://aws.amazon.com/certification/",
            },
            {
              id: "cert2",
              title: "Google Cloud Professional Developer",
              issuer: "Google Cloud",
              date: "2023-06-20",
              url: "https://cloud.google.com/certification/",
            },
          ],
          interests: [
            "AI/ML",
            "Healthcare Technology",
            "Open Source",
            "Photography",
            "Hiking",
          ],
        };

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
          text: "text-black",
          accent: "text-blue-700",
          border: "border-gray-400",
          cardBg: "bg-gray-100",
          cardBorder: "border-gray-400",
          sectionBorder: "border-gray-400",
          buttonHover: "hover:bg-blue-700",
          badgeHover: "hover:bg-blue-700",
        };
      default: // modern AI light theme
        return {
          bg: "bg-white",
          text: "text-gray-900",
          accent: "text-blue-600",
          border: "border-gray-300",
          cardBg: "bg-gray-50",
          cardBorder: "border-gray-300",
          sectionBorder: "border-gray-300",
          buttonHover: "hover:bg-blue-600",
          badgeHover: "hover:bg-blue-600",
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={`theme-${theme}`}>
      <div
        className={`min-h-screen ${themeClasses.bg} font-sans`}
      >
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12 max-w-5xl">
        {/* Header Section */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="header" disableTracking={disableTracking}>
          <header className="text-center mb-16" data-section="header">
            <h1
              className={`text-4xl sm:text-5xl font-bold mb-4 ${themeClasses.text}`}
            >
              {portfolioData.personalInfo.firstName}{" "}
              {portfolioData.personalInfo.lastName}
            </h1>
            <h2 className={`text-xl sm:text-2xl ${themeClasses.accent} mb-6`}>
              {portfolioData.personalInfo.title}
            </h2>

            {/* Contact Info */}
            <div
              className={`flex flex-wrap justify-center gap-6 text-sm ${themeClasses.accent} mb-8`}
            >
              {portfolioData.personalInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{portfolioData.personalInfo.email}</span>
                </div>
              )}
              {portfolioData.personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>{portfolioData.personalInfo.phone}</span>
                </div>
              )}
              {portfolioData.personalInfo.location && (
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{portfolioData.personalInfo.location}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-4">
              {portfolioData.personalInfo.social.github && (
                <TrackableLink
                  href={portfolioData.personalInfo.social.github}
                  resumeId={resumeId || ""}
                  interactionType="social_link_click"
                  sectionName="header"
                  target="_blank"
                  rel="noopener noreferrer"
                  disableTracking={disableTracking}
                  className={`${themeClasses.accent} hover:text-blue-600 transition-colors`}
                >
                  <Github className="w-5 h-5" />
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
                  className={`${themeClasses.accent} hover:text-blue-600 transition-colors`}
                >
                  <Linkedin className="w-5 h-5" />
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
                  className={`${themeClasses.accent} hover:text-blue-600 transition-colors`}
                >
                  <Twitter className="w-5 h-5" />
                </TrackableLink>
              )}
            </div>
          </header>
        </SectionViewTracker>

        {/* Professional Summary */}
        {portfolioData.personalInfo.about && (
          <section className="mb-16">
            <h2 className={`text-2xl font-bold mb-6 ${themeClasses.text}`}>
              Professional Summary
            </h2>
            <div
              className={`${themeClasses.cardBg} p-6 rounded-lg border ${themeClasses.cardBorder}`}
            >
              <p className={`${themeClasses.text} leading-relaxed`}>
                {portfolioData.personalInfo.about}
              </p>
            </div>
          </section>
        )}

        {/* Work Experience Section */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="experience" disableTracking={disableTracking}>
          <section className="mb-16" data-section="experience">
            <h2 className={`text-2xl font-bold mb-6 ${themeClasses.text}`}>
              Work Experience
            </h2>

            <div className="space-y-6">
              {portfolioData.experience.map((exp) => (
                <div
                  key={exp.id}
                  className={`${themeClasses.cardBg} p-6 rounded-lg border ${themeClasses.cardBorder} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {exp.company.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg ${themeClasses.text} mb-1`}
                      >
                        {exp.position}
                      </h3>
                      <p className={`${themeClasses.accent} font-medium mb-2`}>
                        {exp.company}{exp.location && <span className="text-sm font-normal">, {exp.location}</span>}
                      </p>
                      <p className={`text-sm ${themeClasses.accent} mb-3`}>
                        {formatDateToDisplay(exp.startDate)} -{" "}
                        {exp.isPresent ? "Present" : formatDateToDisplay(exp.endDate || '')}
                      </p>
                      {exp.description && (
                        <p className={`${themeClasses.text} leading-relaxed`}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </SectionViewTracker>

        {/* Education Section */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="education" disableTracking={disableTracking}>
          <section className="mb-16" data-section="education">
            <h2 className={`text-2xl font-bold mb-6 ${themeClasses.text}`}>
              Education
            </h2>

            <div className="space-y-6">
              {portfolioData.education.map((edu) => (
                <div
                  key={edu.id}
                  className={`${themeClasses.cardBg} p-6 rounded-lg border ${themeClasses.cardBorder}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {edu.institution.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg ${themeClasses.text} mb-1`}
                      >
                        {edu.institution}{edu.location && <span className="text-base font-normal">, {edu.location}</span>}
                      </h3>
                      <p className={`${themeClasses.accent} font-medium mb-2`}>
                        {formatDegreeDisplay(edu.degree, edu.field)}
                      </p>
                      <p className={`text-sm ${themeClasses.text} mb-2`}>
                        {formatDateToDisplay(edu.startYear)} - {formatDateToDisplay(edu.endYear)}
                      </p>
                      {edu.cgpa && (
                        <p className={`text-sm ${themeClasses.text}`}>
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

        {/* Skills Section */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="skills" disableTracking={disableTracking}>
          <section className="mb-16" data-section="skills">
            <h2 className={`text-2xl font-bold mb-6 ${themeClasses.text}`}>
              Skills & Technologies
            </h2>

            <div
              className={`${themeClasses.cardBg} p-6 rounded-lg border ${themeClasses.cardBorder}`}
            >
              <div className="flex flex-wrap gap-3">
                {portfolioData.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className={`px-4 py-2 text-sm ${themeClasses.cardBg} ${themeClasses.text} ${themeClasses.border} ${themeClasses.badgeHover} hover:text-white transition-colors`}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        </SectionViewTracker>

        {/* Projects Section */}
        {portfolioData.projects && portfolioData.projects.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="projects" disableTracking={disableTracking}>
            <section className="mb-16" data-section="projects">
              <h2 className={`text-2xl font-bold mb-6 ${themeClasses.text}`}>
                Featured Projects
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(showAllProjects ? portfolioData.projects : portfolioData.projects.slice(0, 3)).map((project) => (
                  <div
                    key={project.id}
                    className={`${themeClasses.cardBg} p-6 rounded-lg border ${themeClasses.cardBorder} hover:shadow-lg transition-shadow`}
                  >
                    <h3 className={`font-bold text-xl ${themeClasses.text} mb-3`}>
                      {project.name}
                    </h3>
                    <p className={`${themeClasses.text} mb-4 leading-relaxed`}>
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.techStack.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className={`text-xs px-3 py-1 ${themeClasses.cardBg} ${themeClasses.text} border ${themeClasses.border}`}
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {project.sourceUrl && project.sourceUrl !== "#" && (
                        <TrackableLink
                          href={project.sourceUrl}
                          resumeId={resumeId || ""}
                          interactionType="project_link_click"
                          sectionName="projects"
                          target="_blank"
                          rel="noopener noreferrer"
                          disableTracking={disableTracking}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Source Code →
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
                          disableTracking={disableTracking}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Live Demo →
                        </TrackableLink>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {portfolioData.projects.length > 3 && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={() => setShowAllProjects(!showAllProjects)}
                    variant="outline"
                    className={`${themeClasses.text} ${themeClasses.border} hover:bg-gray-100`}
                  >
                    {showAllProjects ? (
                      <>
                        View Less <ChevronUp className="ml-2 w-4 h-4 inline" />
                      </>
                    ) : (
                      <>
                        View All Projects <ChevronDown className="ml-2 w-4 h-4 inline" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </section>
          </SectionViewTracker>
        )}

        {/* Certifications Section */}
        {portfolioData.certifications &&
          portfolioData.certifications.length > 0 && (
            <SectionViewTracker resumeId={resumeId || ""} sectionName="certifications" disableTracking={disableTracking}>
              <section className="mb-16" data-section="certifications">
                <h2 className={`text-2xl font-bold mb-6 ${themeClasses.text}`}>
                  Certifications
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {portfolioData.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className={`${themeClasses.cardBg} p-6 rounded-lg border ${themeClasses.cardBorder}`}
                    >
                      <h3
                        className={`font-bold text-lg ${themeClasses.text} mb-2`}
                      >
                        {cert.title}
                      </h3>
                      <p className={`${themeClasses.accent} font-medium mb-2`}>
                        {cert.issuer}
                      </p>
                      {cert.date && (
                        <p className={`text-sm ${themeClasses.accent} mb-3`}>
                          Issued: {formatDateToDisplay(cert.date)}
                        </p>
                      )}
                      {cert.url && cert.url !== "#" && (
                        <TrackableLink
                          href={cert.url}
                          resumeId={resumeId || ""}
                          interactionType="certification_link_click"
                          sectionName="certifications"
                          target="_blank"
                          rel="noopener noreferrer"
                          disableTracking={disableTracking}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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

        {/* Languages Section */}
        {portfolioData.languages && portfolioData.languages.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="languages" disableTracking={disableTracking}>
            <section className="mb-16" data-section="languages">
              <h2 className={`text-2xl font-bold mb-6 ${themeClasses.text}`}>
                Languages
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {portfolioData.languages.map((lang) => (
                  <div
                    key={lang.id}
                    className={`${themeClasses.cardBg} p-4 rounded-lg border ${themeClasses.cardBorder}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${themeClasses.text}`}>
                        {lang.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`${themeClasses.cardBg} ${themeClasses.text} border ${themeClasses.border}`}
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
              <section key={section.id} className="mb-16">
                <h2 className={`text-2xl font-bold mb-6 ${themeClasses.text}`}>
                  {section.title}
                </h2>
                <div className="space-y-6">
                  {section.items && section.items.length > 0 ? section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`${themeClasses.cardBg} p-6 rounded-lg border ${themeClasses.cardBorder}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg ${themeClasses.text} mb-1`}>
                            {item.title}
                          </h3>
                          {item.subtitle && (
                            <p className={`${themeClasses.accent} font-medium`}>
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          {item.date && (
                            <p className={`text-sm ${themeClasses.accent}`}>
                              {formatDateToDisplay(item.date)}
                            </p>
                          )}
                          {item.location && (
                            <p className={`text-sm ${themeClasses.accent}`}>
                              {item.location}
                            </p>
                          )}
                        </div>
                      </div>
                      {item.description && (
                        <p className={`${themeClasses.text} mb-3`}>
                          {item.description}
                        </p>
                      )}
                      {item.details && item.details.length > 0 && (
                        <ul className={`list-disc list-inside space-y-1 ${themeClasses.accent}`}>
                          {item.details.map((detail, detailIdx) => (
                            <li key={detailIdx}>{detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )) : (
                    <p className={themeClasses.text}>No items in this section</p>
                  )}
                </div>
              </section>
            ))}
          </>
        )}

        {/* Contact Section */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="contact" disableTracking={disableTracking}>
          <section className="mb-16" data-section="contact">
            <h2
              className={`text-2xl font-bold mb-6 text-center ${themeClasses.text}`}
            >
              Let&apos;s Connect
            </h2>
            <div className="text-center">
              <p className={`${themeClasses.accent} mb-8 max-w-2xl mx-auto`}>
                I&apos;m always open to discussing new opportunities, collaborations,
                or just having a chat about technology and innovation.
              </p>
              {portfolioData.personalInfo.email && (
                <TrackableLink
                  href={`mailto:${portfolioData.personalInfo.email}`}
                  resumeId={resumeId || ""}
                  interactionType="email_click"
                  sectionName="contact"
                  disableTracking={disableTracking}
                >
                  <Button
                    variant="default"
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Get In Touch
                  </Button>
                </TrackableLink>
              )}
            </div>
          </section>
        </SectionViewTracker>

        {/* Footer */}
        <footer
          className={`text-center py-8 border-t ${themeClasses.sectionBorder}`}
        >
          <p className={`${themeClasses.accent} text-sm`}>
            © {new Date().getFullYear()} {portfolioData.personalInfo.firstName}{" "}
            {portfolioData.personalInfo.lastName}. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
    </div>
  );
}
