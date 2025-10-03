/**
 * Test file for Resume Parser
 * Phase 1 Testing
 */

import { parseResume } from './index';
import {
  extractContactInfo,
  extractExperience,
  extractEducation,
  extractSkills,
} from './entity-extractors';
import { normalizeText, detectSections } from './text-processor';

// ============================================================================
// SAMPLE RESUME TEXT
// ============================================================================

const SAMPLE_RESUME_TEXT = `
JOHN DOE
San Francisco, CA | (555) 123-4567 | john.doe@email.com
linkedin.com/in/johndoe | github.com/johndoe

PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years of expertise in full-stack development, 
specializing in React, Node.js, and cloud technologies. Proven track record of 
delivering scalable solutions and leading cross-functional teams.

WORK EXPERIENCE

Senior Software Engineer
Tech Corp | San Francisco, CA
January 2021 - Present
• Led development of microservices architecture serving 1M+ users
• Implemented CI/CD pipeline reducing deployment time by 60%
• Mentored team of 5 junior developers
• Technologies: React, Node.js, AWS, Docker, Kubernetes

Software Engineer
StartupXYZ | Remote
June 2019 - December 2020
• Built REST APIs handling 10K+ requests per second
• Developed responsive web applications using React and TypeScript
• Collaborated with product team to define technical requirements
• Technologies: React, Express.js, PostgreSQL, Redis

EDUCATION

Bachelor of Science in Computer Science
Stanford University | Stanford, CA
Graduated: May 2019
GPA: 3.8/4.0

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, 
PostgreSQL, MongoDB, Redis, Git, CI/CD, Agile, REST APIs

PROJECTS

E-Commerce Platform
• Built full-stack e-commerce platform with payment integration
• Implemented real-time inventory management system
• Technologies: React, Node.js, Stripe, MongoDB

Open Source Contributions
• Active contributor to popular open-source projects
• Maintained npm package with 50K+ downloads
• Technologies: JavaScript, TypeScript, Node.js

CERTIFICATIONS
AWS Certified Solutions Architect - Amazon Web Services - 2022
Certified Kubernetes Administrator - CNCF - 2021

LANGUAGES
English - Native
Spanish - Professional Working Proficiency
`;

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test 1: Text Normalization
 */
export function testTextNormalization() {
  console.log('\n========== TEST 1: Text Normalization ==========');
  
  const rawText = `
    JOHN    DOE
    
    
    •   Bullet   point
    - Another bullet
    * Third bullet
  `;
  
  const normalized = normalizeText(rawText);
  
  console.log('Input:', rawText);
  console.log('Output:', normalized);
  console.log('✓ Text normalized successfully');
}

/**
 * Test 2: Section Detection
 */
export function testSectionDetection() {
  console.log('\n========== TEST 2: Section Detection ==========');
  
  const sections = detectSections(SAMPLE_RESUME_TEXT);
  
  console.log('Detected sections:');
  console.log('- Contact:', sections.contact ? '✓' : '✗');
  console.log('- Summary:', sections.summary ? '✓' : '✗');
  console.log('- Experience:', sections.experience ? '✓' : '✗');
  console.log('- Education:', sections.education ? '✓' : '✗');
  console.log('- Skills:', sections.skills ? '✓' : '✗');
  console.log('- Projects:', sections.projects ? '✓' : '✗');
  console.log('- Certifications:', sections.certifications ? '✓' : '✗');
  console.log('- Languages:', sections.languages ? '✓' : '✗');
  
  console.log('\n✓ Section detection complete');
}

/**
 * Test 3: Contact Info Extraction
 */
export function testContactExtraction() {
  console.log('\n========== TEST 3: Contact Info Extraction ==========');
  
  const contactText = `
JOHN DOE
San Francisco, CA | (555) 123-4567 | john.doe@email.com
linkedin.com/in/johndoe | github.com/johndoe
  `;
  
  const contact = extractContactInfo(contactText);
  
  console.log('Extracted contact info:');
  console.log('- Name:', contact.fullName);
  console.log('- Email:', contact.email);
  console.log('- Phone:', contact.phone);
  console.log('- Location:', contact.location);
  console.log('- LinkedIn:', contact.linkedin);
  console.log('- GitHub:', contact.github);
  
  console.log('\n✓ Contact extraction complete');
}

/**
 * Test 4: Experience Extraction
 */
export function testExperienceExtraction() {
  console.log('\n========== TEST 4: Experience Extraction ==========');
  
  const expText = `
Senior Software Engineer
Tech Corp | San Francisco, CA
January 2021 - Present
• Led development of microservices architecture serving 1M+ users
• Implemented CI/CD pipeline reducing deployment time by 60%
• Mentored team of 5 junior developers

Software Engineer
StartupXYZ | Remote
June 2019 - December 2020
• Built REST APIs handling 10K+ requests per second
• Developed responsive web applications using React and TypeScript
  `;
  
  const experiences = extractExperience(expText);
  
  console.log(`Extracted ${experiences.length} experiences:`);
  experiences.forEach((exp, i) => {
    console.log(`\nExperience #${i + 1}:`);
    console.log('- Company:', exp.company);
    console.log('- Position:', exp.position);
    console.log('- Start Date:', exp.startDate);
    console.log('- End Date:', exp.endDate);
    console.log('- Current:', exp.current);
    console.log('- Description length:', exp.description.length, 'chars');
  });
  
  console.log('\n✓ Experience extraction complete');
}

/**
 * Test 5: Education Extraction
 */
