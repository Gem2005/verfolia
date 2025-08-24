"use client";
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
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDescription } from "@/utils/formatDescription";
import { Button } from "@/components/ui/button";

export function DarkTechTemplate({
  data,
  preview = false,
  theme = "black",
}: PortfolioTemplateProps & { theme?: string }) {
  // Use provided data or fallback to mock data only if no data is provided
  const portfolioData: PortfolioData =
    data && data.personalInfo && data.personalInfo.firstName
      ? data
      : {
          personalInfo: {
            firstName: "John",
            lastName: "Doe",
            title: "Software Engineer",
            email: "john.doe@example.com",
            phone: "+1234567890",
            location: "Remote",
            about:
              "I enjoy building modern web applications and exploring new technologies.",
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
              position: "Senior Full Stack Developer",
              company: "TechFusion",
              startDate: "Jan 2022",
              isPresent: true,
              description:
                "Building modern web applications using React, Next.js and Node.js",
            },
            {
              id: "exp2",
              position: "Frontend Developer",
              company: "WebCraft Solutions",
              startDate: "Mar 2020",
              endDate: "Dec 2021",
              description:
                "Developed responsive user interfaces for enterprise clients",
            },
          ],
          skills: [
            "React.js",
            "Next.js",
            "Node.js",
            "TypeScript",
            "MongoDB",
            "JavaScript",
            "Go",
            "T-SQL",
          ],
          education: [
            {
              id: "edu1",
              institution: "Trident Academy of Technology",
              degree: "B.Tech in Computer Science and Information Technology",
              startYear: "2020",
              endYear: "2024",
              cgpa: "8.5",
            },
            {
              id: "edu2",
              institution: "Netaji Subhas Memorial City College",
              degree: "Higher Secondary",
              startYear: "2019",
              endYear: "2021",
              cgpa: "85%",
            },
          ],
          projects: [],
          blogs: [
            {
              id: "blog1",
              title: "Is Computer Science Saturated?",
              summary: "Examining the state of the CS field in 2024",
              publishDate: "2024-06-18",
              url: "#",
            },
            {
              id: "blog2",
              title: "How to use Cursor AI IDE Pro for Free?",
              summary: "Tips and tricks for maximizing the free tier",
              publishDate: "2023-04-05",
              url: "#",
            },
          ],
          certifications: [],
          interests: ["Open Source", "Web Development", "AI/ML"],
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
    <div
      className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} font-sans`}
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(120,119,198,0.3)_0,transparent_600px),radial-gradient(circle_at_0%_60%,rgba(71,118,230,0.3)_0,transparent_400px)]"
        style={{ zIndex: 0 }}
      ></div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12 relative z-10 max-w-6xl">
        {/* Header - Social Links */}
        <header className="flex justify-center items-center space-x-6 mb-24">
          {portfolioData.personalInfo.social.github && (
            <Link
              href={portfolioData.personalInfo.social.github}
              target="_blank"
              className={`${themeClasses.accent} hover:text-primary transition-colors`}
            >
              <Github className="w-6 h-6" />
            </Link>
          )}

          {portfolioData.personalInfo.social.linkedin && (
            <Link
              href={portfolioData.personalInfo.social.linkedin}
              target="_blank"
              className={`${themeClasses.accent} hover:text-primary transition-colors`}
            >
              <Linkedin className="w-6 h-6" />
            </Link>
          )}

          {portfolioData.personalInfo.social.twitter && (
            <Link
              href={portfolioData.personalInfo.social.twitter}
              target="_blank"
              className={`${themeClasses.accent} hover:text-primary transition-colors`}
            >
              <Twitter className="w-6 h-6" />
            </Link>
          )}

          {portfolioData.personalInfo.email && (
            <Link
              href={`mailto:${portfolioData.personalInfo.email}`}
              className={`${themeClasses.accent} hover:text-primary transition-colors`}
            >
              <Mail className="w-6 h-6" />
            </Link>
          )}
        </header>

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
        <section className="mb-24">
          <h2 className={`text-2xl font-bold mb-8 ${themeClasses.text}`}>
            Skills
          </h2>

          <div className="flex flex-wrap gap-3">
            {portfolioData.skills.map((skill) => (
              <Badge
                key={skill}
                className={`px-4 py-2 rounded-md ${themeClasses.cardBg}/50 ${themeClasses.badgeHover}/10 ${themeClasses.text} border ${themeClasses.border}`}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </section>

        {/* Work Experience Section */}
        {portfolioData.experience && portfolioData.experience.length > 0 && (
          <section className="mb-24">
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
                    <h3 className="font-bold text-lg hover:text-blue-400 transition-colors">
                      {exp.position}
                    </h3>
                    <p className="text-gray-300 mb-1">{exp.company}</p>
                    <p className="text-sm text-gray-500 mb-2">
                      {exp.startDate} -{" "}
                      {exp.isPresent ? "Present" : exp.endDate}
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
        )}

        {/* Featured Projects Section */}
        {portfolioData.projects && portfolioData.projects.length > 0 && (
          <section className="mb-24">
            <h2 className="text-2xl font-bold mb-8">Featured Projects</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {portfolioData.projects.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden hover:border-blue-500/50 transition-all"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl">{project.name}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {project.techStack.map((tech) => (
                        <Badge
                          key={tech}
                          className="bg-gray-800 text-xs text-gray-300 border-gray-700"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-start space-x-4">
                      {project.demoUrl && (
                        <Link
                          href={project.demoUrl}
                          target="_blank"
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs px-2 py-1 h-auto"
                          >
                            Website
                          </Button>
                        </Link>
                      )}

                      {project.sourceUrl && (
                        <Link
                          href={project.sourceUrl}
                          target="_blank"
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs px-2 py-1 h-auto"
                          >
                            Source
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 bg-transparent"
              >
                VIEW ALL PROJECTS <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </section>
        )}

        {/* Education Section */}
        <section className="mb-24">
          <h2 className="text-2xl font-bold mb-8">Education</h2>

          <div className="space-y-8">
            {portfolioData.education.map((edu) => (
              <div key={edu.id} className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg hover:text-blue-400 transition-colors flex items-center">
                    {edu.institution}
                    {edu.institution.includes("Trident") && (
                      <Badge className="ml-2 bg-gray-800 text-gray-300">
                        <ChevronRight className="w-3 h-3 mr-1" />
                      </Badge>
                    )}
                  </h3>
                  <p className="text-gray-300 mb-1">{edu.degree}</p>
                  <p className="text-sm text-gray-500">
                    {edu.startYear} - {edu.endYear}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Blog Posts */}
        {portfolioData.blogs && portfolioData.blogs.length > 0 && (
          <section className="mb-24">
            <h2 className="text-2xl font-bold mb-8">Recent Blog Posts</h2>

            <div className="space-y-6">
              {portfolioData.blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-gray-900/50 border border-gray-800 p-5 rounded-lg hover:border-blue-500/50 transition-all"
                >
                  <h3 className="font-bold text-lg mb-2">{blog.title}</h3>
                  <p className="text-gray-400 mb-4">{blog.summary}</p>
                  <div className="text-gray-500 text-sm">
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
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Contact</h2>
          <p className="text-gray-300 mb-6">
            Always open to discussing new projects, creative ideas, or
            opportunities to be part of your visions. Feel free to reach out!
          </p>

          {portfolioData.personalInfo.email && (
            <Link
              href={`mailto:${portfolioData.personalInfo.email}`}
              className="inline-block"
            >
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Mail className="w-4 h-4 mr-2" />
                Connect via Email
              </Button>
            </Link>
          )}

          {portfolioData.personalInfo.social.twitter && (
            <Link
              href={portfolioData.personalInfo.social.twitter}
              className="ml-4 inline-block"
            >
              <Button
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 bg-transparent"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Connect on X
              </Button>
            </Link>
          )}
        </section>

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
  );
}
