/**
 * AI-Powered Resume Parser using Gemini 2.5 Flash Lite
 * Supports PDF, DOCX, DOC files with automatic conversion
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI lazily (to ensure env vars are loaded)
function getGenAI() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY environment variable is not set. Please add it to your .env.local file.');
  }
  
  return new GoogleGenerativeAI(apiKey);
}

export interface AIResumeData {
  personal_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    location?: string;
    start_date: string;
    end_date: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    gpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date?: string;
    url?: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
  custom_sections: Array<{
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
}

/**
 * Convert DOCX/DOC to PDF using mammoth and pdf-lib
 */
async function convertDocxToPdf(buffer: Buffer): Promise<Buffer> {
  try {
    const mammoth = await import('mammoth');
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    // Extract text from DOCX
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    if (!text || text.trim().length === 0) {
      throw new Error('No text content found in DOCX file');
    }

    // Create PDF from text
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 11;
    const margin = 50;
    const lineHeight = fontSize * 1.5;

    let page = pdfDoc.addPage([595, 842]); // A4 size
    let yPosition = page.getHeight() - margin;

    // Split text into lines
    const lines = text.split('\n');
    
    for (const line of lines) {
      // Check if we need a new page
      if (yPosition < margin + lineHeight) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = page.getHeight() - margin;
      }

      // Wrap long lines
      const maxWidth = page.getWidth() - (2 * margin);
      const words = line.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (textWidth > maxWidth && currentLine) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
          currentLine = word;

          if (yPosition < margin + lineHeight) {
            page = pdfDoc.addPage([595, 842]);
            yPosition = page.getHeight() - margin;
          }
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;
      }
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('DOCX to PDF conversion error:', error);
    throw new Error('Failed to convert DOCX to PDF. Please try uploading a PDF file instead.');
  }
}

/**
 * Parse resume using Gemini AI (2.0 Flash Experimental)
 */
