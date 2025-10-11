/**
 * Transform AI Resume Data to ResumeData format
 * Converts snake_case AI response to camelCase frontend format
 */

import { ResumeData } from '@/types/ResumeData';
import { AIResumeData } from '@/services/ai-resume-parser';

export function transformAIResumeToResumeData(aiData: AIResumeData): Partial<ResumeData> {
  return {
    personalInfo: {
      firstName: aiData.personal_info.first_name || '',
      lastName: aiData.personal_info.last_name || '',
      email: aiData.personal_info.email || '',
      phone: aiData.personal_info.phone || '',
      location: aiData.personal_info.location || '',
      summary: aiData.summary || '',
      title: '', // Not extracted by AI, user can fill later
      photo: '', // Not extracted by AI
      linkedinUrl: aiData.personal_info.linkedin || '',
      githubUrl: aiData.personal_info.github || '',
    },
    experience: aiData.experience.map((exp) => ({
      id: crypto.randomUUID(),
      position: exp.position || '',
      company: exp.company || '',
      startDate: exp.start_date || '',
      endDate: exp.end_date || '',
      isPresent: exp.current || false,
      description: exp.description || '',
    })),
    education: aiData.education.map((edu) => ({
      id: crypto.randomUUID(),
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      startDate: edu.start_date || '',
      endDate: edu.end_date || '',
      gpa: edu.gpa || '',
    })),
    skills: aiData.skills || [],
    projects: aiData.projects.map((proj) => ({
      id: crypto.randomUUID(),
      name: proj.name || '',
      description: proj.description || '',
      techStack: proj.technologies || [],
      sourceUrl: proj.url || '',
      demoUrl: '', // Not extracted by AI
    })),
    certifications: aiData.certifications.map((cert) => ({
      id: crypto.randomUUID(),
      name: cert.name || '',
      issuer: cert.issuer || '',
      date: cert.date || '',
      url: cert.url || '',
    })),
    languages: aiData.languages.map((lang) => ({
      id: crypto.randomUUID(),
      name: lang.language || '',
      proficiency: lang.proficiency || '',
    })),
    customSections: aiData.custom_sections.map((section) => ({
      id: crypto.randomUUID(),
      title: section.title || '',
      items: section.items.map((item) => ({
        title: item.title || '',
        subtitle: item.subtitle || '',
        description: item.description || '',
        date: item.date || '',
        location: item.location || '',
        details: item.details || [],
      })),
    })),
  };
}

export function formatAIResumeForAPI(aiData: AIResumeData) {
  return {
    personal_info: {
      first_name: aiData.personal_info.first_name || '',
      last_name: aiData.personal_info.last_name || '',
      email: aiData.personal_info.email || '',
      phone: aiData.personal_info.phone || '',
      location: aiData.personal_info.location || '',
      linkedin: aiData.personal_info.linkedin || '',
      github: aiData.personal_info.github || '',
      portfolio: aiData.personal_info.portfolio || '',
    },
    summary: aiData.summary || '',
    experience: aiData.experience.map((exp) => ({
      position: exp.position,
      company: exp.company,
      location: exp.location,
      start_date: exp.start_date,
      end_date: exp.end_date,
      current: exp.current,
      description: exp.description,
    })),
    education: aiData.education.map((edu) => ({
      degree: edu.degree,
      field: edu.field,
      institution: edu.institution,
      location: edu.location,
      start_date: edu.start_date,
      end_date: edu.end_date,
      gpa: edu.gpa,
    })),
    skills: aiData.skills,
    projects: aiData.projects.map((proj) => ({
      name: proj.name,
      description: proj.description,
      technologies: proj.technologies,
      url: proj.url,
    })),
    certifications: aiData.certifications.map((cert) => ({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date,
      url: cert.url,
    })),
    languages: aiData.languages.map((lang) => ({
      name: lang.language,
      proficiency: lang.proficiency,
    })),
    custom_sections: aiData.custom_sections,
  };
}
