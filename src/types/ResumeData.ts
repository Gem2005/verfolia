export interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    title: string;
    photo?: string;
    linkedinUrl?: string;
    githubUrl?: string;
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
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    description: string;
    techStack: string[];
    sourceUrl?: string;
    demoUrl?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date?: string;
    url?: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    proficiency?: string;
  }>;
  customSections: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}
export interface Step {
  id: number;
  title: string;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  hasPhoto: boolean;
  description: string;
  layout: string;
}

export interface Theme {
  id: string;
  name: string;
  color: string;
}

export interface StepComponentProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onNext?: () => void;
  onPrevious?: () => void;
  canProceed?: boolean;
}
