"use client";
import type {
  PortfolioData,
  PortfolioTemplateProps,
} from "@/types/PortfolioTypes";
import { Github, Linkedin, Mail, Twitter, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ModernAIFocusedTemplate({
  data,
  preview = false,
}: PortfolioTemplateProps) {
  // Mock data for preview
  const portfolioData: PortfolioData = preview
    ? {
        personalInfo: {
          firstName: "John",
          lastName: "Doe",
          title: "Full Stack Developer (AI-leaning)",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567",
          location: "San Francisco, CA",
          about:
            "Experienced developer building intelligent, scalable solutions across web and cloud.",
          photo: "https://api.dicebear.com/7.x/adventurer/svg?seed=John%20Doe",
          social: {
            github: "https://github.com/johndoe",
            linkedin: "https://linkedin.com/in/johndoe",
            twitter: "https://twitter.com/johndoe",
            portfolio: "https://johndoe.dev",
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
            description: "Trained in full stack development and healthcare IT.",
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
        projects: [
          {
            id: "proj1",
            name: "Hirelytics - AI Interview Platform",
            description:
              "End-to-end AI-driven hiring platform with psychometric profiling, real-time voice interviews, auto evaluation, and attention monitoring.",
            techStack: ["React", "Node.js", "OpenAI", "TensorFlow"],
            sourceUrl: "https://github.com/johndoe/hirelytics",
            demoUrl: "https://hirelytics.ai",
          },
          {
            id: "proj2",
            name: "Talkthru - Mental Health AI Chatbot",
            description:
              "AI mental health chatbot with RAG, GPT-4, semantic memory, CBT support, journaling, and crisis workflows.",
            techStack: ["Next.js", "Python", "OpenAI", "Vector DB"],
            sourceUrl: "https://github.com/johndoe/talkthru",
            demoUrl: "https://talkthru.ai",
          },
          {
            id: "proj3",
            name: "Healthyio - Telehealth Platform",
            description:
              "Comprehensive telehealth platform with appointment scheduling, EHR workflow, video calls, dynamic questionnaires, and payment integration.",
            techStack: [
              "React",
              "MongoDB",
              "Agora",
              "Google Calendar",
              "Stripe",
            ],
            sourceUrl: "https://github.com/johndoe/healthyio",
            demoUrl: "https://healthyio.com",
          },
          {
            id: "proj4",
            name: "Python CLI AI Coder",
            description:
              "CLI tool for AI-assisted code generation, folder structure scaffolding, and iterative full-stack development with Jina.",
            techStack: ["Python", "CLI", "OpenAI", "TypeScript"],
            sourceUrl: "https://github.com/sumanta/python-ai-coder",
            demoUrl: "https://github.com/sumanta/python-ai-coder",
          },
        ],
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
      }
    : data;

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12 max-w-5xl">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row justify-between items-center mb-12 md:mb-16">
          <div className="lg:mr-12 mb-6 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Hi, I&apos;m {portfolioData.personalInfo.firstName}{" "}
              <span className="inline-block">👋</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 mb-6">
              {portfolioData.personalInfo.title}
            </p>
            <p className="text-gray-600 mb-8 max-w-xl">
              {portfolioData.personalInfo.about}
            </p>
            <div className="flex space-x-4">
              {portfolioData.personalInfo.email && (
                <Link href={`mailto:${portfolioData.personalInfo.email}`}>
                  <Button variant="default" className="rounded-full">
                    Contact Me
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="rounded-full bg-transparent">
                Download CV
              </Button>
            </div>
            <div className="flex space-x-4 mt-4">
              {portfolioData.personalInfo.phone && (
                <Link href={`tel:${portfolioData.personalInfo.phone}`}>
                  <Button
                    variant="outline"
                    className="rounded-full bg-transparent"
                  >
                    Call Me
                  </Button>
                </Link>
              )}
              {portfolioData.personalInfo.location && (
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${portfolioData.personalInfo.location}`}
                >
                  <Button
                    variant="outline"
                    className="rounded-full bg-transparent"
                  >
                    Visit Me
                  </Button>
                </Link>
              )}
              {portfolioData.personalInfo.social.portfolio && (
                <Link href={portfolioData.personalInfo.social.portfolio}>
                  <Button
                    variant="outline"
                    className="rounded-full bg-transparent"
                  >
                    Portfolio
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {portfolioData.personalInfo.photo && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-25 transform scale-110"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portfolioData.personalInfo.photo || "/placeholder.svg"}
                alt={`${portfolioData.personalInfo.firstName} ${portfolioData.personalInfo.lastName}`}
                className="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-full relative z-10 border-4 border-white shadow-xl"
              />
            </div>
          )}
        </section>

        {/* About Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8">About</h2>
          <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              {portfolioData.personalInfo.about}
            </p>
          </div>
        </section>

        {/* Work Experience Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8">Work Experience</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {portfolioData.experience.map((exp, index) => (
              <Card
                key={exp.id}
                className={`overflow-hidden border-t-4 ${
                  index === 0
                    ? "border-blue-500"
                    : index === 1
                    ? "border-purple-500"
                    : "border-gray-500"
                }`}
              >
                <CardContent className="p-6">
                  <div className="mb-2 flex items-center">
                    {/* Logo placeholder */}
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center mr-4 overflow-hidden">
                      <span className="text-xl font-bold text-gray-500">
                        {exp.company.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold">{exp.position}</h3>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {exp.startDate} -{" "}
                      {exp.isPresent ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 text-sm">{exp.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8">Education</h2>

          <div className="space-y-6">
            {portfolioData.education.map((edu) => (
              <div key={edu.id} className="flex items-start">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {edu.institution.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{edu.degree}</h3>
                  <p className="text-gray-700">{edu.institution}</p>
                  <p className="text-sm text-gray-500">
                    {edu.startYear} - {edu.endYear}
                  </p>
                  <p className="text-sm text-gray-500">
                    Field: {edu.field}, CGPA: {edu.cgpa}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8">Skills</h2>

          <div className="flex flex-wrap gap-3">
            {portfolioData.skills.map((skill) => (
              <Badge
                key={skill}
                className="px-4 py-2 text-sm rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-200 hover:from-blue-100 hover:to-indigo-100"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="mb-20">
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Projects</h2>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-transparent"
            >
              View All Projects
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {portfolioData.projects.map((project, idx) => (
              <Card
                key={project.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                  <div className="text-4xl font-bold text-gray-300">
                    {project.name.charAt(0)}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-2">{project.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    {project.sourceUrl && (
                      <Link href={project.sourceUrl}>
                        <Button size="sm" variant="outline">
                          Source
                        </Button>
                      </Link>
                    )}
                    {project.demoUrl && (
                      <Link href={project.demoUrl}>
                        <Button size="sm" variant="default">
                          Demo
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Blogs Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8">My Blogs</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {portfolioData.blogs.map((blog) => (
              <Card
                key={blog.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-2">{blog.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{blog.summary}</p>
                  <p className="text-sm text-gray-500">
                    Published on:{" "}
                    {new Date(blog.publishDate).toLocaleDateString()}
                  </p>
                  <div className="flex justify-end">
                    {blog.url && (
                      <Link href={blog.url}>
                        <Button size="sm" variant="default">
                          Read More
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Certifications Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8">Certifications</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {portfolioData.certifications.map((cert) => (
              <Card
                key={cert.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-2">{cert.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{cert.issuer}</p>
                  <p className="text-sm text-gray-500">
                    Issued on: {new Date(cert.date).toLocaleDateString()}
                  </p>
                  <div className="flex justify-end">
                    {cert.url && (
                      <Link href={cert.url}>
                        <Button size="sm" variant="default">
                          View Certificate
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Interests Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8">Interests</h2>

          <div className="flex flex-wrap gap-3">
            {portfolioData.interests.map((interest) => (
              <Badge
                key={interest}
                className="px-4 py-2 text-sm rounded-full bg-gradient-to-r from-green-50 to-lime-50 text-green-600 border border-green-200 hover:from-green-100 hover:to-lime-100"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
          <p className="text-gray-600 mb-8">
            Want to chat? Just shoot me a dm with a direct question on{" "}
            <Link
              href={portfolioData.personalInfo.social.twitter || "#"}
              className="text-blue-600 hover:underline"
            >
              twitter
            </Link>{" "}
            and I'll respond whenever I can. I will ignore all soliciting.
          </p>

          <div className="flex space-x-4">
            {portfolioData.personalInfo.social.github && (
              <Link
                href={portfolioData.personalInfo.social.github}
                className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Github className="w-5 h-5" />
              </Link>
            )}

            {portfolioData.personalInfo.social.twitter && (
              <Link
                href={portfolioData.personalInfo.social.twitter}
                className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </Link>
            )}

            {portfolioData.personalInfo.social.linkedin && (
              <Link
                href={portfolioData.personalInfo.social.linkedin}
                className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
            )}

            {portfolioData.personalInfo.email && (
              <Link
                href={`mailto:${portfolioData.personalInfo.email}`}
                className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </Link>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm border-t border-gray-200 pt-4">
          <p>
            &copy; 2025 {portfolioData.personalInfo.firstName}{" "}
            {portfolioData.personalInfo.lastName}. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
