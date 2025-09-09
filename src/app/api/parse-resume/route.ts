import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

async function saveOriginalPdf(file: File): Promise<{ savedPath: string; savedName: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), 'uploads');
  try { await fs.mkdir(uploadsDir, { recursive: true }); } catch {}
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const savedName = `${Date.now()}_${safeName.replace(/\.pdf$/i, '')}_original.pdf`;
  const fullPath = path.join(uploadsDir, savedName);
  await fs.writeFile(fullPath, buffer);
  return { savedPath: fullPath, savedName };
}

function isLikelyTextPdf(bytes: Uint8Array): boolean {
  // Heuristic: presence of PDF text operators or many ASCII letters
  const ascii = Array.from(bytes.slice(0, Math.min(bytes.length, 200000))).map(b => String.fromCharCode(b)).join('');
  if (/\bBT\b[\s\S]*?\bET\b/.test(ascii)) return true;
  const letters = (ascii.match(/[A-Za-z]{2,}/g) || []).join('').length;
  return letters > 500; // arbitrary threshold
}

// Simple PDF text extraction - placeholder fallback
async function extractTextFromPdf(file: File): Promise<{ rawText: string; ocrUsed: boolean; ocrMeta?: { tool: string; lang: string } ; errorReport?: string[] }> {
  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const hasText = isLikelyTextPdf(buffer);
    if (!hasText) {
      return {
        rawText: '',
        ocrUsed: false,
        errorReport: ['image-only — OCR needed'],
      };
    }
    // Placeholder extracted text for now
    const rawText = `Extracted text placeholder for ${file.name}`;
    return { rawText, ocrUsed: false };
  } catch (error) {
    console.error('PDF parsing error:', error);
    return { rawText: '', ocrUsed: false, errorReport: ['parse-failure'] };
  }
}

function mapTextToResumeWithConfidence(text: string, filename: string) {
  const lines = text ? text.split(/\r?\n/) : [];
  const getFirstMatch = (regex: RegExp) => {
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(regex);
      if (m) return { value: m[0], confidence: 0.8, source_lines: [i] };
    }
    return { value: '', confidence: 0.0, source_lines: [] as number[] };
  };

  const email = getFirstMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phone = getFirstMatch(/\+?[\d\s().-]{10,}/);
  const linkedin = getFirstMatch(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[^\s]+/i);
  const github = getFirstMatch(/(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+/i);

  // Naive name from first non-empty line
  let fullName = { value: '', confidence: 0.0, source_lines: [] as number[] };
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const l = (lines[i] || '').trim();
    if (l && !email.source_lines.includes(i) && !/^(summary|experience|education|skills)/i.test(l)) {
      fullName = { value: l, confidence: 0.6, source_lines: [i] };
      break;
    }
  }

  const raw_text = text || '';

  const parsed_resume = {
    filename,
    raw_text,
    full_name: { value: fullName.value, confidence: fullName.confidence, source_lines: fullName.source_lines },
    email: { value: email.value, confidence: email.confidence, source_lines: email.source_lines },
    phone: { value: phone.value, confidence: phone.confidence, source_lines: phone.source_lines },
    linkedin: { value: linkedin.value, confidence: linkedin.confidence, source_lines: linkedin.source_lines },
    github: { value: github.value, confidence: github.confidence, source_lines: github.source_lines },
    website: { value: '', confidence: 0.0, source_lines: [] as number[] },
    address: { value: '', confidence: 0.0, source_lines: [] as number[] },
    summary: { value: '', confidence: 0.0, source_lines: [] as number[] },
    education: [] as Array<any>,
    experience: [] as Array<any>,
    projects: [] as Array<any>,
    skills: [] as Array<any>,
    certifications: [] as Array<any>,
    awards: [] as Array<any>,
    languages: [] as Array<any>,
    interests: [] as Array<any>,
    other_sections: [] as Array<any>,
  };

  const editor_markdown = raw_text
    ? raw_text
        .split(/\r?\n/)
        .map((line) => {
          const trimmed = line.trim();
          if (/^(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|LANGUAGES|AWARDS|INTERESTS|OBJECTIVE)\b/i.test(trimmed)) {
            return `## ${trimmed}`;
          }
          if (/^[•\-*]\s+/.test(trimmed)) {
            return trimmed.replace(/^[•\-*]\s+/, '- ');
          }
          return trimmed;
        })
        .join('\n')
    : '';

  return { parsed_resume, editor_markdown };
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

    const { savedName } = await saveOriginalPdf(file);

    const instruction = `You are an accurate resume parser. Carefully extract all details, preserve headings and bullets, and include confidences and source lines.`;

    const extraction = await extractTextFromPdf(file);

    let error_report: string[] = [];
    if (extraction.errorReport && extraction.errorReport.length) {
      error_report = [...extraction.errorReport];
    }

    const { parsed_resume, editor_markdown } = mapTextToResumeWithConfidence(extraction.rawText, savedName);

    if (extraction.errorReport?.includes('image-only — OCR needed')) {
      error_report.push('image-only — OCR needed');
      error_report.push('suggestion: run OCR at ≥300 DPI using ocrmypdf');
    }

    const token = `prefill_${Date.now()}`;

    return NextResponse.json({
      token,
      instruction,
      parsed_resume,
      editor_markdown,
      rawText: extraction.rawText,
      ocr: extraction.ocrUsed ? { used: true, meta: extraction.ocrMeta } : { used: false },
      error_report,
    }, { status: 200 });
  } catch (error) {
    console.error('PDF parse error:', error);
    return NextResponse.json({ error: 'Failed to parse resume', error_report: ['parse-exception'] }, { status: 500 });
  }
}


