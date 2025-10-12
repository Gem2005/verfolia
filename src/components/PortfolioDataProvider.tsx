import type { PortfolioData } from "@/types/PortfolioTypes";
import type { ResumeData } from "@/types/ResumeData";
import { formatDateToDisplay } from "@/utils/date-utils";

export const getPortfolioData = (resumeData: ResumeData): PortfolioData => ({
  personalInfo: {
    firstName: resumeData.personalInfo.firstName || "John",
    lastName: resumeData.personalInfo.lastName || "Doe",
    title: resumeData.personalInfo.title || "Software Developer",
    email: resumeData.personalInfo.email || "john@example.com",
    phone: resumeData.personalInfo.phone || "+1 (555) 123-4567",
    location: resumeData.personalInfo.location || "San Francisco, CA",
    about:
      resumeData.personalInfo.summary ||
      "Experienced professional with a proven track record of delivering high-quality solutions and driving innovation. Passionate about leveraging technology to solve complex problems and create meaningful impact. Strong collaborative skills with expertise in modern development practices and a commitment to continuous learning and growth.",
    photo:
      resumeData.personalInfo.photo ||
      "https://cdn-icons-png.flaticon.com/512/1999/1999625.png",
    social: {
      github: resumeData.personalInfo.githubUrl || "",
      twitter: "",
      linkedin: resumeData.personalInfo.linkedinUrl || "",
      portfolio: "",
    },
  },
  experience:
    resumeData.experience.length > 0
      ? resumeData.experience.map((exp) => ({
          id: exp.id,
          position: exp.position,
          company: exp.company,
          startDate: exp.startDate,
          endDate: exp.endDate,
          isPresent: exp.isPresent,
          description: exp.description,
        }))
      : [
          {
            id: "exp-1",
            position: "Senior Software Engineer",
            company: "Tech Solutions Inc.",
            startDate: "2022-01",
            endDate: "",
            isPresent: true,
            description:
              "Led development of scalable web applications using modern technologies. Collaborated with cross-functional teams to deliver high-quality software solutions. Mentored junior developers and implemented best practices for code quality and performance optimization.",
          },
          {
            id: "exp-2",
            position: "Software Developer",
            company: "Digital Innovations Ltd.",
            startDate: "2020-06",
            endDate: "2021-12",
            isPresent: false,
            description:
              "Developed and maintained full-stack applications using React, Node.js, and PostgreSQL. Participated in agile development processes and contributed to system architecture decisions. Improved application performance by 40% through code optimization.",
          },
        ],
  skills:
    resumeData.skills.length > 0
      ? resumeData.skills
      : [
          "JavaScript",
          "TypeScript",
          "React",
          "Node.js",
          "Python",
          "PostgreSQL",
          "MongoDB",
          "AWS",
          "Docker",
          "Git",
          "REST APIs",
          "GraphQL",
          "Agile/Scrum",
          "Problem Solving",
          "Team Leadership",
        ],
  education:
    resumeData.education.length > 0
      ? resumeData.education.map((edu) => ({
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          startYear: formatDateToDisplay(edu.startDate),
          endYear: formatDateToDisplay(edu.endDate),
          cgpa: edu.gpa || "",
        }))
      : [
          {
            id: "edu-1",
            institution: "University of Technology",
            degree: "Bachelor of Science",
            field: "Computer Science",
            startYear: "2016",
            endYear: "2020",
            cgpa: "3.8",
          },
        ],
  projects:
    resumeData.projects.length > 0
      ? resumeData.projects.map((proj) => ({
          id: proj.id,
          name: proj.name,
          description: proj.description,
          techStack: proj.techStack,
          sourceUrl: proj.sourceUrl || "",
          demoUrl: proj.demoUrl || "",
        }))
      : [
          {
            id: "proj-1",
            name: "E-Commerce Platform",
            description:
              "Full-stack e-commerce solution with real-time inventory management, payment processing, and admin dashboard. Features include user authentication, product catalog, shopping cart, and order tracking.",
            techStack: [
              "React",
              "Node.js",
              "PostgreSQL",
              "Stripe API",
              "AWS",
            ],
            sourceUrl: "https://github.com/johndoe/ecommerce-platform",
            demoUrl: "https://ecommerce-demo.johndoe.dev",
          },
          {
            id: "proj-2",
            name: "Task Management App",
            description:
              "Collaborative project management tool with real-time updates, team collaboration features, and advanced reporting. Supports multiple project views including Kanban boards and Gantt charts.",
            techStack: [
              "Vue.js",
              "Express.js",
              "MongoDB",
              "Socket.io",
              "Docker",
            ],
            sourceUrl: "https://github.com/johndoe/task-manager",
            demoUrl: "https://tasks.johndoe.dev",
          },
        ],
  blogs: [], // Not used in resume context
  certifications:
    resumeData.certifications.length > 0
      ? resumeData.certifications.map((cert) => ({
          id: cert.id,
          title: cert.name,
          issuer: cert.issuer,
          date: cert.date || "",
          url: cert.url || "",
        }))
      : [
          {
            id: "cert-1",
            title: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            date: "2023-08",
            url: "https://aws.amazon.com/certification/",
          },
          {
            id: "cert-2",
            title: "Professional Scrum Master I",
            issuer: "Scrum.org",
            date: "2022-11",
            url: "https://scrum.org/professional-scrum-certifications",
          },
        ],
  languages:
    resumeData.languages.length > 0
      ? resumeData.languages.map((lang) => ({
          id: lang.id,
          name: lang.name,
          proficiency: lang.proficiency || "",
        }))
      : [],
  customSections:
    resumeData.customSections.length > 0
      ? resumeData.customSections.map((section) => ({
          id: section.id,
          title: section.title,
          items: section.items || [],
        }))
      : [],
  interests:
    resumeData.customSections.length > 0
      ? resumeData.customSections.map((section) => section.title)
      : [
          "Open Source Contributions",
          "Machine Learning",
          "Cloud Architecture",
          "Mobile Development",
          "DevOps",
          "Tech Blogging",
          "Mentoring",
          "Innovation",
        ],
});