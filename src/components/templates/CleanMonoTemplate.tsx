"use client";

import React from "react";
import type {
  PortfolioData,
  PortfolioTemplateProps,
} from "@/types/PortfolioTypes";
import { ExternalLink, Github, Linkedin, Mail, Twitter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resumeService } from "@/services/resume-service";
import { TrackableLink, SectionViewTracker } from "@/components/analytics";
import { formatDescription } from "@/utils/formatDescription";

interface CleanMonoTemplateProps extends PortfolioTemplateProps {
  theme?: string;
  resumeId?: string;
}

export function CleanMonoTemplate({
  data,
  preview = false,
  theme = "black",
  resumeId,
}: CleanMonoTemplateProps) {
  // Use provided data or fallback to mock data only if no data is provided
  const portfolioData: PortfolioData =
    data && data.personalInfo && data.personalInfo.firstName
      ? data
      : {
          personalInfo: {
            firstName: "John",
            lastName: "Doe",
            title: "Full Stack Developer",
            email: "john.doe@example.com",
            phone: "+1 234-567-8901",
            location: "San Francisco, CA, USA",
            about:
              "Passionate developer who loves building clean, accessible and performant web apps. Enjoys hackathons, open-source, and learning new stacks.",
            photo:
              "https://api.dicebear.com/7.x/adventurer/svg?seed=John%20Doe",
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
              position: "Blockchain and Software Developer",
              company: "Neural Labs",
              startDate: "August 2023",
              isPresent: true,
              description:
                "Working on blockchain solutions, building smart contracts, and integrating decentralized applications with front-end frameworks.",
            },
            {
              id: "exp2",
              position: "Social Media and Relations",
              company: "Crypto Union",
              startDate: "July 2022",
              endDate: "January 2023",
              description:
                "Managed social media presence, boosted community engagement by 30%, and organized 5+ crypto-related webinars and AMA sessions.",
            },
            {
              id: "exp3",
              position: "Solana Development Intern",
              company: "TerraFirm",
              startDate: "July 2022",
              endDate: "August 2022",
              description:
                "Developed Solana smart contracts, deployed NFT collections, and optimized gas usage for decentralized apps.",
            },
          ],
          skills: [
            "React",
            "TypeScript",
            "Next.js",
            "Node.js",
            "Solidity",
            "Rust",
            "Solana",
            "Ethers.js",
            "Web3",
            "Tailwind CSS",
            "Git",
            "Docker",
          ],
          education: [
            {
              id: "edu1",
              institution: "Himalayan Institute of Technology",
              degree: "Bachelor's in Computer Science and Engineering",
              startYear: "2019",
              endYear: "2023",
              cgpa: "8.7 / 10",
            },
          ],
          certifications: [
            {
              id: "cert1",
              title: "Ethereum Developer Bootcamp",
              issuer: "Consensys Academy",
              date: "June 2023",
              url: "#",
            },
            {
              id: "cert2",
              title: "Rust Programming Language",
              issuer: "Udemy",
              date: "March 2023",
              url: "#",
            },
          ],
          projects: [],
          blogs: [
            {
              id: "blog1",
              title: "Understanding PDAs, Seeds and Bumps in Solana",
              summary:
                "PDAs (Program Derived Addresses) are fundamental for beginners. Learn everything about PDAs and program ownership.",
              publishDate: "Feb 2023",
              url: "#",
            },
            {
              id: "blog2",
              title: "Learning Memory Management, Structs and Enums in Rust",
              summary:
                "Understanding Rust's memory management and data structures.",
              publishDate: "Jan 2023",
              url: "#",
            },
            {
              id: "blog3",
              title: "Custom Transactions and Instructions in Solana",
              summary:
                "Learn about custom transactions and instructions in Solana.",
              publishDate: "Dec 2022",
              url: "#",
            },
            {
              id: "blog4",
              title: "Next.js Performance Optimization Tips",
              summary:
                "Practical strategies to optimize performance in Next.js apps.",
              publishDate: "Nov 2022",
              url: "#",
            },
          ],
          interests: [
            "Hackathons",
            "Open Source",
            "Blockchain",
            "AI & ML",
            "Gaming",
          ],
        };

  // Theme configuration
  const getThemeClasses = () => {
    switch (theme) {
      case "dark-gray":
        return {
          bg: "bg-gray-800",
          text: "text-gray-100",
          accent: "text-gray-300",
          border: "border-gray-600",
          cardBg: "bg-gray-700",
          cardBorder: "border-gray-600",
          sectionBorder: "border-gray-600",
          buttonHover: "hover:bg-gray-600",
          badgeHover: "hover:bg-gray-600",
        };
      case "navy-blue":
        return {
          bg: "bg-blue-900",
          text: "text-blue-100",
          accent: "text-blue-300",
          border: "border-blue-600",
          cardBg: "bg-blue-800",
          cardBorder: "border-blue-600",
          sectionBorder: "border-blue-600",
          buttonHover: "hover:bg-blue-700",
          badgeHover: "hover:bg-blue-700",
        };
      case "professional":
        return {
          bg: "bg-gray-700",
          text: "text-gray-100",
          accent: "text-gray-300",
          border: "border-gray-500",
          cardBg: "bg-gray-600",
          cardBorder: "border-gray-500",
          sectionBorder: "border-gray-500",
          buttonHover: "hover:bg-gray-500",
          badgeHover: "hover:bg-gray-500",
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
          accent: "text-gray-600",
          border: "border-gray-300",
          cardBg: "bg-gray-50",
          cardBorder: "border-gray-200",
          sectionBorder: "border-gray-300",
          buttonHover: "hover:bg-gray-100",
          badgeHover: "hover:bg-gray-100",
        };
      default: // light theme fallback
        return {
          bg: "bg-gray-50",
          text: "text-gray-900",
          accent: "text-gray-600",
          border: "border-gray-300",
          cardBg: "bg-white",
          cardBorder: "border-gray-200",
          sectionBorder: "border-gray-300",
          buttonHover: "hover:bg-gray-100",
          badgeHover: "hover:bg-gray-100",
        };
    }
  };

  const themeClasses = getThemeClasses();

  const handleViewMore = (e: React.MouseEvent) => {
    e.preventDefault();
    if (resumeId) {
      resumeService.trackResumeInteraction(
        resumeId,
        "button_click",
        "view_more_projects",
        "projects"
      );
    }
    console.log("View more clicked");
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.preventDefault();
    if (resumeId) {
      resumeService.trackResumeInteraction(
        resumeId,
        "button_click",
        "read_more_blogs",
        "blogs"
      );
    }
    console.log("Read more blogs clicked");
  };

  const handleContactClick = (method: string) => {
    if (resumeId) {
      resumeService.trackResumeInteraction(
        resumeId,
        "contact_click",
        method,
        "contact"
      );
    }
  };

  const handleSkillClick = (skill: string) => {
    if (resumeId) {
      resumeService.trackResumeInteraction(
        resumeId,
        "skill_click",
        skill,
        "skills"
      );
    }
  };

  const handlePhotoClick = () => {
    if (resumeId) {
      resumeService.trackResumeInteraction(
        resumeId,
        "photo_click",
        "profile_photo",
        "header"
      );
    }
  };

  const trackInteraction = (type: string, value?: string, section?: string) => {
    if (resumeId) {
      resumeService.trackResumeInteraction(resumeId, type, value, section);
    }
  };

  // Use the existing formatDescription utility for better formatting

  return (
    <div
      className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} font-mono`}
    >
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <SectionViewTracker resumeId={resumeId || ""} sectionName="header">
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
                      onClick={handlePhotoClick}
                      data-trackable="profile-photo"
                    />
                  </div>
                )}
                <div>
                  <h1
                    className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${themeClasses.text} mb-2 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                    onClick={() =>
                      trackInteraction(
                        "name_click",
                        `${portfolioData.personalInfo.firstName} ${portfolioData.personalInfo.lastName}`,
                        "header"
                      )
                    }
                    data-trackable="name"
                  >
                    {portfolioData.personalInfo.firstName}{" "}
                    {portfolioData.personalInfo.lastName}
                  </h1>
                  <p
                    className={`text-lg sm:text-xl ${themeClasses.accent} font-medium cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                    onClick={() =>
                      trackInteraction(
                        "title_click",
                        portfolioData.personalInfo.title,
                        "header"
                      )
                    }
                    data-trackable="title"
                  >
                    {portfolioData.personalInfo.title}
                  </p>
                  {portfolioData.personalInfo.location && (
                    <p
                      className={`text-sm ${themeClasses.accent} mt-1 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                      onClick={() =>
                        trackInteraction(
                          "location_click",
                          portfolioData.personalInfo.location,
                          "header"
                        )
                      }
                      data-trackable="location"
                    >
                      📍 {portfolioData.personalInfo.location}
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
                  >
                    <Button
                      variant="outline"
                      size="default"
                      className="rounded-lg border-2 hover:bg-red-500 hover:text-white transition-all duration-200 bg-transparent border-red-500 text-red-500 hover:scale-105"
                      onClick={() => handleContactClick("email")}
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
                onClick={() =>
                  trackInteraction("about_click", "about_section", "header")
                }
                data-trackable="about-section"
              >
                <p className={`${themeClasses.text} leading-relaxed text-base`}>
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
          >
            <section className="mb-16" data-section="experience">
              <h2
                className={`text-2xl font-bold mb-8 ${themeClasses.text} border-b-2 ${themeClasses.sectionBorder} pb-3 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                onClick={() =>
                  trackInteraction(
                    "section_header_click",
                    "experience",
                    "experience"
                  )
                }
              >
                Work Experience
              </h2>

              <div className="space-y-8">
                {portfolioData.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className={`${themeClasses.cardBg} p-6 rounded-xl shadow-sm border ${themeClasses.cardBorder} hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]`}
                    onClick={() =>
                      trackInteraction(
                        "experience_click",
                        exp.position,
                        "experience"
                      )
                    }
                    data-trackable="experience-item"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 transition-transform duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            trackInteraction(
                              "company_logo_click",
                              exp.company,
                              "experience"
                            );
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
                            trackInteraction(
                              "position_click",
                              exp.position,
                              "experience"
                            );
                          }}
                          data-trackable="position-title"
                        >
                          {exp.position}
                        </h3>
                        <p
                          className={`text-base ${themeClasses.accent} font-medium mb-1 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                          onClick={(e) => {
                            e.stopPropagation();
                            trackInteraction(
                              "company_click",
                              exp.company,
                              "experience"
                            );
                          }}
                          data-trackable="company-name"
                        >
                          {exp.company}
                        </p>
                        <p
                          className={`text-sm ${themeClasses.accent} mb-3 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                          onClick={(e) => {
                            e.stopPropagation();
                            trackInteraction(
                              "date_click",
                              `${exp.startDate} - ${
                                exp.isPresent ? "Present" : exp.endDate
                              }`,
                              "experience"
                            );
                          }}
                          data-trackable="date-range"
                        >
                          {exp.startDate} -{" "}
                          {exp.isPresent ? "Present" : exp.endDate}
                        </p>
                        {exp.description && (
                          <div
                            className={`${themeClasses.text} cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                            onClick={(e) => {
                              e.stopPropagation();
                              trackInteraction(
                                "description_click",
                                exp.description.substring(0, 50),
                                "experience"
                              );
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
          <SectionViewTracker resumeId={resumeId || ""} sectionName="education">
            <section className="mb-16" data-section="education">
              <h2
                className={`text-2xl font-bold mb-8 ${themeClasses.text} border-b-2 ${themeClasses.sectionBorder} pb-3 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                onClick={() =>
                  trackInteraction(
                    "section_header_click",
                    "education",
                    "education"
                  )
                }
              >
                Education
              </h2>

              <div className="space-y-6">
                {portfolioData.education.map((edu) => (
                  <div
                    key={edu.id}
                    className={`${themeClasses.cardBg} p-6 rounded-xl shadow-sm border ${themeClasses.cardBorder} hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]`}
                    onClick={() =>
                      trackInteraction(
                        "education_click",
                        edu.degree,
                        "education"
                      )
                    }
                    data-trackable="education-item"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 transition-transform duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            trackInteraction(
                              "institution_logo_click",
                              edu.institution,
                              "education"
                            );
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
                            trackInteraction(
                              "degree_click",
                              edu.degree,
                              "education"
                            );
                          }}
                          data-trackable="degree-title"
                        >
                          {edu.degree}
                        </h3>
                        <p
                          className={`text-base ${themeClasses.accent} font-medium mb-1 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                          onClick={(e) => {
                            e.stopPropagation();
                            trackInteraction(
                              "institution_click",
                              edu.institution,
                              "education"
                            );
                          }}
                          data-trackable="institution-name"
                        >
                          {edu.institution}
                        </p>
                        <p
                          className={`text-sm ${themeClasses.accent} mb-2 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                          onClick={(e) => {
                            e.stopPropagation();
                            trackInteraction(
                              "education_date_click",
                              `${edu.startYear} - ${edu.endYear}`,
                              "education"
                            );
                          }}
                          data-trackable="education-dates"
                        >
                          {edu.startYear} - {edu.endYear}
                        </p>
                        {edu.cgpa && (
                          <p
                            className={`text-sm ${themeClasses.text} font-medium cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                            onClick={(e) => {
                              e.stopPropagation();
                              trackInteraction(
                                "cgpa_click",
                                edu.cgpa,
                                "education"
                              );
                            }}
                            data-trackable="cgpa"
                          >
                            CGPA: {edu.cgpa}
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
          <SectionViewTracker resumeId={resumeId || ""} sectionName="skills">
            <section className="mb-16" data-section="skills">
              <h2
                className={`text-2xl font-bold mb-8 ${themeClasses.text} border-b-2 ${themeClasses.sectionBorder} pb-3 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                onClick={() =>
                  trackInteraction("section_header_click", "skills", "skills")
                }
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
                      onClick={() => handleSkillClick(skill)}
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
          <SectionViewTracker resumeId={resumeId || ""} sectionName="projects">
            <section className="mb-16" data-section="projects">
              <h2
                className={`text-2xl font-bold mb-4 ${themeClasses.text} border-b-2 ${themeClasses.sectionBorder} pb-3 cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                onClick={() =>
                  trackInteraction(
                    "section_header_click",
                    "projects",
                    "projects"
                  )
                }
              >
                Featured Projects
              </h2>
              <p
                className={`${themeClasses.accent} mb-8 text-base leading-relaxed cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                onClick={() =>
                  trackInteraction(
                    "description_click",
                    "projects_intro",
                    "projects"
                  )
                }
                data-trackable="projects-description"
              >
                I've worked on a variety of projects, from simple websites to
                complex web applications. Here are a few of my favorites.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {portfolioData.projects.map((project) => (
                  <div
                    key={project.id}
                    className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
                    onClick={() =>
                      trackInteraction(
                        "project_click",
                        project.name,
                        "projects"
                      )
                    }
                    data-trackable="project-card"
                  >
                    <div className="p-6">
                      <h3
                        className={`font-bold text-xl mb-3 ${themeClasses.text} cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                        onClick={(e) => {
                          e.stopPropagation();
                          trackInteraction(
                            "project_title_click",
                            project.name,
                            "projects"
                          );
                        }}
                        data-trackable="project-title"
                      >
                        {project.name}
                      </h3>
                      <p
                        className={`${themeClasses.text} mb-4 leading-relaxed cursor-pointer hover:text-blue-400 transition-colors duration-200`}
                        onClick={(e) => {
                          e.stopPropagation();
                          trackInteraction(
                            "project_description_click",
                            project.description.substring(0, 50),
                            "projects"
                          );
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
                              trackInteraction(
                                "tech_stack_click",
                                tech,
                                "projects"
                              );
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
              <div className="text-center mt-8">
                <Button
                  variant="default"
                  onClick={handleViewMore}
                  className={`${themeClasses.cardBg} ${themeClasses.buttonHover} ${themeClasses.text} px-8 py-3 text-base transition-all duration-200 border ${themeClasses.border} rounded-lg hover:scale-105`}
                  data-trackable="button"
                >
                  View All Projects
                </Button>
              </div>
            </section>
          </SectionViewTracker>
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
                onClick={handleReadMore}
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
            Let's Work Together
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
  );
}
