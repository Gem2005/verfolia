// This file extracts specific information from resume text
// We pull out contact info, work experience, education, skills, etc.

// All the regex patterns we use to find stuff in resumes
export const PATTERNS = {
  // Patterns for finding contact information
  email: /[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}/g,
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  linkedin: /(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)[\w-]+/gi,
  github: /(?:github\.com\/)[\w-]+/gi,
  website: /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w.-]+(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?/g,
  
  // Patterns for dates in various formats
  monthYear: /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/gi,
  numericDate: /(\d{1,2})\/(\d{4})/g,
  yearRange: /(\d{4})\s*[-–—to]\s*(\d{4}|Present|Current|Now)/gi,
  present: /(Present|Current|Now|Ongoing)/gi,
  
  // Education-related patterns
  degree: /(Associate|Bachelor|Master|Ph\.?D|Doctorate|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|MBA|B\.?Tech|M\.?Tech)(?:\s+of\s+)?(?:\s+(?:Science|Arts|Engineering|Business|Computer Science))?/gi,
  gpa: /GPA:?\s*(\d\.\d+)(?:\s*\/\s*(\d\.\d+))?/gi,
  
  // Common job title patterns
  jobTitle: /(Senior|Junior|Lead|Principal|Staff|Chief)?\s*(Software|Data|Full[- ]?Stack|Front[- ]?End|Back[- ]?End|DevOps|Mobile|Web|Machine Learning|AI)?\s*(Engineer|Developer|Architect|Analyst|Scientist|Manager|Director|Designer|Consultant)/gi,
};

// What contact info looks like when we extract it
export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

// Pull out all the contact details from the resume
export function extractContactInfo(text: string): ContactInfo {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  // Find the email address
  const emailMatch = text.match(PATTERNS.email);
  const email = emailMatch ? emailMatch[0] : '';
  
  // Find the phone number - the regex should match formats like (555) 123-4567
  const phoneMatches = text.match(PATTERNS.phone);
  const phone = phoneMatches && phoneMatches.length > 0 ? phoneMatches[0].trim() : '';
  
  // Find LinkedIn profile
  const linkedinMatch = text.match(PATTERNS.linkedin);
  const linkedin = linkedinMatch ? 'https://' + linkedinMatch[0].replace(/^https?:\/\//, '') : '';
  
  // Find GitHub profile
  const githubMatch = text.match(PATTERNS.github);
  const github = githubMatch ? 'https://' + githubMatch[0].replace(/^https?:\/\//, '') : '';
  
  // Find portfolio/website (but not LinkedIn or GitHub)
  const websiteMatches = text.match(PATTERNS.website) || [];
  const portfolio = websiteMatches.find(url => 
    !url.includes('linkedin.com') && 
    !url.includes('github.com') &&
    !url.includes('@') // exclude emails
  ) || '';
  
  // Find the person's name - usually the first line that's not contact info
  let fullName = '';
  if (lines.length > 0) {
    // Usually the first line is the name
    fullName = lines[0];
    
    // But if the first line is actually contact info, try the second line
    if (PATTERNS.email.test(fullName) || PATTERNS.phone.test(fullName)) {
      fullName = lines[1] || lines[0];
    }
  }
  
  // Try to find the location (City, State format)
  const locationPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z]{2}|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/;
  const locationMatch = text.match(locationPattern);
  const location = locationMatch ? locationMatch[0] : '';
  
  return {
    fullName,
    email,
    phone,
    location,
    linkedin,
    github,
    portfolio: portfolio.startsWith('http') ? portfolio : (portfolio ? 'https://' + portfolio : ''),
  };
}

// What a work experience entry looks like
export interface Experience {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

// Extract all work experience from the resume
export function extractExperience(text: string): Experience[] {
  const experiences: Experience[] = [];
  const blocks = splitExperienceBlocks(text);
  
  for (const block of blocks) {
    const experience = parseExperienceBlock(block);
    if (experience) {
      experiences.push(experience);
    }
  }
  
  return experiences;
}

// Split the experience section into individual job blocks
function splitExperienceBlocks(text: string): string[] {
  const blocks: string[] = [];
  const lines = text.split('\n');
  let currentBlock: string[] = [];
  let lastLineWasEmpty = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      lastLineWasEmpty = true;
      continue;
    }
    
    // Start a new block after a blank line if we have content
    if (lastLineWasEmpty && currentBlock.length > 0) {
      blocks.push(currentBlock.join('\n'));
      currentBlock = [line];
      lastLineWasEmpty = false;
    } else {
      currentBlock.push(line);
      lastLineWasEmpty = false;
    }
  }
  
  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'));
  }
  
  return blocks;
}

