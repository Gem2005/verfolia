// This file cleans up text and figures out what section is what in a resume

// Clean up messy text from PDFs and other sources
export function normalizeText(text: string): string {
  let normalized = text;
  
  // Get rid of excessive spaces
  normalized = normalized.replace(/[ \t]+/g, ' ');
  
  // Clean up too many line breaks but keep paragraph structure
  normalized = normalized.replace(/\n{3,}/g, '\n\n');
  
  // Make all bullet points consistent
  normalized = normalized.replace(/[•·∙●○◦▪▫■□▸▹►▻⦿⦾]/g, '•');
  normalized = normalized.replace(/^[\-\*]\s/gm, '• ');
  
  // Standardize date formats (MM-YYYY or MM/YYYY) so they're easier to parse later
  // But be careful not to match phone numbers! Use word boundaries and context
  normalized = normalized.replace(/\b(\d{1,2})\s*[/\-–—]\s*(\d{4})\b/g, (match, m, y) => {
    // Only replace if it looks like a date (month is 1-12)
    const month = parseInt(m);
    if (month >= 1 && month <= 12) {
      return `${m}/${y}`;
    }
    return match; // Keep original if not a valid month
  });
  
  // Remove those annoying page numbers
  normalized = normalized.replace(/^\d+\s*$/gm, '');
  
  // Clean up each line
  normalized = normalized.split('\n').map(line => line.trim()).join('\n');
  
  return normalized.trim();
}

// This is what we're looking for in a resume
export interface ResumeSections {
  contact: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
  certifications: string;
  languages: string;
  customSections: Array<{ title: string; content: string }>;
}

// Patterns to look for when finding section headers
const SECTION_PATTERNS = {
  contact: /^(contact|personal\s+information|contact\s+information)/i,
  summary: /^(summary|objective|profile|about\s+me|professional\s+summary|career\s+objective)/i,
  experience: /^(experience|work\s+experience|employment|professional\s+experience|work\s+history|career\s+history)/i,
  education: /^(education|academic|qualifications|academic\s+background|educational\s+background)/i,
  skills: /^(skills|technical\s+skills|core\s+competencies|expertise|technologies|competencies)/i,
  projects: /^(projects|personal\s+projects|portfolio|side\s+projects)/i,
  certifications: /^(certifications?|certificates?|licenses?|credentials?)/i,
  languages: /^(languages?|language\s+proficiency)/i,
  awards: /^(awards?|achievements?|honors?|recognitions?)/i,
  volunteer: /^(volunteer|volunteering|community\s+service)/i,
  publications: /^(publications?|papers?|research)/i,
};

// Figure out which parts of the resume are which sections
export function detectSections(text: string): ResumeSections {
  const lines = text.split('\n');
  const sections: ResumeSections = {
    contact: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: '',
    certifications: '',
    languages: '',
    customSections: [],
  };
  
  let currentSection: keyof ResumeSections | 'custom' | null = null;
  let currentCustomTitle = '';
  let buffer: string[] = [];
  
  // The first few lines are usually contact info - name, email, phone, etc.
  // We need to find where the contact section ends and real sections begin
  let contactEndIndex = 0;
  const maxContactLines = 15; // Don't search beyond this
  
  // Look for the first section header or stop at max lines
  // Start from line 1 (skip line 0 which is usually the name)
  for (let i = 1; i < Math.min(maxContactLines, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this line is a section header
    let isSectionHeader = false;
    for (const pattern of Object.values(SECTION_PATTERNS)) {
      if (pattern.test(line)) {
        isSectionHeader = true;
        break;
      }
    }
    
    // Also check for ALL CAPS headers (but they need to be reasonable section names)
    // Don't treat short ALL CAPS as headers if they're likely just a name
    if (!isSectionHeader && line.length > 5 && line.length < 50 && line === line.toUpperCase() && /^[A-Z\s&]+$/.test(line)) {
      // Make sure it's not just a 1-2 word name (likely contact info)
      const words = line.split(/\s+/);
      if (words.length >= 2 && line.length > 10) {
        isSectionHeader = true;
      }
    }
    
    if (isSectionHeader) {
      contactEndIndex = i;
      break;
    }
  }
  
  // If we didn't find a section header in the first few lines, use the first 3-4 lines as contact
  // But only if contactEndIndex is still 0
  if (contactEndIndex === 0) {
    contactEndIndex = Math.min(4, lines.length);
  }
  
  const potentialContact = lines.slice(0, contactEndIndex).join('\n');
  
  // Check if we actually found contact details
  const hasEmail = /[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(potentialContact);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(potentialContact);
  
  if (hasEmail || hasPhone) {
    sections.contact = potentialContact;
  }
  
  // Now go through the rest and find all the sections
  for (let i = contactEndIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      if (buffer.length > 0) {
        buffer.push('');
      }
      continue;
    }
    
    // See if this line is a section header
    let foundSection = false;
    
    // Check standard patterns first (works with any case)
    for (const [sectionName, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(line)) {
        // Save what we were working on before
        if (currentSection && buffer.length > 0) {
          const content = buffer.join('\n').trim();
          if (currentSection === 'custom') {
            sections.customSections.push({
              title: currentCustomTitle,
              content,
            });
          } else if (currentSection !== 'customSections') {
            sections[currentSection] = content;
          }
        }
        
        // Start collecting content for this new section
        if (sectionName in sections && sectionName !== 'awards' && sectionName !== 'volunteer' && sectionName !== 'publications') {
          currentSection = sectionName as keyof ResumeSections;
        } else {
          currentSection = 'custom';
          currentCustomTitle = line;
        }
        
        buffer = [];
        foundSection = true;
        break;
      }
    }
    
    // If we didn't match a known section but it looks like a header (short, ALL CAPS),
    // treat it as a custom section
    if (!foundSection && line.length < 50 && line === line.toUpperCase() && /^[A-Z\s&]+$/.test(line)) {
      // Save what we had before
      if (currentSection && buffer.length > 0) {
        const content = buffer.join('\n').trim();
        if (currentSection === 'custom') {
          sections.customSections.push({
            title: currentCustomTitle,
            content,
          });
        } else if (currentSection !== 'customSections') {
          sections[currentSection] = content;
        }
      }
      
      currentSection = 'custom';
      currentCustomTitle = line;
      buffer = [];
    } else if (!foundSection) {
      buffer.push(line);
    }
  }
  
  // Don't forget to save whatever section we were working on at the end
  if (currentSection && buffer.length > 0) {
    const content = buffer.join('\n').trim();
    if (currentSection === 'custom') {
      sections.customSections.push({
        title: currentCustomTitle,
        content,
      });
    } else if (currentSection !== 'customSections') {
      sections[currentSection] = content;
    }
  }
  
  return sections;
}

// Break text into logical chunks - makes it easier to process
export function splitIntoBlocks(text: string): string[] {
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
    
    // When we hit a bullet point, start a new block
    if (trimmed.startsWith('•') && currentBlock.length > 0) {
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
