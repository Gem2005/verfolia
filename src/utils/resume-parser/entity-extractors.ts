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
    
    // Check if this line looks like a job title line
    // Job title lines typically:
    // - Contain a date pattern (Mon YYYY or YYYY)
    // - Have commas (Title, Company format)
    // - Are NOT bullet points
    // - Don't start with lowercase (not mid-sentence)
    const hasDatePattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present|Current)\s+\d{4}|\d{4}\s*-\s*\d{4}|\d{4}\s*-\s*(Present|Current)/i.test(line);
    const hasCommaFormat = line.includes(',') && !line.startsWith('•');
    const looksLikeJobTitle = !line.startsWith('•') && !line.startsWith('-') && !/^[a-z]/.test(line);
    
    // If this looks like a new job entry and we have content, save the current block
    if (looksLikeJobTitle && hasDatePattern && hasCommaFormat && currentBlock.length > 0) {
      blocks.push(currentBlock.join('\n'));
      currentBlock = [line];
      lastLineWasEmpty = false;
    } 
    // Or start a new block after a blank line if we have content (traditional format)
    else if (lastLineWasEmpty && currentBlock.length > 0) {
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
  let location: string | undefined;
  
  // Common patterns:
  // "Software Engineer at Google"
  // "Software Engineer | Google"
  // "Google - Software Engineer"
  // "Software Engineer\nGoogle"
  // "Job Title, Company Name, Location Date"
  
  // Filter out lines that are just bullet points or pure date lines
  const nonDateLines = lines.filter(line => {
    // Skip bullet points
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      return false;
    }
    
    // Skip lines that are ONLY dates (no other substantial content)
    // This is different from lines that CONTAIN dates (like job title lines)
    const dateOnlyPattern = /^\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*-\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*$|^\s*\d{4}\s*-\s*\d{4}\s*$/i;
    if (dateOnlyPattern.test(line)) {
      return false;
    }
    
    return true;
  });
  
  if (nonDateLines.length === 0) return null;
  
  const firstLine = nonDateLines[0];
  
  // Check for comma-separated format: "Title, Company, Location"
  if (firstLine.includes(',')) {
    const parts = firstLine.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      position = parts[0];
      company = parts[1];
      if (parts.length >= 3) {
        // The last part might have the date - extract just location
        const locationPart = parts[2];
        const dateMatch = locationPart.match(/\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})/i);
        if (dateMatch) {
          location = locationPart.substring(0, dateMatch.index).trim();
        } else {
          location = locationPart;
        }
      }
    }
  } else if (firstLine.includes(' at ')) {
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
  
  // Extract location if not already found and company line has " | Location" format
  if (!location) {
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
  }
  
  // Extract description (bullet points and paragraphs)
  const descriptionLines = lines.filter(line => 
    line.startsWith('•') && line.length > 2
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
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    
    if (!trimmed) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      continue;
    }
    
    // Check if this line looks like an institution name
    // Institution lines typically:
    // - Have "University", "Institute", "College", "School", etc.
    // - OR have a location and date range
    // - Are NOT bullet points
    // - Are NOT the first line of the entire section
    const hasInstitutionKeyword = /University|Institute|College|School|Academy/i.test(trimmed);
    const hasLocation = /, [A-Z][a-z]+/.test(trimmed); // Has comma followed by a capitalized word (likely city)
    const hasDateRange = /\d{4}/.test(trimmed); // Has a year
    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');
    
    // If this looks like a new institution and we have content, save the current block
    if (!isBullet && (hasInstitutionKeyword || (hasLocation && hasDateRange)) && currentBlock.length > 0) {
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
  
  // Try to find degree
  const degreeMatch = block.match(PATTERNS.degree);
  let degree = degreeMatch ? degreeMatch[0] : '';
  
  // Extract field of study
  let field = '';
  let degreeLineIndex = -1;
  
  // Look for degree in bullet points or inline text
  if (degree) {
    const degreeText = lines.find((l, idx) => {
      if (PATTERNS.degree.test(l)) {
        degreeLineIndex = idx;
        return true;
      }
      return false;
    }) || '';
    
    // Field usually follows degree: "Bachelor of Science in Computer Science"
    const fieldPattern = /(?:in|of)\s+([A-Z][a-zA-Z\s&,]+?)(?:\s*[;,|\n]|$)/;
    const fieldMatch = degreeText.match(fieldPattern);
    if (fieldMatch) {
      field = fieldMatch[1].trim();
    }
  } else {
    // If no standard degree found, check for "B.Tech", "M.Tech" etc in bullet points
    const btechMatch = block.match(/B\.?Tech\.?\s+(?:in\s+)?([^;,\n]+)/i);
    const mtechMatch = block.match(/M\.?Tech\.?\s+(?:in\s+)?([^;,\n]+)/i);
    
    if (btechMatch) {
      degree = 'B.Tech.';
      field = btechMatch[1].trim();
    } else if (mtechMatch) {
      degree = 'M.Tech.';
      field = mtechMatch[1].trim();
    }
  }
  
  // Extract institution - usually the first non-bullet line with a date range or first substantial line
  let institution = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip bullet points, degree lines, and short lines
    if (line.startsWith('•') || 
        i === degreeLineIndex || 
        line.startsWith('Graduated') ||
        PATTERNS.gpa.test(line) ||
        line.startsWith('Board of') ||
        line.startsWith('Percentage:') ||
        line.startsWith('CGPA:') ||
        line.length < 10) {
      continue;
    }
    
    // Check if line has university/school/college keywords or has a date range
    if (line.match(/University|Institute|College|School|Academy/i) || 
        PATTERNS.monthYear.test(line) || 
        PATTERNS.yearRange.test(line)) {
      
      // Remove the date portion if present
      let cleanLine = line;
      
      // Try to extract just the institution name before the date
      const dateMatch = line.match(/(.+?)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})/i);
      if (dateMatch) {
        cleanLine = dateMatch[1].trim();
      }
      
      // Remove location if present (after comma)
      if (cleanLine.includes(',')) {
        const parts = cleanLine.split(',');
        // Take first part if it looks like institution name
        if (parts[0].match(/University|Institute|College|School|Academy/i)) {
          institution = parts[0].trim();
        } else {
          institution = cleanLine;
        }
      } else {
        institution = cleanLine;
      }
      break;
    }
  }
  
  // If we still don't have a degree or institution, this might not be valid education
  if (!degree && !institution) return null;
  
  // Extract graduation date
  const { endDate } = extractDates(block);
  const graduationDate = endDate || '';
  
  // Extract GPA or percentage
  const gpaMatch = block.match(PATTERNS.gpa);
  const percentageMatch = block.match(/Percentage:\s*(\d+\.?\d*)%/i);
  const cgpaMatch = block.match(/CGPA:\s*(\d+\.?\d*)/i);
  
  let gpa = undefined;
  if (cgpaMatch) {
    gpa = cgpaMatch[1] + '/10.0';
  } else if (gpaMatch) {
    gpa = gpaMatch[1] + (gpaMatch[2] ? '/' + gpaMatch[2] : '/4.0');
  } else if (percentageMatch) {
    gpa = percentageMatch[1] + '%';
  }
  
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
  
  // Look for skill category patterns like "Languages:", "Web Development:", etc.
  const categoryPattern = /([A-Z][a-zA-Z\s]+):\s*([^\n]+)/g;
  let match;
  
  while ((match = categoryPattern.exec(cleanText)) !== null) {
    const skillsList = match[2];
    // Split by commas
    const items = skillsList.split(',').map(s => s.trim()).filter(s => s);
    
    for (const item of items) {
      // Skip if it looks like a sentence or project name
      if (item.length > 50 || item.split(' ').length > 5) {
        continue;
      }
      
      // Skip if it contains parentheses (likely links or project tech)
      if (item.includes('(') || item.includes(')')) {
        continue;
      }
      
      skills.add(item);
    }
  }
  
  // If no categories found, fall back to simple splitting
  if (skills.size === 0) {
    const items = cleanText.split(/[,|;\n•]+/).map(s => s.trim()).filter(s => s);
    
    for (const item of items) {
      // Skip long sentences (likely descriptions, not skills)
      if (item.length > 50 || item.split(' ').length > 5) {
        continue;
      }
      
      // Clean up and add
      const skill = item.replace(/^[-–—]\s*/, '').trim();
      if (skill && !skill.includes('(') && !skill.includes(')')) {
        skills.add(skill);
      }
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
  
  // Split by lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Skip empty lines and bullets without content
    if (!line || line === '•') {
      i++;
      continue;
    }
    
    const cleanLine = line.replace(/^•\s*/, '');
    
    // Look for pattern where project name is followed by comma-separated tech words
    // Tech lines have: capitals, commas, and known tech terms (not just regular English words)
    const hasCommas = cleanLine.includes(',');
    const startsWithCap = /^[A-Z]/.test(cleanLine);
    const notTooLong = cleanLine.length < 200;
    
    // Check if line contains tech keywords (strong indicator it's a project title line with tech stack)
    const techKeywords = /(NextJS|React|Vue|Angular|Python|Java|JavaScript|TypeScript|Node|Express|MongoDB|PostgreSQL|MySQL|Redis|Docker|Kubernetes|AWS|Azure|GCP|Django|Flask|FastAPI|Spring|Laravel|Rails|Terraform|Ansible|Git|GitHub|Jenkins|HTML|CSS|Sass|TailwindCSS|Bootstrap|GraphQL|API|Webpack|Vite|Pandas|NumPy|TensorFlow|PyTorch|Scikit|Keras|OpenCV|NLTK|Spark|Hadoop|Kafka|RabbitMQ|Nginx|Apache|Linux|Ubuntu|Shell|Bash|C\+\+|C#|\.NET|AKS|Helm|Drizzle|Zustand|Supabase|ORM|SHAP|Gemini)/i;
    const hasTechKeyword = techKeywords.test(cleanLine);
    
    // Description lines typically:
    // - Have verbs like "built", "created", etc.
    // - Start with articles like "A", "An", "The"
    // - Use words like "using", "with", "for"
    const looksLikeDescription = /\b(built|created|developed|engineered|deployed|designed|implemented|managed|increased|reduced|enhanced|optimized|streamlined)\b/i.test(cleanLine) ||
                                 /^(A|An|The)\s/i.test(cleanLine) ||
                                 /\b(using|with|for|to|that|which)\s/i.test(cleanLine);
    
    // Match: has commas, starts with capital, has tech keywords, NOT a description
    const projectMatch = startsWithCap && hasCommas && notTooLong && hasTechKeyword && !looksLikeDescription;
    
    if (projectMatch) {
      const nameAndTech = cleanLine;
      
      // Find where the tech stack starts - look for the first capitalized word after the project name
      // that's followed by a comma or is a known tech
      const words = nameAndTech.split(/\s+/);
      let nameEndIndex = 0;
      
      // Common tech keywords
      const techKeywords = /^(NextJS|React|Vue|Angular|Python|Java|JavaScript|TypeScript|Node|Express|MongoDB|PostgreSQL|MySQL|Redis|Docker|Kubernetes|AWS|Azure|GCP|Django|Flask|FastAPI|Spring|Laravel|Rails|Terraform|Ansible|Git|GitHub|Jenkins|CI|CD|HTML|CSS|Sass|TailwindCSS|Bootstrap|jQuery|GraphQL|REST|API|Webpack|Vite|Babel|ESLint|Jest|Mocha|Cypress|Selenium|Pandas|NumPy|TensorFlow|PyTorch|Scikit|Keras|OpenCV|NLTK|Spark|Hadoop|Kafka|RabbitMQ|Nginx|Apache|Linux|Ubuntu|Debian|CentOS|Shell|Bash|PowerShell|C\+\+|C#|\.NET|Unity|Unreal|Godot|Blender|Photoshop|Illustrator|Figma|Sketch|AdobeXD|InDesign|Premiere|AfterEffects|AKS|Helm|Drizzle|Zustand|Supabase|ORM|SHAP|FastAPI|Gemini)$/i;
      
      for (let w = 0; w < words.length; w++) {
        const word = words[w].replace(/,$/, ''); // Remove trailing comma
        if (techKeywords.test(word)) {
          nameEndIndex = w;
          break;
        }
      }
      
      // If we didn't find a tech keyword, look for where commas start appearing frequently
      if (nameEndIndex === 0) {
        for (let w = 2; w < words.length; w++) { // Start from index 2 (at least 2 words for project name)
          if (words[w].includes(',') || (w < words.length - 1 && words[w + 1].includes(','))) {
            nameEndIndex = w;
            break;
          }
        }
      }
      
      // Fallback: if still no tech stack found, assume first 4 words are name
      if (nameEndIndex === 0) {
        nameEndIndex = Math.min(4, words.length - 1);
      }
      
      const name = words.slice(0, nameEndIndex).join(' ');
      const techPart = words.slice(nameEndIndex).join(' ');
      
      // Extract technologies from the tech part
      const technologies = techPart.split(/[,]+/).map((t: string) => t.trim()).filter((t: string) => 
        t && !t.includes('(') && !t.includes(')') && t.length > 1 && t.length < 50
      );
      
      // Get description from next lines
      let description = '';
      let j = i + 1;
      const descLines: string[] = [];
      while (j < lines.length) {
        const nextLine = lines[j].trim();
        
        // Stop if we hit another project line (has commas and starts with capital)
        const nextClean = nextLine.replace(/^•\s*/, '');
        const isNextProject = /^[A-Z]/.test(nextClean) && nextClean.includes(',') && (nextClean.match(/[A-Z][a-z]+/g) || []).length > 2;
        if (isNextProject) {
          break;
        }
        
        const descLine = nextLine.replace(/^•\s*/, '').trim();
        if (descLine) {
          descLines.push(descLine);
        }
        j++;
      }
      
      description = descLines.join(' ');
      
      // Extract URLs from description
      const urlMatch = description.match(/\(([^)]+)\)/g);
      let url: string | undefined;
      if (urlMatch) {
        // Find GitHub or demo URL
        for (const match of urlMatch) {
          const link = match.slice(1, -1);
          if (link.toLowerCase().includes('github') || 
              link.toLowerCase().includes('demo') ||
              link.toLowerCase().includes('here')) {
            url = link;
            break;
          }
        }
        // Remove URLs from description
        description = description.replace(/\([^)]+\)/g, '').trim();
      }
      
      projects.push({
        name,
        description,
        technologies,
        url,
      });
      
      i = j;
    } else {
      // No match, move to next line
      i++;
    }
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
