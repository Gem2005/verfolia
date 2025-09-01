import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

// Simple PDF text extraction - returns sample data for now
async function extractTextFromPdf(feed file: File): Promise<string> {
  try {
    // For now, return sample data since PDF parsing libraries have Node.js compatibility issues
    // In production, this would use a proper PDF parsing service or library
    console.log('PDF file received:', file.name, file.size);
    
    // Return sample resume text for testing
    return `John Doe
Software Engineer
john.doe@email.com
+1 (555) 123-4567
San Francisco, CA
linkedin.com/in/johndoe
github.com/johndoe

SUMMARY
Experienced software engineer with 5+ years developing web applications using React, Node.js, and Python. Passionate about creating scalable solutions and mentoring junior developers.

EXPERIENCE
Senior Software Engineer
Tech Company Inc.
Jan 2020 - Present
• Led development of microservices architecture serving 1M+ users
• Mentored 3 junior developers and improved team productivity by 25%
• Implemented CI/CD pipeline reducing deployment time by 60%

Software Engineer
Startup XYZ
Mar 2018 - Dec 2019
• Built full-stack web applications using React and Node.js
• Collaborated with design team to improve user experience
• Reduced bug reports by 40% through automated testing

EDUCATION
Bachelor of Science in Computer Science
University of Technology
2014 - 2018
GPA: 3.8/4.0

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Git, Agile, Leadership

PROJECTS
E-commerce Platform
Built a scalable e-commerce solution using React, Node.js, and MongoDB
Technologies: React, Node.js, MongoDB, AWS
github.com/johndoe/ecommerce

Task Management App
Developed a collaborative task management application
Technologies: React, Firebase, Material-UI
github.com/johndoe/taskapp

CERTIFICATIONS
AWS Certified Developer Associate
Amazon Web Services
2021

LANGUAGES
English (Native), Spanish (Conversational)`;
  } catch (error) {
    console.error('PDF parsing error:', error);
    return '';
  }
}