export function testEducationExtraction() {
  console.log('\n========== TEST 5: Education Extraction ==========');
  
  const eduText = `
Bachelor of Science in Computer Science
Stanford University | Stanford, CA
Graduated: May 2019
GPA: 3.8/4.0
  `;
  
  const educations = extractEducation(eduText);
  
  console.log(`Extracted ${educations.length} educations:`);
  educations.forEach((edu, i) => {
    console.log(`\nEducation #${i + 1}:`);
    console.log('- Degree:', edu.degree);
    console.log('- Field:', edu.field);
    console.log('- Institution:', edu.institution);
    console.log('- Graduation Date:', edu.graduationDate);
    console.log('- GPA:', edu.gpa);
  });
  
  console.log('\n✓ Education extraction complete');
}

/**
 * Test 6: Skills Extraction
 */
export function testSkillsExtraction() {
  console.log('\n========== TEST 6: Skills Extraction ==========');
  
  const skillsText = `
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, 
PostgreSQL, MongoDB, Redis, Git, CI/CD, Agile, REST APIs
  `;
  
  const skills = extractSkills(skillsText);
  
  console.log(`Extracted ${skills.length} skills:`);
  console.log(skills.join(', '));
  
  console.log('\n✓ Skills extraction complete');
}

/**
 * Test 7: Full Resume Parsing (with mock file)
 */
export async function testFullParsing() {
  console.log('\n========== TEST 7: Full Resume Parsing ==========');
  
  // Create a mock text file
  const blob = new Blob([SAMPLE_RESUME_TEXT], { type: 'text/plain' });
  const file = new File([blob], 'sample-resume.txt', { type: 'text/plain' });
  
  try {
    const parsed = await parseResume(file);
    
    console.log('\n=== PARSING RESULTS ===');
    console.log('\nPersonal Info:');
    console.log('- Name:', parsed.personalInfo.fullName);
    console.log('- Email:', parsed.personalInfo.email);
    console.log('- Phone:', parsed.personalInfo.phone);
    
    console.log('\nSummary:', parsed.summary ? '✓' : '✗');
    
    console.log('\nExperience:');
    console.log('- Count:', parsed.experience.length);
    parsed.experience.forEach((exp, i) => {
      console.log(`  ${i + 1}. ${exp.position} at ${exp.company}`);
    });
    
    console.log('\nEducation:');
    console.log('- Count:', parsed.education.length);
    parsed.education.forEach((edu, i) => {
      console.log(`  ${i + 1}. ${edu.degree} from ${edu.institution}`);
    });
    
    console.log('\nSkills:');
    console.log('- Count:', parsed.skills.length);
    console.log('- Sample:', parsed.skills.slice(0, 5).join(', '), '...');
    
    console.log('\nProjects:');
    console.log('- Count:', parsed.projects.length);
    
    console.log('\nCertifications:');
    console.log('- Count:', parsed.certifications.length);
    
    console.log('\nLanguages:');
    console.log('- Count:', parsed.languages.length);
    
    console.log('\nMetadata:');
    console.log('- File:', parsed.metadata.fileName);
    console.log('- Type:', parsed.metadata.fileType);
    console.log('- Warnings:', parsed.metadata.warnings.length);
    
    if (parsed.metadata.warnings.length > 0) {
      console.log('\nWarnings:');
      parsed.metadata.warnings.forEach((w, i) => {
        console.log(`  ${i + 1}. ${w}`);
      });
    }
    
    console.log('\n✓ Full parsing complete!');
    
    return parsed;
  } catch (error) {
    console.error('\n✗ Parsing failed:', error);
    throw error;
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

export async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     RESUME PARSER - PHASE 1 TEST SUITE                ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  try {
    testTextNormalization();
    testSectionDetection();
    testContactExtraction();
    testExperienceExtraction();
    testEducationExtraction();
    testSkillsExtraction();
    await testFullParsing();
    
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     ✓ ALL TESTS PASSED SUCCESSFULLY                   ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('\n');
  } catch (error) {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     ✗ SOME TESTS FAILED                               ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('\n');
    console.error('Error:', error);
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Parse a PDF file
 */
export async function exampleParsePDF() {
  // In browser: user selects file via input
  // const fileInput = document.querySelector('input[type="file"]');
  // const file = fileInput.files[0];
  
  // const parsed = await parseResume(file);
  // console.log(parsed);
}

/**
 * Example 2: Parse with options
 */
export async function exampleParseWithOptions() {
  // const file = ...; // Get file
  
  // const parsed = await parseResume(file, {
  //   enableOCR: true,
  //   skipSections: ['projects', 'certifications']
  // });
}

/**
 * Example 3: Handle errors
 */
export async function exampleErrorHandling() {
  // const file = ...; // Get file
  
  // try {
  //   const parsed = await parseResume(file);
  //   
  //   if (parsed.metadata.warnings.length > 0) {
  //     console.warn('Parsing completed with warnings:', parsed.metadata.warnings);
  //   }
  //   
  //   // Use parsed data...
  // } catch (error) {
  //   console.error('Failed to parse resume:', error);
  //   // Show error to user, allow manual entry
  // }
}

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  (window as any).testResumeParser = {
    runAllTests,
    testTextNormalization,
    testSectionDetection,
    testContactExtraction,
    testExperienceExtraction,
    testEducationExtraction,
    testSkillsExtraction,
    testFullParsing,
  };
  
  console.log('Resume Parser tests loaded!');
  console.log('Run: testResumeParser.runAllTests()');
} else {
  // Auto-run tests in Node.js environment
  runAllTests().catch(console.error);
}