export async function parseResumeWithAI(
  fileBuffer: Buffer,
  fileType: string
): Promise<AIResumeData> {
  try {
    let pdfBuffer = fileBuffer;

    // Convert DOCX/DOC to PDF if needed
    if (fileType === 'docx' || fileType === 'doc') {
      console.log('Converting DOCX/DOC to PDF...');
      pdfBuffer = await convertDocxToPdf(fileBuffer);
      console.log('Conversion successful!');
    }

    // Validate it's a PDF
    if (fileType !== 'pdf' && fileType !== 'docx' && fileType !== 'doc') {
      throw new Error('Unsupported file type. Please upload PDF, DOCX, or DOC files.');
    }

    // Initialize Gemini model (2.5 Flash Lite)
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    // Create comprehensive prompt
    const prompt = `
You are an expert resume parser AI. Extract ALL information from this resume with 100% accuracy and return it as structured JSON.

CRITICAL INSTRUCTIONS:
1. Extract EVERYTHING - don't skip any sections, bullet points, or details
2. For experience descriptions, capture ALL bullet points completely (merge them into description field)
3. **INTERNSHIPS**: If resume has "Internship" section, include them in "experience" array
4. **WORK EXPERIENCE SORTING**: Sort ALL experience entries (jobs + internships) by start_date in DESCENDING order (latest first)
5. For multi-column layouts extract ALL sections
6. For dates, use format "Month YYYY" or "YYYY" (e.g., "February 2024", "2024")
7. Set current: true ONLY for jobs with "Present" or "Current" as end date
8. Extract certifications, projects, skills, and languages if present
9. For phone numbers, keep original format with country code if present
10. For emails, extract exactly as shown
11. For skills, extract individual skills as separate array items (not categories)
12. **EDUCATION**: For "degree" field - extract the FULL qualification name. Examples: "Bachelor of Technology", "Master of Science", "High School Diploma", "Secondary Education Certificate". For high school/secondary education, use the education level name as degree (e.g., "High School Diploma", "Secondary Education") and leave "field" empty or specify stream if mentioned. NEVER use null or empty string for degree.
13. **CUSTOM SECTIONS - CRITICAL**: Extract ALL sections that don't fit standard categories (Experience, Education, Skills, Projects, Certifications, Languages). MANDATORY sections to check for: Achievements, Awards, Honors, Publications, Research, Volunteer Work, Leadership, Extracurricular Activities, Activities, Community Service, Professional Memberships, Conferences, Speaking Engagements, Patents, Hobbies, Interests, References, Additional Information, Training, Workshops, or ANY other non-standard section title. If a section exists in the resume that is NOT Experience/Education/Skills/Projects/Certifications/Languages, it MUST be included in custom_sections. DO NOT skip any extra sections - extract them ALL with their complete content.
14. **AVOID DUPLICATION BETWEEN EXPERIENCE AND CUSTOM SECTIONS**: If a position/role appears in the Work Experience section of the resume, it should ONLY go in "experience" array. If it appears in a Leadership/Activities/Extracurricular section separate from work experience, it should ONLY go in "custom_sections". Do NOT duplicate the same role in both arrays. Pay careful attention to which resume section each item belongs to.
15. **DO NOT DUPLICATE**: Do NOT include Education, Skills, Certifications in custom_sections if they are already in their respective arrays
16. **REMOVE HYPERLINKS**: Do NOT include text like (Try it here), (GitHub), (Link), (View), (Demo), etc. - extract only the actual content

RETURN JSON IN THIS EXACT STRUCTURE:
{
  "personal_info": {
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string (optional)",
    "github": "string (optional)",
    "portfolio": "string (optional)"
  },
  "summary": "string (optional)",
  "experience": [
    {
      "company": "string",
      "position": "string",
      "location": "string (optional)",
      "start_date": "string (format: Month YYYY or YYYY)",
      "end_date": "string (format: Month YYYY or YYYY, or Present)",
      "current": boolean,
      "description": "string (ALL bullet points combined with newlines)"
    }
  ],
  "education": [
    {
      "degree": "string (REQUIRED - full qualification name, e.g., 'Bachelor of Technology', 'Master of Arts', 'High School Diploma', 'Secondary Education Certificate')",
      "field": "string (optional - major/specialization for college, stream for high school, can be empty)",
      "institution": "string (school/college/university name)",
      "location": "string (optional)",
      "start_date": "string (optional, format: YYYY or Month YYYY)",
      "end_date": "string (optional, format: YYYY or Month YYYY)",
      "gpa": "string (optional, include scale if mentioned)"
    }
  ],
  "skills": ["string"],
  "projects": [
    {
      "name": "string",
      "description": "string (remove hyperlink text)",
      "technologies": ["string"],
      "url": "string (optional, actual URL only)"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string (optional)",
      "url": "string (optional)"
    }
  ],
  "languages": [
    {
      "language": "string",
      "proficiency": "string (e.g., 'Native', 'Fluent', 'Professional', 'Intermediate', 'Basic')"
    }
  ],
  "custom_sections": [
    {
      "title": "string (REQUIRED - exact section name from resume e.g., 'Achievements', 'Awards', 'Leadership & Activities', 'Honors', 'Publications', 'Volunteer Work', 'Research', 'Extracurricular Activities', 'Professional Memberships', 'Conferences', 'Patents', 'Additional Information', or ANY other non-standard section)",
      "items": [
        {
          "title": "string (optional, main heading/name)",
          "subtitle": "string (optional, organization/institution)",
          "description": "string (optional, complete description)",
          "date": "string (optional, format: Month YYYY or YYYY)",
          "location": "string (optional, city/country)",
          "details": ["string (optional, array of bullet points if applicable)"]
        }
      ]
    }
  ]
}

EXAMPLES OF CORRECT EXTRACTION:

**Education (handle ALL types correctly):**
[
  {
    "degree": "Bachelor of Technology",
    "field": "Computer Science and Engineering",
    "institution": "Massachusetts Institute of Technology",
    "location": "Cambridge, MA",
    "start_date": "September 2020",
    "end_date": "May 2024",
    "gpa": "3.8/4.0"
  },
  {
    "degree": "High School Diploma",
    "field": "Science Stream",
    "institution": "Lincoln High School",
    "location": "Portland, OR",
    "start_date": "2016",
    "end_date": "2020",
    "gpa": "3.9/4.0"
  },
  {
    "degree": "Secondary Education Certificate",
    "field": "",
    "institution": "Springfield Secondary School",
    "location": "Illinois",
    "start_date": "2014",
    "end_date": "2018"
  }
]

**Skills (individual items, not grouped):**
["Python", "JavaScript", "React", "Node.js", "Docker", "AWS", "MongoDB", "Git", "Machine Learning", "Data Analysis"]

**Experience (sorted latest first, internships included, no hyperlink text):**
[
  {
    "company": "TechCorp Solutions",
    "position": "Senior Software Engineer",
    "location": "San Francisco, CA",
    "start_date": "June 2024",
    "end_date": "Present",
    "current": true,
    "description": "Developed microservices architecture handling 1M+ daily requests using Node.js and Docker.\nImplemented CI/CD pipeline reducing deployment time by 60%.\nLed team of 4 engineers in building scalable REST APIs."
  },
  {
    "company": "InnovateLabs Inc",
    "position": "Software Development Intern",
    "location": "Remote",
    "start_date": "May 2023",
    "end_date": "August 2023",
    "current": false,
    "description": "Built full-stack web application using React and Express.js serving 10,000+ users.\nCollaborated with design team to improve user experience, increasing engagement by 35%.\nImplemented authentication system using JWT and OAuth 2.0."
  }
]

**Projects (remove all hyperlink references):**
[
  {
    "name": "Real-Time Chat Application",
    "description": "Built a scalable chat application using WebSocket for real-time communication and Redis for message queue management. Supports 1000+ concurrent users with sub-100ms latency.",
    "technologies": ["React", "Node.js", "WebSocket", "Redis", "MongoDB"],
    "url": "https://github.com/example/chat-app"
  },
  {
    "name": "AI-Powered Resume Parser",
    "description": "Developed an intelligent resume parsing system using Gemini AI to extract structured data from PDF and DOCX files with 95% accuracy.",
    "technologies": ["Python", "Google AI", "FastAPI", "PostgreSQL"]
  }
]

**Custom Sections (flexible structure for achievements, leadership, volunteer work):**
[
  {
    "title": "Achievements",
    "items": [
      {
        "title": "First Prize - National Tech Innovation Challenge 2024",
        "description": "Ranked 1st out of 25,000+ participants in a national-level hackathon. Developed a machine learning model achieving 96% accuracy for predictive healthcare analytics.",
        "date": "March 2024",
        "location": "Boston, MA"
      },
      {
        "title": "Dean's List Recognition",
        "description": "Honored for academic excellence with GPA above 3.7 for 6 consecutive semesters.",
        "date": "2021 - 2024"
      }
    ]
  },
  {
    "title": "Leadership & Activities",
    "items": [
      {
        "title": "President",
        "subtitle": "Computer Science Society",
        "date": "September 2023 - May 2024",
        "location": "University Campus",
        "description": "Led organization of technical workshops and coding competitions for 200+ members.",
        "details": [
          "Organized 15+ technical workshops with 500+ total attendees",
          "Managed team of 12 executive board members",
          "Increased society membership by 45% through outreach initiatives"
        ]
      },
      {
        "title": "Team Captain",
        "subtitle": "University Coding Club",
        "date": "2022 - 2023",
        "description": "Coached students for competitive programming contests, achieving top 10 regional rankings."
      }
    ]
  },
  {
    "title": "Volunteer Work",
    "items": [
      {
        "title": "Programming Instructor",
        "subtitle": "Code for Community Initiative",
        "date": "January 2023 - Present",
        "location": "San Francisco, CA",
        "description": "Teaching programming fundamentals to underprivileged high school students.",
        "details": [
          "Conducted weekly coding sessions for 30+ students",
          "Developed comprehensive Python curriculum covering basics to intermediate topics",
          "Mentored 5 students who went on to pursue computer science degrees"
        ]
      }
    ]
  }
]

CRITICAL REMINDERS:
- For education: ALWAYS extract a proper degree name (e.g., "High School Diploma", "Bachelor of Science"). NEVER leave degree as null or empty.
- For high school/secondary education: Use "High School Diploma" or "Secondary Education Certificate" as the degree.
- Sort all experience entries by date (latest first).
- Remove ALL hyperlink text like (Try it here), (GitHub), (Link), (Demo), (View).
- Combine internships into the experience array, not separate.
- **NO DUPLICATION BETWEEN EXPERIENCE AND CUSTOM SECTIONS**: Carefully check the resume structure. If an item is listed under "Work Experience" or "Professional Experience", put it ONLY in the "experience" array. If it's listed under "Leadership & Activities", "Extracurricular Activities", or similar non-work sections, put it ONLY in "custom_sections". The same role should NEVER appear in both arrays.
- **CUSTOM SECTIONS PRIORITY**: Scan the ENTIRE resume for ANY section that is NOT Experience, Education, Skills, Projects, Certifications, or Languages. Extract ALL such sections into custom_sections with their complete content. Common examples: Achievements, Awards, Honors, Leadership & Activities, Volunteer Work, Publications, Research, Extracurricular Activities, Professional Memberships, Conferences, Speaking Engagements, Patents, Workshops, Training, Additional Information, References, Hobbies, Interests. DO NOT SKIP ANY extra sections - they are critical resume content.
- Custom sections should preserve detailed structure with items array for maximum flexibility.

Extract all data with maximum accuracy and completeness.
`;

    // Convert PDF buffer to base64
    const base64PDF = pdfBuffer.toString('base64');

    console.log('Sending resume to Gemini AI for parsing...');

    // Generate content with PDF
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64PDF
        }
      }
    ]);

    const response = result.response.text();
    console.log('AI Response received, parsing JSON...');

    // Parse JSON response
    let parsedData: AIResumeData;
    try {
      parsedData = JSON.parse(response);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', response.substring(0, 500));
      throw new Error('AI returned invalid JSON. Please try again.');
    }

    // Validate required fields
    if (!parsedData.personal_info?.first_name || !parsedData.personal_info?.last_name) {
      throw new Error('Failed to extract name from resume. Please ensure the resume has clear contact information.');
    }

    console.log('✅ Resume parsed successfully with Gemini AI!');
    return parsedData;
  } catch (error) {
    console.error('AI Resume Parsing Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse resume with AI. Please try again or upload a different file.');
  }
}

/**
 * Validate and normalize AI response
 */
export function validateAIResumeData(data: AIResumeData): {
  isValid: boolean;
  warnings: string[];
  data: AIResumeData;
} {
  const warnings: string[] = [];

  // Normalize data
  const normalized: AIResumeData = {
    personal_info: data.personal_info || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      location: '',
    },
    summary: data.summary || '',
    experience: data.experience || [],
    education: data.education || [],
    skills: data.skills || [],
    projects: data.projects || [],
    certifications: data.certifications || [],
    languages: data.languages || [],
    custom_sections: data.custom_sections || [],
  };

  // Check for warnings
  if (!normalized.personal_info.email) {
    warnings.push('Email address not found');
  }
  if (!normalized.personal_info.phone) {
    warnings.push('Phone number not found');
  }
  if (normalized.experience.length === 0) {
    warnings.push('No work experience found');
  }
  if (normalized.education.length === 0) {
    warnings.push('No education found');
  }
  if (normalized.skills.length === 0) {
    warnings.push('No skills found');
  }

  return {
    isValid: normalized.personal_info.first_name && normalized.personal_info.last_name ? true : false,
    warnings,
    data: normalized,
  };
}
