"use client";
import type {
  PortfolioData,
  PortfolioTemplateProps,
} from "@/types/PortfolioTypes";
import { ExternalLink, Github, Linkedin, Mail, Twitter } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function DarkMinimalistTemplate({
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
              github: "https://github.com/alexchen",
              twitter: "https://twitter.com/alexchen_dev",
              linkedin: "https://linkedin.com/in/alexchen-dev",
              portfolio: "https://alexchen.dev", // Added missing required field
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
          projects: [
            {
              id: "proj1",
              name: "DeFiTracker Pro",
              description:
                "A comprehensive DeFi portfolio tracker with real-time analytics, yield farming optimization, and automated rebalancing features.",
              techStack: [
                "React",
                "TypeScript",
                "Solana",
                "Web3.js",
                "TailwindCSS",
              ],
              sourceUrl: "https://github.com/alexchen/defitracker-pro",
              demoUrl: "https://defitracker-pro.vercel.app",
            },
            {
              id: "proj2",
              name: "DevTools CLI",
              description:
                "A powerful command-line tool for developers to streamline project setup, code generation, and deployment workflows.",
              techStack: ["Rust", "CLI", "Git", "Docker"],
              sourceUrl: "https://github.com/alexchen/devtools-cli",
              demoUrl: "", // Added empty string for required field
            },
            {
              id: "proj3",
              name: "Smart Contract Auditor",
              description:
                "Automated security analysis tool for Ethereum smart contracts with vulnerability detection and gas optimization suggestions.",
              techStack: ["Python", "Solidity", "Machine Learning", "Web3"],
              sourceUrl: "https://github.com/alexchen/contract-auditor",
              demoUrl: "https://contract-auditor.app",
            },
            {
              id: "proj4",
              name: "Real-time Chat Platform",
              description:
                "Scalable chat application with end-to-end encryption, file sharing, and video calling capabilities.",
              techStack: ["Next.js", "Socket.io", "PostgreSQL", "Redis"],
              sourceUrl: "https://github.com/alexchen/secure-chat",
              demoUrl: "https://secure-chat-demo.vercel.app",
            },
          ],
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
    <div
      className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} font-sans`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12 max-w-5xl">
        {/* Header */}
        <header className="mb-12 sm:mb-14 md:mb-16 mt-6 sm:mt-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-8">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {portfolioData.personalInfo.firstName}{" "}
                <span
                  className={`${themeClasses.accent} text-2xl sm:text-3xl md:text-4xl`}
                >
                  ({portfolioData.personalInfo.firstName.toLowerCase()}dev)
                </span>
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
              {portfolioData.personalInfo.email && (
                <p className={`mt-6 ${themeClasses.accent} text-base`}>
                  I love writing & reading occasionally; also 日本語 and F1 are
                  my interests. Always excited to discuss technology and
                  innovation.
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

        {/* Recent Writings Section */}
        {portfolioData.blogs && portfolioData.blogs.length > 0 && (
          <section className="mb-16">
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
                    <Link
                      href={blog.url || "#"}
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
                    </Link>
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
        )}

        {/* Projects Section */}
        <section className="mb-16">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolioData.projects.map((project) => (
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
                    <Link
                      href={project.sourceUrl || "#"}
                      className={`flex items-center gap-2 ${themeClasses.accent} hover:text-white transition-colors text-sm font-medium`}
                    >
                      <Github className="w-4 h-4" />
                      Source
                    </Link>
                    {project.demoUrl && (
                      <Link
                        href={project.demoUrl}
                        className={`flex items-center gap-2 ${themeClasses.accent} hover:text-blue-400 transition-colors text-sm font-medium`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Live Demo
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="mb-16">
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
                    {exp.startDate} - {exp.isPresent ? "Present" : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className={`${themeClasses.text} leading-relaxed`}>
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        {portfolioData.skills && portfolioData.skills.length > 0 && (
          <section className="mb-16">
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
        )}

        {/* Contact Section */}
        <section className="mb-16">
          <h2 className={`text-3xl font-bold mb-6 ${themeClasses.text}`}>
            Let's Connect
          </h2>
          <p
            className={`${themeClasses.text} mb-8 text-lg leading-relaxed max-w-2xl`}
          >
            Feel free to drop me an email or connect on social media. I'm always
            open to interesting conversations, collaboration opportunities, and
            discussing the latest in technology and development.
          </p>

          <div className="flex flex-wrap gap-4">
            {portfolioData.personalInfo.social.github && (
              <Link
                href={portfolioData.personalInfo.social.github}
                className={`flex items-center gap-3 px-6 py-3 ${themeClasses.cardBg} ${themeClasses.buttonHover} ${themeClasses.text} hover:text-white transition-all duration-200 rounded-lg border ${themeClasses.border} hover:border-gray-600`}
              >
                <Github className="w-5 h-5" />
                <span className="font-medium">GitHub</span>
              </Link>
            )}

            {portfolioData.personalInfo.email && (
              <Link
                href={`mailto:${portfolioData.personalInfo.email}`}
                className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 rounded-lg"
              >
                <Mail className="w-5 h-5" />
                <span className="font-medium">Email</span>
              </Link>
            )}

            {portfolioData.personalInfo.social.twitter && (
              <Link
                href={portfolioData.personalInfo.social.twitter}
                className={`flex items-center gap-3 px-6 py-3 ${themeClasses.cardBg} ${themeClasses.buttonHover} ${themeClasses.text} hover:text-white transition-all duration-200 rounded-lg border ${themeClasses.border} hover:border-gray-600`}
              >
                <Twitter className="w-5 h-5" />
                <span className="font-medium">Twitter</span>
              </Link>
            )}

            {portfolioData.personalInfo.social.linkedin && (
              <Link
                href={portfolioData.personalInfo.social.linkedin}
                className={`flex items-center gap-3 px-6 py-3 ${themeClasses.cardBg} ${themeClasses.buttonHover} ${themeClasses.text} hover:text-white transition-all duration-200 rounded-lg border ${themeClasses.border} hover:border-gray-600`}
              >
                <Linkedin className="w-5 h-5" />
                <span className="font-medium">LinkedIn</span>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