// Parse a single job entry and extract all the details
function parseExperienceBlock(block: string): Experience | null {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);
  
  if (lines.length === 0) return null;
  
  // Get the dates first
  const { startDate, endDate, current } = extractDates(block);
  
  if (!startDate) return null; // Need at least a start date
  
  // Now figure out the job title and company name
  // People format this in so many different ways!
  let position = '';
  let company = '';
  
  // Common patterns:
  // "Software Engineer at Google"
  // "Software Engineer | Google"
  // "Google - Software Engineer"
  // "Software Engineer\nGoogle"
  
  // Filter out lines that are just dates
  const nonDateLines = lines.filter(line => {
    const hasOnlyDate = PATTERNS.monthYear.test(line) || 
                       PATTERNS.numericDate.test(line) || 
                       PATTERNS.yearRange.test(line);
    const hasOnlyBullet = line.startsWith('•');
    return !hasOnlyDate && !hasOnlyBullet;
  });
  
  if (nonDateLines.length === 0) return null;
  
  const firstLine = nonDateLines[0];
  
  if (firstLine.includes(' at ')) {
    const parts = firstLine.split(' at ');
    position = parts[0].trim();
    company = parts[1].trim();
  } else if (firstLine.includes(' | ')) {
    const parts = firstLine.split(' | ');
    position = parts[0].trim();
    company = parts[1].trim();
  } else if (firstLine.includes(' - ')) {
    const parts = firstLine.split(' - ');
    // Could be either "Company - Position" or "Position - Company"
    if (PATTERNS.jobTitle.test(parts[1])) {
      company = parts[0].trim();
      position = parts[1].trim();
    } else {
      position = parts[0].trim();
      company = parts[1].trim();
    }
  } else if (nonDateLines.length > 1) {
    position = nonDateLines[0];
    // Second line might be "Company | Location" or just "Company"
    const secondLine = nonDateLines[1];
    if (secondLine.includes(' | ')) {
      company = secondLine.split(' | ')[0].trim();
    } else {
      company = secondLine;
    }
  } else {
    position = firstLine;
  }
  
  // Extract location if the company line has " | Location" format
  let location: string | undefined;
  const locationPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z]{2}|[A-Z][a-z]+)/;
  
  // Check if company has location attached
  if (company.includes(' | ')) {
    const parts = company.split(' | ');
    company = parts[0].trim();
    location = parts[1].trim();
  } else {
    // Otherwise try to extract from the whole block
    const locationMatch = block.match(locationPattern);
    location = locationMatch ? locationMatch[0] : undefined;
  }
  
  // Extract description (bullet points and paragraphs)
  const descriptionLines = lines.slice(2).filter(line => 
    line.startsWith('•') || line.length > 20
  );
  const description = descriptionLines.join('\n');
  
  return {
    company: company.replace(/[,.]$/, '').trim(),
    position: position.replace(/[,.]$/, '').trim(),
    location,
    startDate,
    endDate,
    current,
    description,
  };
}

// ============================================================================
// EDUCATION EXTRACTOR
// ============================================================================

export interface Education {
  degree: string;
  field: string;
  institution: string;
  location?: string;
  graduationDate: string;
  gpa?: string;
}

export function extractEducation(text: string): Education[] {
  const educations: Education[] = [];
  const blocks = splitEducationBlocks(text);
  
  for (const block of blocks) {
    const education = parseEducationBlock(block);
    if (education) {
      educations.push(education);
    }
  }
  
  return educations;
}

function splitEducationBlocks(text: string): string[] {
  const blocks: string[] = [];
  const lines = text.split('\n');
  let currentBlock: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      continue;
    }
    
    // Check if this line starts with a full degree name (not just "Ma" from "May")
    // Require a space after the degree abbreviation to avoid false matches
    const degreeMatch = trimmed.match(/^(Associate|Bachelor|Master|Ph\.?D\.?|Doctorate|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?B\.?A\.?|B\.?Tech|M\.?Tech)\s/i);
    
    if (degreeMatch && currentBlock.length > 0) {
      blocks.push(currentBlock.join('\n'));
      currentBlock = [trimmed];
    } else {
      currentBlock.push(trimmed);
    }
  }
  
  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'));
  }
  
  return blocks;
}

