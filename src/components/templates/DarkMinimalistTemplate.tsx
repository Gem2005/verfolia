"use client";
import { useState } from "react";
import type {
  PortfolioData,
  PortfolioTemplateProps,
} from "@/types/PortfolioTypes";
import { ExternalLink, Github, Linkedin, Mail, Twitter, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrackableLink, SectionViewTracker } from "@/components/analytics";
import { formatDescription } from "@/utils/formatDescription";
import { formatDateToDisplay } from "@/utils/date-utils";
import { formatGradeDisplay } from "@/utils/grade-utils";

interface DarkMinimalistTemplateProps extends PortfolioTemplateProps {
  theme?: string;
  resumeId?: string;
}

export function DarkMinimalistTemplate({
  data,
  theme = "black",
  resumeId,
  preview = false,
}: DarkMinimalistTemplateProps) {
  const [showAllProjects, setShowAllProjects] = useState(false);
  
  // Disable analytics tracking when in preview/creation mode
  const disableTracking = preview || !resumeId;
  
  // Use provided data or fallback to mock data only if no data is provided
  const portfolioData: PortfolioData =
    data && data.personalInfo && data.personalInfo.firstName
      ? data
      : {
          personalInfo: {
            firstName: "Alex",
            lastName: "Chen",
            title: "Senior Full Stack Developer & Blockchain Engineer",
            email: "alex.chen@example.com",
            phone: "+1 (555) 123-4567", // Added missing required field
            location: "San Francisco, CA", // Added missing required field
            about:
              "Passionate developer focused on building scalable web applications and decentralized solutions. I specialize in modern JavaScript frameworks, blockchain technology, and creating seamless user experiences.",
            photo:
              "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex%20Chen",
            social: {
              github: "",
              twitter: "",
              linkedin: "",
              portfolio: "",
            },
          },
          experience: [
            {
              id: "exp1",
              position: "Senior Full Stack Developer",
              company: "TechFlow Solutions",
              startDate: "Jan 2024",
              isPresent: true,
              description:
                "Leading development of enterprise-grade financial applications using React, Node.js, and blockchain technologies. Architected microservices handling $10M+ in daily transactions.",
            },
            {
              id: "exp2",
              position: "Frontend Developer",
              company: "InnovateLab Inc.",
              startDate: "Jun 2022",
              endDate: "Dec 2023",
              description:
                "Built responsive web applications using React, TypeScript, and modern CSS frameworks. Improved application performance by 40% through code optimization.",
            },
            {
              id: "exp3",
              position: "Blockchain Developer",
              company: "CryptoVentures",
              startDate: "Mar 2021",
              endDate: "May 2022",
              description:
                "Developed smart contracts and DeFi protocols on Ethereum and Solana. Created automated trading bots and yield farming strategies.",
            },
          ],
          skills: [
            "TypeScript",
            "React",
            "Node.js",
            "Python",
            "Rust",
            "Solana",
            "Ethereum",
            "DeFi",
            "Smart Contracts",
            "PostgreSQL",
            "MongoDB",
            "AWS",
            "Docker",
            "GraphQL",
          ],
          education: [
            {
              id: "edu1",
              institution: "Stanford University",
              degree: "Master of Science",
              field: "Computer Science", // Keeping this field for display purposes
              startYear: "2019",
              endYear: "2021",
              cgpa: "3.9", // Added missing required field
            },
            {
              id: "edu2",
              institution: "UC Berkeley",
              degree: "Bachelor of Science",
              field: "Computer Engineering", // Keeping this field for display purposes
              startYear: "2015",
              endYear: "2019",
              cgpa: "3.8", // Added missing required field
            },
          ],
          projects: [],
          blogs: [
            {
              id: "blog1",
              title: "Building Scalable DeFi Applications",
              summary:
                "A comprehensive guide to architecting decentralized finance applications that can handle millions of users and transactions.",
              publishDate: "15 Dec 2024",
              url: "https://blog.alexchen.dev/scalable-defi-apps",
            },
            {
              id: "blog2",
              title: "The Future of Web3 Development",
              summary:
                "Exploring emerging trends in blockchain technology and how they're shaping the next generation of web applications.",
              publishDate: "28 Nov 2024",
              url: "https://blog.alexchen.dev/future-web3-development",
            },
            {
              id: "blog3",
              title: "Optimizing React Performance at Scale",
              summary:
                "Advanced techniques for building high-performance React applications that remain fast as they grow in complexity.",
              publishDate: "10 Nov 2024",
              url: "https://blog.alexchen.dev/react-performance-optimization",
            },
            {
              id: "blog4",
              title: "Smart Contract Security Best Practices",
              summary:
                "Essential security patterns and common vulnerabilities to avoid when developing smart contracts for production.",
              publishDate: "22 Oct 2024",
              url: "https://blog.alexchen.dev/smart-contract-security",
            },
          ],
          // Added missing required properties
          certifications: [
            {
              id: "cert1",
              title: "AWS Certified Solutions Architect",
              issuer: "Amazon Web Services",
              date: "Feb 2023",
              url: "https://aws.amazon.com/certification/",
            },
            {
              id: "cert2",
              title: "Certified Blockchain Developer",
              issuer: "Blockchain Council",
              date: "Oct 2022",
              url: "https://www.blockchain-council.org/",
            },
          ],
          interests: [
            "Blockchain Technology",
            "Open Source",
            "Machine Learning",
            "Japanese Language",
            "Formula 1",
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
      default: // dark minimalist default
        return {
          bg: "bg-gray-950",
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
    <div className={`theme-${theme}`}>
      <div
        className={`min-h-screen ${themeClasses.bg} font-sans`}
      >
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12 max-w-5xl">
        {/* Header */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="header" disableTracking={disableTracking}>
          <header className="mb-12 sm:mb-14 md:mb-16 mt-6 sm:mt-8" data-section="header">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-8">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {portfolioData.personalInfo.firstName}{" "}
                {portfolioData.personalInfo.lastName}
              </h1>
              <h2
                className={`text-lg sm:text-xl md:text-2xl ${themeClasses.text} mb-6 font-medium`}
              >
                {portfolioData.personalInfo.title}
              </h2>
              <p
                className={`${themeClasses.text} max-w-2xl text-base sm:text-lg leading-relaxed`}
              >
                {portfolioData.personalInfo.about}
              </p>
              {portfolioData.interests &&
                portfolioData.interests.length > 0 && (
                  <p className={`mt-6 ${themeClasses.accent} text-base`}>
                    My interests include {portfolioData.interests.join(", ")}.
                    Always excited to discuss technology and innovation.
                  </p>
                )}
            </div>

            {portfolioData.personalInfo.photo && (
              <div className="md:ml-8 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portfolioData.personalInfo.photo || "/placeholder.svg"}
                  alt={`${portfolioData.personalInfo.firstName} ${portfolioData.personalInfo.lastName}`}
                  className={`rounded-2xl w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 object-cover border-2 ${themeClasses.border} shadow-2xl ${themeClasses.buttonHover} transition-colors duration-300`}
                />
              </div>
            )}
          </div>
        </header>
        </SectionViewTracker>

        {/* Recent Writings Section */}
        {portfolioData.blogs && portfolioData.blogs.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="writings" disableTracking={disableTracking}>
            <section className="mb-16" data-section="writings">
              <div className="flex justify-between items-center mb-8">
                <h2 className={`text-3xl font-bold ${themeClasses.text}`}>
                  Recent Writings
                </h2>
                <button
                  className={`px-4 py-2 text-sm ${themeClasses.cardBg} ${themeClasses.text} ${themeClasses.buttonHover} hover:text-white transition-all duration-200 rounded-lg border ${themeClasses.border} hover:border-gray-600`}
                >
                  Explore all →
                </button>
              </div>

              <div className="space-y-6">
                {portfolioData.blogs.map((blog) => (
                  <div key={blog.id} className="group">
                    <div
                      className={`flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 p-6 rounded-xl ${themeClasses.cardBg}/50 ${themeClasses.buttonHover}/80 transition-all duration-300 border ${themeClasses.cardBorder} hover:border-gray-700`}
                    >
                      <TrackableLink
                        href={blog.url || "#"}
                        resumeId={resumeId || ""}
                        interactionType="blog_link_click"
                        sectionName="writings"
                        target="_blank"
                        rel="noopener noreferrer"
                        disableTracking={disableTracking}
                        className="flex-1 group-hover:text-blue-400 transition-colors duration-200"
                      >
                        <h3
                          className={`text-xl font-semibold mb-2 ${themeClasses.text} group-hover:text-blue-400`}
                        >
                          {blog.title}
                        </h3>
                        <p className={`${themeClasses.accent} leading-relaxed`}>
                          {blog.summary}
                        </p>
                      </TrackableLink>
                      <span
                        className={`${themeClasses.accent} text-sm whitespace-nowrap font-medium`}
                      >
                        {blog.publishDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </SectionViewTracker>
        )}

        {/* Projects Section */}
        {portfolioData.projects && portfolioData.projects.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="projects" disableTracking={disableTracking}>
            <section className="mb-16" data-section="projects">
              <div className="flex justify-between items-center mb-8">
                <h2 className={`text-3xl font-bold ${themeClasses.text}`}>
                  Projects
                </h2>
                <button
                  className={`px-4 py-2 text-sm ${themeClasses.cardBg} ${themeClasses.text} ${themeClasses.buttonHover} hover:text-white transition-all duration-200 rounded-lg border ${themeClasses.border} hover:border-gray-600`}
                >
                  View all →
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(showAllProjects ? portfolioData.projects : portfolioData.projects.slice(0, 3)).map((project) => (
                  <div key={project.id} className="group">
                    <div
                      className={`${themeClasses.cardBg}/70 ${themeClasses.buttonHover} rounded-xl p-6 border ${themeClasses.cardBorder} hover:border-gray-700 transition-all duration-300 h-full flex flex-col`}
                    >
                      <h3
                        className={`font-bold text-xl mb-3 ${themeClasses.text} group-hover:text-blue-400 transition-colors`}
                      >
                        {project.name}
                      </h3>
                      <p
                        className={`${themeClasses.text} mb-4 leading-relaxed flex-1`}
                      >
                        {project.description}
                      </p>
                      <div className="mb-4">
                        {project.techStack.map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className={`mr-2 mb-2 ${themeClasses.cardBg}/80 ${themeClasses.text} ${themeClasses.border} ${themeClasses.badgeHover} hover:text-white transition-colors`}
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-4 pt-2">
                        <TrackableLink
                          href={project.sourceUrl || "#"}
                          resumeId={resumeId || ""}
                          interactionType="project_link_click"
                          sectionName="projects"
                          target="_blank"
                          rel="noopener noreferrer"
                          disableTracking={disableTracking}
                          className={`flex items-center gap-2 ${themeClasses.accent} hover:text-white transition-colors text-sm font-medium`}
                        >
                          <Github className="w-4 h-4" />
                          Source
                        </TrackableLink>
                        {project.demoUrl && (
                          <TrackableLink
                            href={project.demoUrl}
                            resumeId={resumeId || ""}
                            interactionType="project_demo_click"
                            sectionName="projects"
                            target="_blank"
                            rel="noopener noreferrer"
                            disableTracking={disableTracking}
                            className={`flex items-center gap-2 ${themeClasses.accent} hover:text-blue-400 transition-colors text-sm font-medium`}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Live Demo
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
                    onClick={() => setShowAllProjects(!showAllProjects)}
                    className={`px-4 py-2 text-sm ${themeClasses.cardBg} ${themeClasses.text} ${themeClasses.buttonHover} hover:text-white transition-all duration-200 rounded-lg border ${themeClasses.border} hover:border-gray-600`}
                  >
                    {showAllProjects ? (
                      <>
                        View Less <ChevronUp className="ml-2 w-4 h-4 inline" />
                      </>
                    ) : (
                      <>
                        View all <ChevronDown className="ml-2 w-4 h-4 inline" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </section>
          </SectionViewTracker>
        )}

        {/* Experience Section */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="experience" disableTracking={disableTracking}>
          <section className="mb-16" data-section="experience">
            <h2 className={`text-3xl font-bold mb-8 ${themeClasses.text}`}>
              Experience
            </h2>

            <div className="space-y-8">
              {portfolioData.experience.map((exp) => (
                <div key={exp.id} className="group">
                  <div
                    className={`p-6 rounded-xl ${themeClasses.cardBg}/50 ${themeClasses.buttonHover}/80 transition-all duration-300 border ${themeClasses.cardBorder} hover:border-gray-700`}
                  >
                    <h3 className={`font-bold text-xl ${themeClasses.text} mb-2`}>
                      {exp.position}
                    </h3>
                    <h4 className="text-lg text-blue-400 mb-2">{exp.company}</h4>
                    <p className={`${themeClasses.accent} mb-3 font-medium`}>
                      {formatDateToDisplay(exp.startDate)} - {exp.isPresent ? "Present" : formatDateToDisplay(exp.endDate || '')}
                    </p>
                    {exp.description && (
                      <div className={`${themeClasses.text}`}>
                        {formatDescription(exp.description)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </SectionViewTracker>

        {/* Education Section */}
        {portfolioData.education && portfolioData.education.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="education" disableTracking={disableTracking}>
            <section className="mb-16" data-section="education">
              <h2 className={`text-3xl font-bold mb-8 ${themeClasses.text}`}>
                Education
              </h2>
              <div className="space-y-8">
                {portfolioData.education.map((edu) => (
                  <div
                    key={edu.id}
                    className={`p-6 rounded-xl ${themeClasses.cardBg}/50 ${themeClasses.buttonHover}/80 transition-all duration-300 border ${themeClasses.cardBorder} hover:border-gray-700`}
                  >
                    <h3 className={`font-bold text-xl ${themeClasses.text} mb-2`}>
                      {edu.institution}
                    </h3>
                    <h4 className="text-lg text-blue-400 mb-2">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h4>
                    <p className={`${themeClasses.accent} mb-2 font-medium`}>
                      {edu.startYear} - {edu.endYear}
                    </p>
                    {edu.cgpa && (
                      <p className={`${themeClasses.text} text-sm`}>
                        {formatGradeDisplay(edu.cgpa)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </SectionViewTracker>
        )}

        {/* Certifications Section */}
        {portfolioData.certifications && portfolioData.certifications.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="certifications" disableTracking={disableTracking}>
            <section className="mb-16" data-section="certifications">
              <h2 className={`text-3xl font-bold mb-8 ${themeClasses.text}`}>
                Certifications
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {portfolioData.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className={`p-6 rounded-xl ${themeClasses.cardBg}/50 ${themeClasses.buttonHover}/80 transition-all duration-300 border ${themeClasses.cardBorder} hover:border-gray-700`}
                  >
                    <h3 className={`font-bold text-lg ${themeClasses.text} mb-1`}>
                      {cert.title}
                    </h3>
                    <p className="text-blue-400 mb-2">{cert.issuer}</p>
                    {cert.date && (
                      <p className={`${themeClasses.accent} text-sm mb-2`}>
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
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                      >
                        View Certificate <ExternalLink className="w-3 h-3" />
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
              <h2 className={`text-3xl font-bold mb-8 ${themeClasses.text}`}>
                Languages
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {portfolioData.languages.map((lang) => (
                  <div
                    key={lang.id}
                    className={`p-4 rounded-lg ${themeClasses.cardBg}/50 border ${themeClasses.cardBorder}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${themeClasses.text}`}>
                        {lang.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`${themeClasses.cardBg}/80 ${themeClasses.text} ${themeClasses.border}`}
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
                <h2 className={`text-3xl font-bold mb-8 ${themeClasses.text}`}>
                  {section.title}
                </h2>
                <div className="space-y-6">
                  {section.items && section.items.length > 0 ? section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-6 rounded-xl ${themeClasses.cardBg}/50 ${themeClasses.buttonHover}/80 transition-all duration-300 border ${themeClasses.cardBorder} hover:border-gray-700`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className={`font-bold text-xl ${themeClasses.text} mb-1`}>
                            {item.title}
                          </h3>
                          {item.subtitle && (
                            <p className="text-blue-400">{item.subtitle}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          {item.date && (
                            <p className={`${themeClasses.accent} text-sm`}>
                              {formatDateToDisplay(item.date)}
                            </p>
                          )}
                          {item.location && (
                            <p className={`${themeClasses.accent} text-sm`}>
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

        {/* Skills Section */}
        {portfolioData.skills && portfolioData.skills.length > 0 && (
          <SectionViewTracker resumeId={resumeId || ""} sectionName="skills" disableTracking={disableTracking}>
            <section className="mb-16" data-section="skills">
              <h2 className={`text-3xl font-bold mb-8 ${themeClasses.text}`}>
                Skills & Technologies
              </h2>
              <div className="flex flex-wrap gap-3">
                {portfolioData.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className={`px-4 py-2 text-base ${themeClasses.cardBg}/80 ${themeClasses.text} ${themeClasses.border} ${themeClasses.badgeHover} hover:text-white hover:border-gray-600 transition-all duration-200`}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>
          </SectionViewTracker>
        )}

        {/* Contact Section */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="contact" disableTracking={disableTracking}>
          <section className="mb-16" data-section="contact">
            <h2 className={`text-3xl font-bold mb-6 ${themeClasses.text}`}>
              Let&apos;s Connect
            </h2>
            <p
              className={`${themeClasses.text} mb-8 text-lg leading-relaxed max-w-2xl`}
            >
              Feel free to drop me an email or connect on social media. I&apos;m always
              open to interesting conversations, collaboration opportunities, and
              discussing the latest in technology and development.
            </p>

            <div className="flex flex-wrap gap-4">
              {portfolioData.personalInfo.social.github && (
                <TrackableLink
                  href={portfolioData.personalInfo.social.github}
                  resumeId={resumeId || ""}
                  interactionType="social_link_click"
                  sectionName="contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  disableTracking={disableTracking}
                  className={`flex items-center gap-3 px-6 py-3 ${themeClasses.cardBg} ${themeClasses.buttonHover} ${themeClasses.text} hover:text-white transition-all duration-200 rounded-lg border ${themeClasses.border} hover:border-gray-600`}
                >
                  <Github className="w-5 h-5" />
                  <span className="font-medium">GitHub</span>
                </TrackableLink>
              )}

              {portfolioData.personalInfo.email && (
                <TrackableLink
                  href={`mailto:${portfolioData.personalInfo.email}`}
                  resumeId={resumeId || ""}
                  interactionType="email_click"
                  sectionName="contact"
                  disableTracking={disableTracking}
                  className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 rounded-lg"
                >
                  <Mail className="w-5 h-5" />
                  <span className="font-medium">Email</span>
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
                  className={`flex items-center gap-3 px-6 py-3 ${themeClasses.cardBg} ${themeClasses.buttonHover} ${themeClasses.text} hover:text-white transition-all duration-200 rounded-lg border ${themeClasses.border} hover:border-gray-600`}
                >
                  <Twitter className="w-5 h-5" />
                  <span className="font-medium">Twitter</span>
                </TrackableLink>
              )}

              {portfolioData.personalInfo.social.linkedin && (
                <TrackableLink
                  href={portfolioData.personalInfo.social.linkedin}
                  resumeId={resumeId || ""}
                  interactionType="social_link_click"
                  sectionName="contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  disableTracking={disableTracking}
                  className={`flex items-center gap-3 px-6 py-3 ${themeClasses.cardBg} ${themeClasses.buttonHover} ${themeClasses.text} hover:text-white transition-all duration-200 rounded-lg border ${themeClasses.border} hover:border-gray-600`}
                >
                  <Linkedin className="w-5 h-5" />
                  <span className="font-medium">LinkedIn</span>
                </TrackableLink>
              )}
            </div>
          </section>
        </SectionViewTracker>
      </div>
    </div>
    </div>
  );
}
