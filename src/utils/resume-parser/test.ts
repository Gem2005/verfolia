/**
 * Test file for Resume Parser
 * Phase 1 Testing
 */

import { parseResume } from './index';

// ============================================================================
// TEST FUNCTION
// ============================================================================

/**
 * Full Resume Parsing Test
 */
export async function testFullParsing() {
  console.log('\n========== RESUME PARSER TEST ==========\n');
  
  // Read actual PDF file
  const fs = await import('fs');
  const path = 'C:\\Users\\gemin\\CrossDevice\\motorola edge 40 neo\\storage\\Download\\Gemini_Resume-1 (1).pdf';
  const buffer = fs.readFileSync(path);
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const file = new File([blob], 'Gemini_Resume-1 (1).pdf', { type: 'application/pdf' });
  
  console.log('Parsing resume:', file.name);
  console.log('File size:', (buffer.length / 1024).toFixed(2), 'KB\n');
  
  try {
    const parsed = await parseResume(file);
    
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║              PARSING RESULTS                           ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log('📋 PERSONAL INFO:');
    console.log('  Name:', [parsed.personalInfo.firstName, parsed.personalInfo.lastName].filter(Boolean).join(' ') || '(not found)');
    console.log('  Email:', parsed.personalInfo.email || '(not found)');
    console.log('  Phone:', parsed.personalInfo.phone || '(not found)');
    console.log('  Location:', parsed.personalInfo.location || '(not found)');
    if (parsed.personalInfo.linkedin) console.log('  LinkedIn:', parsed.personalInfo.linkedin);
    if (parsed.personalInfo.github) console.log('  GitHub:', parsed.personalInfo.github);
    
    console.log('\n💼 WORK EXPERIENCE: (' + parsed.experience.length + ' found)');
    if (parsed.experience.length > 0) {
      parsed.experience.forEach((exp, i) => {
        console.log(`\n  ${i + 1}. ${exp.position}`);
        console.log(`     Company: ${exp.company}`);
        console.log(`     Period: ${exp.startDate} - ${exp.endDate}${exp.current ? ' (Current)' : ''}`);
        if (exp.location) console.log(`     Location: ${exp.location}`);
        console.log(`     Description: ${exp.description.substring(0, 100)}...`);
      });
    } else {
      console.log('  (none found)');
    }
    
    console.log('\n🎓 EDUCATION: (' + parsed.education.length + ' found)');
    if (parsed.education.length > 0) {
      parsed.education.forEach((edu, i) => {
        console.log(`\n  ${i + 1}. ${edu.degree} ${edu.field ? 'in ' + edu.field : ''}`);
        console.log(`     Institution: ${edu.institution}`);
        if (edu.startDate || edu.endDate) {
          console.log(`     Period: ${edu.startDate || ''} - ${edu.endDate || ''}`);
        } else if (edu.graduationDate) {
          console.log(`     Graduated: ${edu.graduationDate}`);
        }
        if (edu.gpa) console.log(`     GPA: ${edu.gpa}`);
      });
    } else {
      console.log('  (none found)');
    }
    
    console.log('\n🛠️  SKILLS: (' + parsed.skills.length + ' found)');
    if (parsed.skills.length > 0) {
      console.log('  ' + parsed.skills.join(', '));
    } else {
      console.log('  (none found)');
    }
    
    console.log('\n🚀 PROJECTS: (' + parsed.projects.length + ' found)');
    if (parsed.projects.length > 0) {
      parsed.projects.forEach((proj, i) => {
        console.log(`\n  ${i + 1}. ${proj.name}`);
        if (proj.technologies.length > 0) {
          console.log(`     Technologies: ${proj.technologies.join(', ')}`);
        }
        if (proj.description) {
          console.log(`     Description: ${proj.description.substring(0, 150)}...`);
        }
        if (proj.url) {
          console.log(`     URL: ${proj.url}`);
        }
      });
    } else {
      console.log('  (none found)');
    }
    
    console.log('\n📜 CERTIFICATIONS: (' + parsed.certifications.length + ' found)');
    if (parsed.certifications.length > 0) {
      parsed.certifications.forEach((cert, i) => {
        console.log(`  ${i + 1}. ${cert.name}`);
      });
    } else {
      console.log('  (none found)');
    }
    
    if (parsed.metadata.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      parsed.metadata.warnings.forEach((w, i) => {
        console.log(`  ${i + 1}. ${w}`);
      });
    }
    
    console.log('\n✅ Parsing completed successfully!\n');
    
    return parsed;
  } catch (error) {
    console.error('\n❌ Parsing failed:', error);
    throw error;
  }
}

// ============================================================================
// AUTO-RUN
// ============================================================================

// Run test automatically
testFullParsing().catch(console.error);
