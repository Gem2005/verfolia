/**
 * Test file for AI Resume Parser
 * Using Gemini 2.5 Flash Lite
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Verify API key is loaded
if (!process.env.GOOGLE_GEMINI_API_KEY) {
  console.error('❌ ERROR: GOOGLE_GEMINI_API_KEY not found in .env.local');
  console.error('Please add your API key to .env.local file');
  process.exit(1);
}

import { parseResumeWithAI, validateAIResumeData } from '@/services/ai-resume-parser';

// ============================================================================
// TEST FUNCTION
// ============================================================================

/**
 * Full AI Resume Parsing Test
 */
export async function testAIParser() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     GEMINI AI RESUME PARSER TEST                       ║');
  console.log('║     Model: gemini-2.5-flash-lite                       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  try {
    // Read actual PDF file
    const fs = await import('fs');
    const path = "C:\\Users\\gemin\\CrossDevice\\motorola edge 40 neo\\storage\\Download\\Gemini_Resume-1 (1).pdf";
    const buffer = fs.readFileSync(path);
    
    console.log('📄 Testing with:', path);
    console.log('📦 File size:', (buffer.length / 1024).toFixed(2), 'KB\n');
    
    console.log('🤖 Sending to Gemini AI...\n');
    
    // Parse with AI
    const aiData = await parseResumeWithAI(buffer, 'pdf');
    
    // Validate
    const validation = validateAIResumeData(aiData);
    
    console.log('\n✅ AI Parsing Complete!\n');
    
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║              PARSING RESULTS                           ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log('📋 PERSONAL INFO:');
    console.log('  Name:', [validation.data.personal_info.first_name, validation.data.personal_info.last_name].filter(Boolean).join(' ') || '(not found)');
    console.log('  Email:', validation.data.personal_info.email || '(not found)');
    console.log('  Phone:', validation.data.personal_info.phone || '(not found)');
    console.log('  Location:', validation.data.personal_info.location || '(not found)');
    if (validation.data.personal_info.linkedin) console.log('  LinkedIn:', validation.data.personal_info.linkedin);
    if (validation.data.personal_info.github) console.log('  GitHub:', validation.data.personal_info.github);
    if (validation.data.personal_info.portfolio) console.log('  Portfolio:', validation.data.personal_info.portfolio);
    
    if (validation.data.summary) {
      console.log('\n📝 SUMMARY:');
      console.log('  ' + validation.data.summary);
    }
    
    console.log('\n💼 WORK EXPERIENCE: (' + validation.data.experience.length + ' found)');
    if (validation.data.experience.length > 0) {
      validation.data.experience.forEach((exp, i) => {
        console.log(`\n  ${i + 1}. ${exp.position}`);
        console.log(`     Company: ${exp.company}`);
        console.log(`     Period: ${exp.start_date} - ${exp.end_date}${exp.current ? ' (Current)' : ''}`);
        if (exp.location) console.log(`     Location: ${exp.location}`);
        if (exp.description) {
          console.log(`     Description:\n     ${exp.description.split('\n').join('\n     ')}`);
        }
      });
    } else {
      console.log('  (none found)');
    }
    
    console.log('\n🎓 EDUCATION: (' + validation.data.education.length + ' found)');
    if (validation.data.education.length > 0) {
      validation.data.education.forEach((edu, i) => {
        console.log(`\n  ${i + 1}. ${edu.degree}${edu.field ? ' in ' + edu.field : ''}`);
        console.log(`     Institution: ${edu.institution}`);
        if (edu.start_date || edu.end_date) {
          console.log(`     Period: ${edu.start_date || ''} - ${edu.end_date || ''}`);
        }
        if (edu.gpa) console.log(`     GPA: ${edu.gpa}`);
        if (edu.location) console.log(`     Location: ${edu.location}`);
      });
    } else {
      console.log('  (none found)');
    }
    
    console.log('\n🛠️  SKILLS: (' + validation.data.skills.length + ' found)');
    if (validation.data.skills.length > 0) {
      console.log('  ' + validation.data.skills.join(', '));
    } else {
      console.log('  (none found)');
    }
    
    console.log('\n🚀 PROJECTS: (' + validation.data.projects.length + ' found)');
    if (validation.data.projects.length > 0) {
      validation.data.projects.forEach((proj, i) => {
        console.log(`\n  ${i + 1}. ${proj.name}`);
        if (proj.technologies.length > 0) {
          console.log(`     Technologies: ${proj.technologies.join(', ')}`);
        }
        if (proj.description) {
          console.log(`     Description: ${proj.description}`);
        }
        if (proj.url) {
          console.log(`     URL: ${proj.url}`);
        }
      });
    } else {
      console.log('  (none found)');
    }
    
    console.log('\n📜 CERTIFICATIONS: (' + validation.data.certifications.length + ' found)');
    if (validation.data.certifications.length > 0) {
      validation.data.certifications.forEach((cert, i) => {
        console.log(`  ${i + 1}. ${cert.name} - ${cert.issuer}`);
        if (cert.date) console.log(`     Date: ${cert.date}`);
        if (cert.url) console.log(`     URL: ${cert.url}`);
      });
    } else {
      console.log('  (none found)');
    }
    
    if (validation.data.languages.length > 0) {
      console.log('\n🌍 LANGUAGES: (' + validation.data.languages.length + ' found)');
      validation.data.languages.forEach((lang, i) => {
        console.log(`  ${i + 1}. ${lang.language} - ${lang.proficiency}`);
      });
    }
    
    if (validation.data.custom_sections.length > 0) {
      console.log('\n📌 CUSTOM SECTIONS: (' + validation.data.custom_sections.length + ' found)');
      validation.data.custom_sections.forEach((section, i) => {
        console.log(`\n  ${i + 1}. ${section.title}`);
        section.items.forEach((item, j) => {
          if (item.title) {
            console.log(`     ${j + 1}. ${item.title}`);
            if (item.subtitle) console.log(`        ${item.subtitle}`);
            if (item.date) console.log(`        Date: ${item.date}`);
            if (item.location) console.log(`        Location: ${item.location}`);
            if (item.description) console.log(`        ${item.description}`);
            if (item.details && item.details.length > 0) {
              item.details.forEach(detail => console.log(`        - ${detail}`));
            }
          }
        });
      });
    }
    
    if (validation.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      validation.warnings.forEach((w, i) => {
        console.log(`  ${i + 1}. ${w}`);
      });
    }
    
    console.log('\n✅ Parsing completed successfully!\n');
    
    return validation.data;
  } catch (error) {
    console.error('\n❌ Parsing failed:', error);
    throw error;
  }
}

// ============================================================================
// AUTO-RUN
// ============================================================================

// Run test automatically
testAIParser().catch(console.error);