function parseEducationBlock(block: string): Education | null {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);
  
  if (lines.length === 0) return null;
  
  // Extract degree
  const degreeMatch = block.match(PATTERNS.degree);
  const degree = degreeMatch ? degreeMatch[0] : '';
  
  if (!degree) return null;
  
  // Extract field of study
  let field = '';
  let degreeLineIndex = -1;
  const degreeText = lines.find((l, idx) => {
    if (PATTERNS.degree.test(l)) {
      degreeLineIndex = idx;
      return true;
    }
    return false;
  }) || '';
  
  // Field usually follows degree: "Bachelor of Science in Computer Science"
  const fieldPattern = /(?:in|of)\s+([A-Z][a-zA-Z\s&,]+?)(?:\s*[,|\n]|$)/;
  const fieldMatch = degreeText.match(fieldPattern);
  if (fieldMatch) {
    field = fieldMatch[1].trim();
  }
  
  // Extract institution (usually on second line, might have location after " | ")
  // Skip the degree line by checking the index
  let institution = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip the degree line
    if (i === degreeLineIndex) continue;
    
    // Skip date lines and GPA lines
    if (PATTERNS.monthYear.test(line) || 
        PATTERNS.yearRange.test(line) ||
        line.startsWith('Graduated') ||
        PATTERNS.gpa.test(line) ||
        line.length < 4) {
      continue;
    }
    
    // If the line has " | Location", just take the first part
    institution = line.includes(' | ') ? line.split(' | ')[0].trim() : line;
    break;
  }
  
  // Extract graduation date
  const { endDate } = extractDates(block);
  const graduationDate = endDate || '';
  
  // Extract GPA
  const gpaMatch = block.match(PATTERNS.gpa);
  const gpa = gpaMatch ? gpaMatch[1] + (gpaMatch[2] ? '/' + gpaMatch[2] : '/4.0') : undefined;
  
  // Extract location
  const locationPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z]{2}|[A-Z][a-z]+)/;
  const locationMatch = block.match(locationPattern);
  const location = locationMatch ? locationMatch[0] : undefined;
  
  return {
    degree,
    field,
    institution: institution.replace(/[,.]$/, '').trim(),
    location,
    graduationDate,
    gpa,
  };
}

// ============================================================================
// SKILLS EXTRACTOR
// ============================================================================

export function extractSkills(text: string): string[] {
  const skills: Set<string> = new Set();
  
  // Remove bullet points and split by common delimiters
  const cleanText = text.replace(/^•\s*/gm, '');
  
  // Split by: commas, pipes, semicolons, bullets, newlines
  const items = cleanText.split(/[,|;\n•]+/).map(s => s.trim()).filter(s => s);
  
  for (const item of items) {
    // Skip long sentences (likely descriptions, not skills)
    if (item.length > 50 || item.split(' ').length > 5) {
      continue;
    }
    
    // Clean up and add
    const skill = item.replace(/^[-–—]\s*/, '').trim();
    if (skill) {
      skills.add(skill);
    }
  }
  
  return Array.from(skills);
}

// ============================================================================
// PROJECTS EXTRACTOR
// ============================================================================

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export function extractProjects(text: string): Project[] {
  const projects: Project[] = [];
  const blocks = text.split(/\n\s*\n/).filter(b => b.trim());
  
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    
    if (lines.length === 0) continue;
    
    // First line is usually project name
    const name = lines[0].replace(/^•\s*/, '');
    
    // Extract URL if present
    const urlMatch = block.match(PATTERNS.website);
    const url = urlMatch ? urlMatch.find(u => u.includes('github') || u.includes('demo') || u.includes('project')) : undefined;
    
    // Extract technologies (look for parentheses or "Technologies:" label)
    const techPattern = /(?:Technologies?|Tech Stack|Built with|Using):?\s*(.+?)(?:\n|$)/i;
    const techMatch = block.match(techPattern);
    let technologies: string[] = [];
    
    if (techMatch) {
      technologies = techMatch[1].split(/[,|;]+/).map(t => t.trim()).filter(t => t);
    } else {
      // Look for parentheses with tech stack
      const parenPattern = /\((.+?)\)/g;
      const parenMatches = block.match(parenPattern);
      if (parenMatches) {
        technologies = parenMatches
          .map(m => m.replace(/[()]/g, ''))
          .flatMap(m => m.split(/[,|;]+/))
          .map(t => t.trim())
          .filter(t => t);
      }
    }
    
    // Description is remaining text
    const description = lines.slice(1)
      .filter(l => !l.includes('http') && !techPattern.test(l))
      .join(' ')
      .replace(/^•\s*/g, '')
      .trim();
    
    projects.push({
      name,
      description,
      technologies,
      url,
    });
  }
  
  return projects;
}

