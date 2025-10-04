// Main resume parser - this brings everything together
// Takes any file format and returns structured resume data

import { extractTextFromFile } from './file-extractors';
import { normalizeText, detectSections } from './text-processor';
import {
  extractContactInfo,
  extractExperience,
  extractEducation,
  extractSkills,
  extractProjects,
  extractCertifications,
  extractLanguages,
  type ContactInfo,
  type Experience,
  type Education,
  type Project,
  type Certification,
  type Language,
} from './entity-extractors';

// What the final parsed resume looks like
export interface ParsedResume {
  personalInfo: ContactInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  customSections: Array<{ title: string; content: string }>;
  metadata: {
    fileName: string;
    fileType: string;
    parsedAt: Date;
    warnings: string[];
  };
}

// Options you can pass to customize parsing
export interface ParserOptions {
  enableOCR?: boolean;
  skipSections?: string[];
}

// This is the main function - give it a file and it returns structured data
export async function parseResume(
  file: File,
  options: ParserOptions = {}
): Promise<ParsedResume> {
  const warnings: string[] = [];
  
  try {
    // Step 1: Get the text out of whatever file format they gave us
    console.log('Step 1: Extracting text from file...');
    const rawText = await extractTextFromFile(file);
    
    if (!rawText || rawText.trim().length < 50) {
      warnings.push('Very little text extracted from file. File may be empty or corrupted.');
    }
    
    // Step 2: Clean up the text so it's easier to work with
    console.log('Step 2: Normalizing text...');
    const normalizedText = normalizeText(rawText);
    
    // Step 3: Figure out which parts are which (experience, education, etc.)
    console.log('Step 3: Detecting sections...');
    const sections = detectSections(normalizedText);
    
    // Step 4: Pull out all the specific details from each section
    console.log('Step 4: Extracting entities...');
    
    // Get contact information
    const personalInfo = extractContactInfo(sections.contact || normalizedText);
    
    if (!personalInfo.firstName && !personalInfo.lastName) {
      warnings.push('Name not found. Please add manually.');
    }
    if (!personalInfo.email) {
      warnings.push('Email not found. Please add manually.');
    }
    if (!personalInfo.phone) {
      warnings.push('Phone number not found. Please add manually.');
    }
    
    // Get the professional summary if there is one
    const summary = sections.summary || undefined;
    
    // Get all the jobs they've had
    const experience = sections.experience 
      ? extractExperience(sections.experience) 
      : [];
    if (experience.length === 0) {
      warnings.push('No work experience found. Please add manually.');
    }
    
    // Get education history
    const education = sections.education 
      ? extractEducation(sections.education) 
      : [];
    if (education.length === 0) {
      warnings.push('No education found. Please add manually.');
    }
    
    // Get all their skills
    const skills = sections.skills 
      ? extractSkills(sections.skills) 
      : [];
    if (skills.length === 0) {
      warnings.push('No skills found. Please add manually.');
    }
    
    // Get projects if they have any
    const projects = sections.projects 
      ? extractProjects(sections.projects) 
      : [];
    
    // Get certifications
    const certifications = sections.certifications 
      ? extractCertifications(sections.certifications) 
      : [];
    
    // Get languages they speak
    const languages = sections.languages 
      ? extractLanguages(sections.languages) 
      : [];
    
    // Grab any other sections they might have
    const customSections = sections.customSections || [];
    
    // Step 5: Make sure everything looks good and put it all together
    console.log('Step 5: Validating...');
    const parsed: ParsedResume = {
      personalInfo,
      summary,
      experience,
      education,
      skills,
      projects,
      certifications,
      languages,
      customSections,
      metadata: {
        fileName: file.name,
        fileType: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        parsedAt: new Date(),
        warnings,
      },
    };
    
    // Run some checks and add any warnings we find
    const validationWarnings = validateParsedResume(parsed);
    parsed.metadata.warnings.push(...validationWarnings);
    
    console.log('Parsing complete!', {
      warnings: parsed.metadata.warnings.length,
      experience: parsed.experience.length,
      education: parsed.education.length,
      skills: parsed.skills.length,
    });
    
    return parsed;
    
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error(
      `Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Check the parsed resume for any issues or missing data
export function validateParsedResume(resume: ParsedResume): string[] {
  const warnings: string[] = [];
  
  // Make sure the work experience dates make sense
  resume.experience.forEach((exp, index) => {
    if (exp.startDate && exp.endDate && exp.endDate !== 'Present') {
      const start = new Date(exp.startDate);
      const end = new Date(exp.endDate);
      
      if (end < start) {
        warnings.push(
          `Experience #${index + 1} (${exp.company}): End date is before start date`
        );
      }
    }
    
    if (!exp.company) {
      warnings.push(`Experience #${index + 1}: Missing company name`);
    }
    
    if (!exp.position) {
      warnings.push(`Experience #${index + 1}: Missing position/title`);
    }
  });
  
  // Check education entries
  resume.education.forEach((edu, index) => {
    if (!edu.degree) {
      warnings.push(`Education #${index + 1}: Missing degree`);
    }
    
    if (!edu.institution) {
      warnings.push(`Education #${index + 1}: Missing institution`);
    }
  });
  
  // Make sure the resume has at least some content
  const hasMinContent = 
    resume.experience.length > 0 || 
    resume.education.length > 0 || 
    resume.skills.length > 0;
  
  if (!hasMinContent) {
    warnings.push('Resume appears to have very little content. Please review and add details manually.');
  }
  
  return warnings;
}

// Export everything so it can be used elsewhere
export * from './entity-extractors';
export { extractTextFromFile } from './file-extractors';
export { normalizeText, detectSections } from './text-processor';
