export interface PortfolioData {
  personalInfo: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    about: string;
    photo: string;
    social: {
      github: string;
      twitter: string;
      linkedin: string;
      portfolio: string;
    };
  };
  experience: Array<{
    id: string;
    position: string;
    company: string;
    startDate: string;
    endDate?: string;
    isPresent?: boolean;
    description: string;
  }>;
  skills: string[];
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field?: string;
    startYear: string;
    endYear: string;
    cgpa: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    techStack: string[];
    sourceUrl: string;
    demoUrl: string;
    isLocked?: boolean; // <-- THIS IS THE FIX
  }>;
  blogs: Array<{
    id: string;
    title: string;
    summary: string;
    publishDate: string;
    url: string;
  }>;
  certifications: Array<{
    id: string;
    title: string;
    issuer: string;
    date: string;
    url: string;
  }>;
  languages?: Array<{
    id: string;
    name: string;
    proficiency?: string;
  }>;
  customSections?: Array<{
    id: string;
    title: string;
    items: Array<{
      title?: string;
      subtitle?: string;
      description?: string;
      date?: string;
      location?: string;
      details?: string[];
    }>;
  }>;
  interests: string[];
}

export interface PortfolioTemplateProps {
  data: PortfolioData;
  preview?: boolean;
  theme?: string;
}