// ============================================================================
// CERTIFICATIONS EXTRACTOR
// ============================================================================

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export function extractCertifications(text: string): Certification[] {
  const certifications: Certification[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  for (const line of lines) {
    if (!line || line.startsWith('•') === false && line.length < 10) continue;
    
    const cleanLine = line.replace(/^•\s*/, '');
    
    // Extract date
    const { endDate } = extractDates(cleanLine);
    
    // Extract credential ID
    const credIdPattern = /(?:ID|Credential|Certificate)[:#]?\s*([A-Z0-9-]+)/i;
    const credIdMatch = cleanLine.match(credIdPattern);
    const credentialId = credIdMatch ? credIdMatch[1] : undefined;
    
    // Split by common separators to get name and issuer
    let name = cleanLine;
    let issuer = '';
    
    if (cleanLine.includes(' - ')) {
      const parts = cleanLine.split(' - ');
      name = parts[0].trim();
      issuer = parts[1].trim();
    } else if (cleanLine.includes(' by ')) {
      const parts = cleanLine.split(' by ');
      name = parts[0].trim();
      issuer = parts[1].trim();
    } else if (cleanLine.includes(' from ')) {
      const parts = cleanLine.split(' from ');
      name = parts[0].trim();
      issuer = parts[1].trim();
    }
    
    certifications.push({
      name: name.replace(/[,.]$/, '').trim(),
      issuer: issuer.replace(/[,.]$/, '').trim(),
      date: endDate,
      credentialId,
    });
  }
  
  return certifications;
}

// ============================================================================
// LANGUAGES EXTRACTOR
// ============================================================================

export interface Language {
  language: string;
  proficiency?: string;
}

export function extractLanguages(text: string): Language[] {
  const languages: Language[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  const proficiencyLevels = /(Native|Fluent|Professional|Advanced|Intermediate|Basic|Beginner|Elementary)/gi;
  
  for (const line of lines) {
    const cleanLine = line.replace(/^•\s*/, '');
    
    // Extract proficiency
    const profMatch = cleanLine.match(proficiencyLevels);
    const proficiency = profMatch ? profMatch[0] : undefined;
    
    // Extract language name
    let language = cleanLine
      .replace(proficiencyLevels, '')
      .replace(/[:()\-–—]/g, '')
      .trim();
    
    if (language) {
      languages.push({
        language,
        proficiency,
      });
    }
  }
  
  return languages;
}

// ============================================================================
// DATE EXTRACTION HELPER
// ============================================================================

interface DateRange {
  startDate: string;
  endDate: string;
  current: boolean;
}

function extractDates(text: string): DateRange {
  let startDate = '';
  let endDate = '';
  let current = false;
  
  // Check for "Present", "Current", etc.
  if (PATTERNS.present.test(text)) {
    current = true;
    endDate = 'Present';
  }
  
  // Extract year ranges: "2020 - 2023"
  const yearRangeMatch = text.match(PATTERNS.yearRange);
  if (yearRangeMatch) {
    startDate = yearRangeMatch[0].split(/\s*[-–—to]\s*/)[0];
    const end = yearRangeMatch[0].split(/\s*[-–—to]\s*/)[1];
    if (!current) {
      endDate = end;
    }
  }
  
  // Extract month-year dates: "January 2020"
  const monthYearMatches = Array.from(text.matchAll(PATTERNS.monthYear));
  if (monthYearMatches.length > 0) {
    startDate = monthYearMatches[0][0];
    if (monthYearMatches.length > 1 && !current) {
      endDate = monthYearMatches[1][0];
    }
  }
  
  // Extract numeric dates: "01/2020"
  const numericMatches = Array.from(text.matchAll(PATTERNS.numericDate));
  if (numericMatches.length > 0 && !startDate) {
    startDate = numericMatches[0][0];
    if (numericMatches.length > 1 && !current && !endDate) {
      endDate = numericMatches[1][0];
    }
  }
  
  return { startDate, endDate, current };
}
