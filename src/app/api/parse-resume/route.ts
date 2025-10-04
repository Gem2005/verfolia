import { NextRequest, NextResponse } from 'next/server';
import { parseResume, type ParsedResume } from '@/utils/resume-parser';

export const runtime = 'nodejs';

// Configuration constants
const CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/plain',
    'application/rtf',
    'application/vnd.oasis.opendocument.text', // .odt
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.txt', '.rtf', '.odt'],
} as const;

// Error types for better error handling
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ParsingError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'ParsingError';
  }
}

// Utility functions
function validateFile(file: File): void {
  // Check file size
  if (file.size > CONFIG.MAX_FILE_SIZE) {
    throw new ValidationError(
      `File size exceeds maximum allowed size of ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  // Check file extension
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!extension || !CONFIG.ALLOWED_EXTENSIONS.includes(extension as any)) {
    throw new ValidationError(
      `File type not supported. Allowed types: ${CONFIG.ALLOWED_EXTENSIONS.join(', ')}`
    );
  }

  // Check MIME type
  if (!CONFIG.ALLOWED_MIME_TYPES.includes(file.type as any)) {
    console.warn(`MIME type mismatch: ${file.type} for file ${file.name}`);
  }
}

function getFileExtension(filename: string): string {
  return filename.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
}

// Convert ParsedResume to API response format
function formatResumeResponse(parsed: ParsedResume) {
  return {
    personal_info: {
      first_name: parsed.personalInfo.firstName || '',
      last_name: parsed.personalInfo.lastName || '',
      email: parsed.personalInfo.email || '',
      phone: parsed.personalInfo.phone || '',
      location: parsed.personalInfo.location || '',
      linkedin: parsed.personalInfo.linkedin || '',
      github: parsed.personalInfo.github || '',
      website: parsed.personalInfo.portfolio || '',
    },
    summary: parsed.summary || '',
    experience: parsed.experience.map(exp => ({
      position: exp.position,
      company: exp.company,
      location: exp.location,
      start_date: exp.startDate,
      end_date: exp.endDate,
      current: exp.current || false,
      description: exp.description,
    })),
    education: parsed.education.map(edu => ({
      degree: edu.degree,
      field: edu.field,
      institution: edu.institution,
      location: edu.location,
      start_date: edu.startDate,
      end_date: edu.endDate,
      graduation_date: edu.graduationDate,
      gpa: edu.gpa,
    })),
    skills: parsed.skills.map(skill => ({
      name: skill,
      category: '', // Can be enhanced with categorization
    })),
    projects: parsed.projects.map(proj => ({
      name: proj.name,
      description: proj.description,
      technologies: proj.technologies,
      url: proj.url,
    })),
    certifications: parsed.certifications.map(cert => ({
      name: cert.name,
      issuer: cert.issuer || '',
      date: cert.date || '',
      credential_id: cert.credentialId,
    })),
    languages: parsed.languages.map(lang => ({
      name: lang.language,
      proficiency: lang.proficiency,
    })),
    awards: [], // Can be added in future phases
    interests: [], // Can be added in future phases
  };
}

// Generate markdown from parsed resume
function generateMarkdown(parsed: ParsedResume): string {
  const sections: string[] = [];

  // Personal Info
  const fullName = [parsed.personalInfo.firstName, parsed.personalInfo.lastName]
    .filter(Boolean)
    .join(' ');
    
  if (fullName) {
    sections.push(`# ${fullName}\n`);
    const contactInfo: string[] = [];
    if (parsed.personalInfo.email) contactInfo.push(`📧 ${parsed.personalInfo.email}`);
    if (parsed.personalInfo.phone) contactInfo.push(`📱 ${parsed.personalInfo.phone}`);
    if (parsed.personalInfo.location) contactInfo.push(`📍 ${parsed.personalInfo.location}`);
    if (parsed.personalInfo.linkedin) contactInfo.push(`[LinkedIn](${parsed.personalInfo.linkedin})`);
    if (parsed.personalInfo.github) contactInfo.push(`[GitHub](${parsed.personalInfo.github})`);
    if (contactInfo.length) sections.push(contactInfo.join(' • ') + '\n');
  }

  // Summary
  if (parsed.summary) {
    sections.push(`## Summary\n\n${parsed.summary}\n`);
  }

  // Experience
  if (parsed.experience.length > 0) {
    sections.push('## Experience\n');
    parsed.experience.forEach(exp => {
      sections.push(`### ${exp.position} at ${exp.company}`);
      const details: string[] = [];
      if (exp.location) details.push(exp.location);
      if (exp.startDate) {
        details.push(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'N/A'}`);
      }
      if (details.length) sections.push(details.join(' | '));
      if (exp.description) sections.push(`\n${exp.description}\n`);
    });
  }

  // Education
  if (parsed.education.length > 0) {
    sections.push('## Education\n');
    parsed.education.forEach(edu => {
      const degreeField = [edu.degree, edu.field].filter(Boolean).join(' in ');
      sections.push(`### ${degreeField || 'Education'}`);
      if (edu.institution) sections.push(edu.institution);
      const details: string[] = [];
      if (edu.location) details.push(edu.location);
      if (edu.startDate && edu.endDate) {
        details.push(`${edu.startDate} - ${edu.endDate}`);
      } else if (edu.graduationDate) {
        details.push(edu.graduationDate);
      }
      if (edu.gpa) details.push(`GPA: ${edu.gpa}`);
      if (details.length) sections.push(details.join(' | '));
      sections.push('');
    });
  }

  // Skills
  if (parsed.skills.length > 0) {
    sections.push(`## Skills\n\n${parsed.skills.join(', ')}\n`);
  }

  // Projects
  if (parsed.projects.length > 0) {
    sections.push('## Projects\n');
    parsed.projects.forEach(proj => {
      sections.push(`### ${proj.name}`);
      if (proj.technologies.length) sections.push(`**Technologies:** ${proj.technologies.join(', ')}`);
      if (proj.description) sections.push(`\n${proj.description}`);
      if (proj.url) sections.push(`\n[View Project](${proj.url})`);
      sections.push('');
    });
  }

  // Certifications
  if (parsed.certifications.length > 0) {
    sections.push('## Certifications\n');
    parsed.certifications.forEach(cert => {
      const certLine = [cert.name, cert.issuer, cert.date].filter(Boolean).join(' - ');
      sections.push(`- ${certLine}`);
    });
    sections.push('');
  }

  // Languages
  if (parsed.languages.length > 0) {
    sections.push('## Languages\n');
    parsed.languages.forEach(lang => {
      sections.push(`- ${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ''}`);
    });
  }

  return sections.join('\n');
}

// Main POST handler
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse form data
    const formData = await request.formData();
    const fileData = formData.get('file');

    // Validate file presence
    if (!fileData || !(fileData instanceof File)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No file uploaded',
          error_type: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate file
    try {
      validateFile(fileData);
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            error_type: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Log parsing start
    console.log(`[Parse Resume] Starting parse for file: ${fileData.name} (${fileData.size} bytes)`);

    // Parse resume using universal parser
    let parsed: ParsedResume;
    try {
      parsed = await parseResume(fileData);
    } catch (error) {
      console.error('[Parse Resume] Parsing failed:', error);
      throw new ParsingError(
        'Failed to parse resume file. The file may be corrupted or in an unsupported format.',
        error
      );
    }

    // Generate response
    const response = {
      success: true,
      data: {
        filename: fileData.name,
        file_type: getFileExtension(fileData.name),
        file_size: fileData.size,
        parsed_resume: formatResumeResponse(parsed),
        editor_markdown: generateMarkdown(parsed),
        warnings: parsed.metadata.warnings || [],
        metadata: {
          parsed_at: new Date().toISOString(),
          processing_time_ms: Date.now() - startTime,
        },
      },
    };

    console.log(
      `[Parse Resume] Successfully parsed ${fileData.name} in ${Date.now() - startTime}ms`
    );

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Parse Resume] Unexpected error:', error);

    // Handle different error types
    if (error instanceof ParsingError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          error_type: 'PARSING_ERROR',
          details: process.env.NODE_ENV === 'development' ? String(error.originalError) : undefined,
        },
        { status: 422 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while parsing the resume',
        error_type: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