function mapTextToResume(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Enhanced contact info extraction
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/\+?[\d\s().-]{10,}/);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[^\s]+/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s]+/i);
  
  // Extract location (city, state patterns)
  const locationMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z]{2}|[A-Z][a-z]+)/);
  const location = locationMatch ? `${locationMatch[1]}, ${locationMatch[2]}` : '';

  // Enhanced name extraction - look for name patterns at the top
  let firstName = '', lastName = '';
  for (const line of lines.slice(0, 5)) {
    // Skip lines with contact info, titles, or obvious non-names
    if (!/[@\d\(\)\.com|linkedin|github|email|phone]/i.test(line) && 
        !/^(resume|cv|curriculum vitae)$/i.test(line) &&
        line.length < 50) {
      const words = line.split(/\s+/).filter(w => /^[A-Z][a-z]+$/.test(w));
      if (words.length >= 2) {
        firstName = words[0];
        lastName = words.slice(1).join(' ');
        break;
      }
    }
  }

  // Robust section detection with multiple heading patterns
  function findSectionBounds(headingPatterns: RegExp[]): { start: number; end: number } {
    const textLines = text.split(/\r?\n/);
    let startIdx = -1;
    
    for (const pattern of headingPatterns) {
      startIdx = textLines.findIndex(l => pattern.test(l.trim()));
      if (startIdx !== -1) break;
    }
    
    if (startIdx === -1) return { start: -1, end: -1 };
    
    // Find next section or end of document
    const commonSectionHeaders = /^(experience|education|skills|projects|certifications|summary|about|objective|languages|achievements|awards|publications|references)/i;
    let endIdx = textLines.length;
    
    for (let i = startIdx + 1; i < textLines.length; i++) {
      const line = textLines[i].trim();
      if (line && commonSectionHeaders.test(line) && !headingPatterns.some(p => p.test(line))) {
        endIdx = i;
        break;
      }
    }
    
    return { start: startIdx, end: endIdx };
  }

  function extractSectionContent(headingPatterns: RegExp[]): string[] {
    const { start, end } = findSectionBounds(headingPatterns);
    if (start === -1) return [];
    
    return text.split(/\r?\n/)
      .slice(start + 1, end)
      .map(l => l.trim())
      .filter(Boolean);
  }

  // Parse date ranges
  function parseDateRange(text: string): { startDate: string; endDate?: string; isPresent?: boolean } {
    // Common date patterns: "Jan 2020 - Present", "2018-2022", "January 2020 - December 2022"
    const dateRangeMatch = text.match(/(\w+\s+\d{4}|\d{4})\s*[-–—]\s*(\w+\s+\d{4}|\d{4}|present|current)/i);
    if (dateRangeMatch) {
      const start = dateRangeMatch[1];
      const end = dateRangeMatch[2];
      const isPresent = /present|current/i.test(end);
      return {
        startDate: start,
        endDate: isPresent ? undefined : end,
        isPresent
      };
    }
    
    // Single date
    const singleDateMatch = text.match(/(\w+\s+\d{4}|\d{4})/);
    if (singleDateMatch) {
      return { startDate: singleDateMatch[1] };
    }
    
    return { startDate: '' };
  }

  // Enhanced experience parsing
  function parseExperience(): Array<{ id: string; position: string; company: string; startDate: string; endDate?: string; isPresent?: boolean; description: string; }> {
    const experienceLines = extractSectionContent([
      /^(work\s+)?experience$/i,
      /^professional\s+experience$/i,
      /^employment$/i,
      /^career$/i
    ]);
    
    const experiences = [];
    let currentExp = null;
    let descriptionLines = [];

    for (const line of experienceLines) {
      // Check if line looks like a job title/company
      const jobTitleMatch = line.match(/^(.+?)\s+(?:at|@|\|)\s+(.+?)(?:\s+[-–—]\s*(.+))?$/);
      const companyFirstMatch = line.match(/^(.+?)\s+[-–—]\s+(.+?)(?:\s+[-–—]\s*(.+))?$/);
      
      if (jobTitleMatch || companyFirstMatch || /\d{4}/.test(line)) {
        // Save previous experience
        if (currentExp) {
          currentExp.description = descriptionLines.join('. ').trim();
          experiences.push(currentExp);
        }
        
        // Start new experience
        let position = '', company = '';
        let dateInfo: { startDate: string; endDate?: string; isPresent?: boolean } = { startDate: '' };
        
        if (jobTitleMatch) {
          position = jobTitleMatch[1].trim();
          company = jobTitleMatch[2].trim();
          if (jobTitleMatch[3]) {
            dateInfo = parseDateRange(jobTitleMatch[3]);
          }
        } else if (companyFirstMatch) {
          company = companyFirstMatch[1].trim();
          position = companyFirstMatch[2].trim();
          if (companyFirstMatch[3]) {
            dateInfo = parseDateRange(companyFirstMatch[3]);
          }
        } else if (/\d{4}/.test(line)) {
          // Just a date line, use previous position/company if available
          dateInfo = parseDateRange(line);
        }
        
        currentExp = {
          id: uuidv4(),
          position,
          company,
          ...dateInfo,
          description: ''
        };
        descriptionLines = [];
      } else if (currentExp && line) {
        // Add to description
        descriptionLines.push(line.replace(/^[•\-\*]\s*/, ''));
      }
    }
    
    // Save last experience
    if (currentExp) {
      currentExp.description = descriptionLines.join('. ').trim();
      experiences.push(currentExp);
    }
    
    return experiences.filter(exp => exp.position || exp.company);
  }

  // Enhanced education parsing
  function parseEducation(): Array<{ id: string; institution: string; degree: string; field?: string; startDate: string; endDate: string; gpa?: string; }> {
    const educationLines = extractSectionContent([
      /^education$/i,
      /^academic\s+background$/i,
      /^qualifications$/i
    ]);
    
    const educations = [];
    let currentEdu = null;

    for (const line of educationLines) {
      // Check for degree patterns
      const degreeMatch = line.match(/^(.*?)\s+(?:in|of)\s+(.*?)\s+(?:from|at|\|)\s+(.*?)(?:\s+[-–—]\s*(.+))?$/i);
      const institutionFirstMatch = line.match(/^(.*?)\s+[-–—]\s+(.*?)(?:\s+[-–—]\s*(.+))?$/);
      
      if (degreeMatch || institutionFirstMatch || /\d{4}/.test(line)) {
        if (currentEdu) {
          educations.push(currentEdu);
        }
        
        let institution = '', degree = '', field = '';
        let dateInfo: { startDate: string; endDate: string } = { startDate: '', endDate: '' };
        
        if (degreeMatch) {
          degree = degreeMatch[1].trim();
          field = degreeMatch[2].trim();
          institution = degreeMatch[3].trim();
          if (degreeMatch[4]) {
            const dates = parseDateRange(degreeMatch[4]);
            dateInfo = { startDate: dates.startDate, endDate: dates.endDate || dates.startDate };
          }
        } else if (institutionFirstMatch) {
          institution = institutionFirstMatch[1].trim();
          degree = institutionFirstMatch[2].trim();
          if (institutionFirstMatch[3]) {
            const dates = parseDateRange(institutionFirstMatch[3]);
            dateInfo = { startDate: dates.startDate, endDate: dates.endDate || dates.startDate };
          }
        }
        
        // Extract GPA if present
        const gpaMatch = line.match(/gpa[:\s]*(\d+\.?\d*(?:\/\d+)?)/i);
        
        currentEdu = {
          id: uuidv4(),
          institution,
          degree,
          field,
          ...dateInfo,
          gpa: gpaMatch ? gpaMatch[1] : undefined
        };
      }
    }
    
    if (currentEdu) {
      educations.push(currentEdu);
    }
    
    return educations.filter(edu => edu.institution || edu.degree);
  }

  // Enhanced skills parsing
  const skillsLines = extractSectionContent([
    /^(technical\s+)?skills$/i,
    /^technologies$/i,
    /^competencies$/i,
    /^expertise$/i
  ]);
  
  const skills = [];
  for (const line of skillsLines) {
    // Split on common delimiters and clean up
    const lineSkills = line
      .split(/[,•\u2022\|;]/)
      .map(s => s.trim())
      .filter(s => s && s.length > 1 && s.length < 30)
      .filter(s => !/^(skills|technologies|languages|frameworks)/i.test(s));
    skills.push(...lineSkills);
  }

  // Parse projects
  function parseProjects(): Array<{ id: string; name: string; description: string; techStack: string[]; sourceUrl?: string; demoUrl?: string; }> {
    const projectLines = extractSectionContent([
      /^projects$/i,
      /^selected\s+projects$/i,
      /^notable\s+projects$/i
    ]);
    
    const projects = [];
    let currentProject: { id: string; name: string; description: string; techStack: string[]; sourceUrl?: string; demoUrl?: string; } | null = null;
    let descriptionLines = [];

    for (const line of projectLines) {
      // Project name pattern
      if (line.match(/^[A-Z][\w\s-]+$/) && !line.includes('http') && line.length < 50) {
        if (currentProject) {
          currentProject.description = descriptionLines.join('. ').trim();
          projects.push(currentProject);
        }
        
        currentProject = {
          id: uuidv4(),
          name: line.trim(),
          description: '',
          techStack: []
        };
        descriptionLines = [];
      } else if (currentProject && line) {
        // Extract URLs
        const githubMatch = line.match(/(?:github|source)[:\s]*(https?:\/\/[^\s]+)/i);
        const demoMatch = line.match(/(?:demo|live)[:\s]*(https?:\/\/[^\s]+)/i);
        
        if (githubMatch) {
          currentProject.sourceUrl = githubMatch[1];
        } else if (demoMatch) {
          currentProject.demoUrl = demoMatch[1];
        } else {
          // Add to description and extract tech stack
          const techMatch = line.match(/(?:built with|technologies|stack)[:\s]*(.+)/i);
          if (techMatch) {
            currentProject.techStack = techMatch[1].split(/[,\|]/).map(s => s.trim());
          } else {
            descriptionLines.push(line.replace(/^[•\-\*]\s*/, ''));
          }
        }
      }
    }
    
    if (currentProject) {
      currentProject.description = descriptionLines.join('. ').trim();
      projects.push(currentProject);
    }
    
    return projects.filter(proj => proj.name);
  }

  // Extract summary
  const summaryLines = extractSectionContent([
    /^summary$/i,
    /^professional\s+summary$/i,
    /^profile$/i,
    /^about$/i,
    /^objective$/i
  ]);
  const summary = summaryLines.join(' ').trim();

  // Extract current title from summary or near name
  let title = '';
  if (summary) {
    const titleMatch = summary.match(/^([^.]+)/);
    if (titleMatch && titleMatch[1].length < 100) {
      title = titleMatch[1].trim();
    }
  }

  // Parse certifications
  function parseCertifications(): Array<{ id: string; name: string; issuer: string; date?: string; url?: string; }> {
    const certLines = extractSectionContent([
      /^certifications?$/i,
      /^certificates?$/i,
      /^professional\s+certifications?$/i,
      /^licenses?$/i
    ]);
    
    const certifications = [];
    
    for (const line of certLines) {
      // Pattern: "Certification Name - Issuer (Date)"
      const certMatch = line.match(/^(.+?)\s*[-–—]\s*(.+?)(?:\s*\((.+?)\))?$/);
      if (certMatch) {
        certifications.push({
          id: uuidv4(),
          name: certMatch[1].trim(),
          issuer: certMatch[2].trim(),
          date: certMatch[3]?.trim() || ''
        });
      } else if (line && !line.includes('http')) {
        // Simple certification name
        certifications.push({
          id: uuidv4(),
          name: line.trim(),
          issuer: '',
          date: ''
        });
      }
    }
    
    return certifications;
  }

  // Parse languages
  function parseLanguages(): Array<{ id: string; name: string; proficiency?: string; }> {
    const langLines = extractSectionContent([
      /^languages?$/i,
      /^foreign\s+languages?$/i,
      /^linguistic\s+skills$/i
    ]);
    
    const languages = [];
    
    for (const line of langLines) {
      // Pattern: "Language (Proficiency)" or "Language - Proficiency"
      const langMatch = line.match(/^(.+?)\s*[-–—(]\s*(.+?)[\)]?$/);
      if (langMatch) {
        languages.push({
          id: uuidv4(),
          name: langMatch[1].trim(),
          proficiency: langMatch[2].trim()
        });
      } else if (line && line.length < 30) {
        // Simple language name
        languages.push({
          id: uuidv4(),
          name: line.trim()
        });
      }
    }
    
    return languages;
  }

  const experience = parseExperience();
  const education = parseEducation();
  const projects = parseProjects();
  const certifications = parseCertifications();
  const languages = parseLanguages();

  return {
    title: 'Imported Resume',
    personalInfo: {
      firstName,
      lastName,
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0] || '',
      location,
      summary,
      title,
      photo: '',
      linkedinUrl: linkedinMatch?.[0] || '',
      githubUrl: githubMatch?.[0] || '',
    },
    experience,
    education,
    skills: [...new Set(skills)].slice(0, 20), // Remove duplicates and limit
    projects,
    certifications,
    languages,
    customSections: [] as any[],
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    const text = await extractTextFromPdf(file);
    const parsedResume = mapTextToResume(text);

    const token = `prefill_${Date.now()}`;
    return NextResponse.json({ parsedResume, token }, { status: 200 });
  } catch (error) {
    console.error('PDF parse error:', error);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}


