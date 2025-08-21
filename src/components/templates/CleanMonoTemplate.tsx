"use client";

import type React from "react";
import type {
  PortfolioData,
  PortfolioTemplateProps,
} from "@/types/PortfolioTypes";
import { ExternalLink, Github, Linkedin, Mail, Twitter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CleanMonoTemplate({
  data,
  preview = false,
}: PortfolioTemplateProps) {
  // Mock data for preview
  const portfolioData: PortfolioData = preview
    ? {
        personalInfo: {
          firstName: "John",
          lastName: "Doe",
          title: "Full Stack Developer",
          email: "john.doe@example.com",
          phone: "+1 234-567-8901",
          location: "San Francisco, CA, USA",
          about:
            "Passionate developer who loves building clean, accessible and performant web apps. Enjoys hackathons, open-source, and learning new stacks.",
          photo: "https://api.dicebear.com/7.x/adventurer/svg?seed=John%20Doe",
          social: {
            github: "https://github.com/johndoe",
            twitter: "https://twitter.com/johndoe",
            linkedin: "https://linkedin.com/in/johndoe",
            portfolio: "https://johndoe.dev",
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
        projects: [
          {
            id: "proj1",
            name: "Where Art Thou?",
            description:
              "A museum NFT marketplace, with verified artist accounts and secure transactions.",
            techStack: ["Solidity", "Next.js", "TypeScript"],
            sourceUrl: "https://github.com/johndoe/where-art-thou",
            demoUrl: "https://where-art-thou.vercel.app",
          },
          {
            id: "proj2",
            name: "Ethereal",
            description:
              "A decentralized NFT marketplace, with gasless listings and secure transactions of ERC-721 NFTs.",
            techStack: ["Solidity", "React.js", "TypeScript"],
            sourceUrl: "https://github.com/johndoe/ethereal",
            demoUrl: "https://ethereal-nft.vercel.app",
          },
          {
            id: "proj3",
            name: "Swiftlip",
            description:
              "A minimalistic and developer-friendly package to build command-line applications.",
            techStack: ["Node.js", "TypeScript", "JavaScript"],
            sourceUrl: "https://github.com/johndoe/swiftlip",
            demoUrl: "https://www.npmjs.com/package/swiftlip",
          },
          {
            id: "proj4",
            name: "ChainVote",
            description:
              "A secure, blockchain-based voting system ensuring transparency and immutability.",
            techStack: ["Solidity", "React", "IPFS"],
            sourceUrl: "https://github.com/johndoe/chainvote",
            demoUrl: "#",
          },
        ],
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
      }
    : data;

  const handleViewMore = (e: React.MouseEvent) => {
    e.preventDefault();
    // Add implementation for View More functionality
    // Could scroll to a section, load more content, or redirect
    console.log("View more clicked");
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.preventDefault();
    // Add implementation for Read More Blogs functionality
    console.log("Read more blogs clicked");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-mono">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <header className="mb-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
              {portfolioData.personalInfo.photo && (
                <div className="mb-4 sm:mb-0 sm:mr-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portfolioData.personalInfo.photo || "/placeholder.svg"}
                    alt={`${portfolioData.personalInfo.firstName} ${portfolioData.personalInfo.lastName}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {portfolioData.personalInfo.firstName}{" "}
                  {portfolioData.personalInfo.lastName}
                  <span className="inline-block ml-3 px-3 py-1 text-sm font-medium bg-green-600 text-white rounded-full shadow-sm">
                    Available for Hire
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-700 font-medium">
                  {portfolioData.personalInfo.title}
                </p>
                {portfolioData.personalInfo.location && (
                  <p className="text-sm text-gray-600 mt-1">
                    📍 {portfolioData.personalInfo.location}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-end">
              {portfolioData.personalInfo.social.github && (
                <a
                  href={portfolioData.personalInfo.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button
                    variant="outline"
                    size="default"
                    className="rounded-lg border-2 hover:bg-gray-900 hover:text-white transition-all duration-200 bg-transparent"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                </a>
              )}

              {portfolioData.personalInfo.social.twitter && (
                <a
                  href={portfolioData.personalInfo.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button
                    variant="outline"
                    size="default"
                    className="rounded-lg border-2 hover:bg-blue-500 hover:text-white transition-all duration-200 bg-transparent"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                </a>
              )}

              {portfolioData.personalInfo.email && (
                <a
                  href={`mailto:${portfolioData.personalInfo.email}`}
                  className="inline-block"
                >
                  <Button
                    variant="outline"
                    size="default"
                    className="rounded-lg border-2 hover:bg-red-500 hover:text-white transition-all duration-200 bg-transparent"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </a>
              )}
            </div>
          </div>

          {portfolioData.personalInfo.about && (
            <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-700 leading-relaxed text-base">
                {portfolioData.personalInfo.about}
              </p>
            </div>
          )}
        </header>

        {/* Work Experience Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 border-b-2 border-gray-900 pb-3">
            Work Experience
          </h2>

          <div className="space-y-8">
            {portfolioData.experience.map((exp) => (
              <div
                key={exp.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-lg">
                        {exp.company.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {exp.position}
                    </h3>
                    <p className="text-base text-gray-700 font-medium mb-1">
                      {exp.company}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      {exp.startDate} -{" "}
                      {exp.isPresent ? "Present" : exp.endDate}
                    </p>
                    {exp.description && (
                      <p className="text-gray-700 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 border-b-2 border-gray-900 pb-3">
            Education
          </h2>

          <div className="space-y-6">
            {portfolioData.education.map((edu) => (
              <div
                key={edu.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-lg">
                        {edu.institution.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {edu.degree}
                    </h3>
                    <p className="text-base text-gray-700 font-medium mb-1">
                      {edu.institution}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {edu.startYear} - {edu.endYear}
                    </p>
                    {edu.cgpa && (
                      <p className="text-sm text-gray-700 font-medium">
                        CGPA: {edu.cgpa}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 border-b-2 border-gray-900 pb-3">
            Skills & Technologies
          </h2>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-3">
              {portfolioData.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-900 hover:text-white transition-all duration-200 border-2 font-medium"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-gray-900 pb-3">
            Featured Projects
          </h2>
          <p className="text-gray-600 mb-8 text-base leading-relaxed">
            I've worked on a variety of projects, from simple websites to
            complex web applications. Here are a few of my favorites.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {portfolioData.projects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    {project.name}
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-800 font-medium"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {project.sourceUrl && project.sourceUrl !== "#" && (
                      <a
                        href={project.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-2 hover:bg-gray-900 hover:text-white transition-all duration-200 bg-transparent"
                        >
                          <Github className="w-4 h-4 mr-2" /> Source Code
                        </Button>
                      </a>
                    )}
                    {project.demoUrl && project.demoUrl !== "#" && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" /> Live Demo
                        </Button>
                      </a>
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
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-base transition-all duration-200"
            >
              View All Projects
            </Button>
          </div>
        </section>

        {/* Blogs Section */}
        {portfolioData.blogs && portfolioData.blogs.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-gray-900 border-b-2 border-gray-900 pb-3">
              Latest Blog Posts
            </h2>

            <div className="space-y-6">
              {portfolioData.blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                >
                  <a
                    href={blog.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {blog.title}
                    </h3>
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {blog.summary}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600 font-medium">
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
                className="border-2 hover:bg-gray-900 hover:text-white px-8 py-3 text-base transition-all duration-200 bg-transparent"
              >
                View All Blog Posts
              </Button>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 border-b-2 border-gray-900 pb-3">
            Let's Work Together
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              Want to chat? Just shoot me a message with your project details or
              questions. I'm always excited to discuss new opportunities and
              collaborations.
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
                    className="border-2 hover:bg-gray-900 hover:text-white transition-all duration-200 bg-transparent"
                  >
                    📞 {portfolioData.personalInfo.phone}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center border-t-2 border-gray-200 pt-8">
          <div className="flex justify-center space-x-6 mb-6">
            {portfolioData.personalInfo.social.github && (
              <a
                href={portfolioData.personalInfo.social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <Github className="w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors" />
              </a>
            )}

            {portfolioData.personalInfo.social.twitter && (
              <a
                href={portfolioData.personalInfo.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <Twitter className="w-6 h-6 text-gray-600 hover:text-blue-500 transition-colors" />
              </a>
            )}

            {portfolioData.personalInfo.social.linkedin && (
              <a
                href={portfolioData.personalInfo.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <Linkedin className="w-6 h-6 text-gray-600 hover:text-blue-600 transition-colors" />
              </a>
            )}

            {portfolioData.personalInfo.email && (
              <a
                href={`mailto:${portfolioData.personalInfo.email}`}
                aria-label="Email"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <Mail className="w-6 h-6 text-gray-600 hover:text-red-500 transition-colors" />
              </a>
            )}
          </div>
          <p className="text-gray-600 text-base">
            © {new Date().getFullYear()} {portfolioData.personalInfo.firstName}{" "}
            {portfolioData.personalInfo.lastName}. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
