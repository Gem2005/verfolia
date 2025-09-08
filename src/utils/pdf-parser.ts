import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

// Configure worker - consumers must set proper path in Next.js if needed
// For now, we rely on default workerless mode in modern pdfjs (v4 supports workerless)

export interface ParsedResume {
  text: string;
  personalInfo: Partial<{
    fullName: string;
    email: string;
    phone: string;
    location: string;
    headline: string;
    links: string[];
  }>;
  skills: string[];
  experience: Array<{
    company?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    description?: string;
  }>;
  education: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }>;
}

function extractEmails(text: string): string | undefined {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : undefined;
}

function extractPhone(text: string): string | undefined {
  const match = text.match(/\+?[0-9][0-9\-()\s]{7,}/);
  return match ? match[0] : undefined;
}

function extractLinks(text: string): string[] {
  const regex = /(https?:\/\/[^\s)]+|www\.[^\s)]+)/gi;
  return Array.from(new Set(text.match(regex) || []));
}

function guessName(text: string): string | undefined {
  const firstLine = text.split(/\n|\r/).map(s => s.trim()).filter(Boolean)[0];
  if (!firstLine) return undefined;
  if (/email|phone|resume|curriculum|vitae/i.test(firstLine)) return undefined;
  if (firstLine.length > 60) return undefined;
  return firstLine;
}

function splitSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const tokens = [
    "experience",
    "work experience",
    "employment",
    "projects",
    "education",
    "skills",
    "certifications",
    "languages",
    "summary",
    "profile",
  ];
  const lines = text.split(/\r?\n/);
  const indices: Array<{ idx: number; key: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim().toLowerCase();
    for (const t of tokens) {
      if (l === t || l.startsWith(t + ":") || l === t.toUpperCase()) {
        indices.push({ idx: i, key: t });
        break;
      }
    }
  }
  indices.sort((a, b) => a.idx - b.idx);
  if (indices.length === 0) return { body: text };
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].idx;
    const end = i + 1 < indices.length ? indices[i + 1].idx : lines.length;
    const key = indices[i].key;
    sections[key] = lines.slice(start + 1, end).join("\n").trim();
  }
  return sections;
}

function naiveBulletsToArray(block: string): string[] {
  const items = block
    .split(/\n+/)
    .map(s => s.replace(/^[-•\u2022\u25AA\u25CF\s]+/, "").trim())
    .filter(Boolean);
  return items;
}

function extractDateRanges(text: string): Array<{ start?: string; end?: string }> {
  const ranges: Array<{ start?: string; end?: string }> = [];
  const regex = /(\b\w{3,9}\.?\s?\d{4}|\b\d{4})\s*(?:-|to|–|—|until|through)\s*(Present|Now|\b\w{3,9}\.?\s?\d{4}|\b\d{4})/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    ranges.push({ start: match[1], end: match[2] });
  }
  return ranges;
}

function extractCompanyRole(lines: string[]): Array<{ company?: string; role?: string; description?: string }> {
  const entries: Array<{ company?: string; role?: string; description?: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1] || "";
    // Heuristic: line with Company, next with Role, or combined by dash
    const combined = line.match(/^(.+?)\s[-–—]\s(.+)$/);
    if (combined) {
      entries.push({ company: combined[1].trim(), role: combined[2].trim() });
      continue;
    }
    if (/inc\.|llc|ltd|company|corp|technologies|labs|solutions/i.test(line)) {
      const roleGuess = next.length < 80 ? next : undefined;
      entries.push({ company: line.trim(), role: roleGuess?.trim() });
    }
  }
  // Remove duplicates by company+role
  const seen = new Set<string>();
  return entries.filter(e => {
    const key = `${e.company || ""}|${e.role || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractEducationEntries(lines: string[]): Array<{ institution?: string; degree?: string; field?: string }> {
  const entries: Array<{ institution?: string; degree?: string; field?: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Pattern: Degree in Field - Institution OR Institution - Degree
    const degFirst = line.match(/^(Bachelor|Master|B\.?Sc\.?|M\.?Sc\.?|BTech|MTech|BE|ME|PhD)[^,\-]*[,\-]?\s*(.+?)\s[-–—]\s(.+)$/i);
    if (degFirst) {
      entries.push({ degree: degFirst[1], field: degFirst[2], institution: degFirst[3] });
      continue;
    }
    const instFirst = line.match(/^(.+?)\s[-–—]\s(Bachelor|Master|B\.?Sc\.?|M\.?Sc\.?|BTech|MTech|BE|ME|PhD)(.+)?$/i);
    if (instFirst) {
      entries.push({ institution: instFirst[1], degree: instFirst[2], field: instFirst[3]?.trim() });
      continue;
    }
    if (/university|college|institute|school/i.test(line)) {
      entries.push({ institution: line.trim() });
    }
  }
  // Deduplicate by institution+degree
  const seen = new Set<string>();
  return entries.filter(e => {
    const key = `${e.institution || ""}|${e.degree || ""}|${e.field || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await getDocument({ data: buffer }).promise;
  const numPages = pdf.numPages;
  const texts: string[] = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it: any) => (typeof it.str === "string" ? it.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    texts.push(pageText);
  }
  return texts.join("\n");
}

export async function parseResumeFromPdf(file: File): Promise<ParsedResume> {
  const text = await extractPdfText(file);
  const sections = splitSections(text);
  const email = extractEmails(text);
  const phone = extractPhone(text);
  const links = extractLinks(text);
  const fullName = guessName(text);

  const skillsBlock = sections["skills"] || "";
  const skills = naiveBulletsToArray(skillsBlock)
    .join(",")
    .split(/[,|]/)
    .map(s => s.trim())
    .filter(Boolean);

  const experienceBlock = sections["experience"] || sections["work experience"] || sections["employment"] || "";
  const experienceLines = naiveBulletsToArray(experienceBlock);
  const roleCompany = extractCompanyRole(experienceLines);
  const dateRanges = extractDateRanges(experienceBlock);
  const experience = roleCompany.slice(0, 6).map((rc, idx) => ({
    company: rc.company,
    role: rc.role,
    description: rc.description,
    startDate: dateRanges[idx]?.start,
    endDate: dateRanges[idx]?.end,
  }));

  const educationBlock = sections["education"] || "";
  const educationLines = naiveBulletsToArray(educationBlock);
  const educationParsed = extractEducationEntries(educationLines);
  const education = educationParsed.slice(0, 4).map(e => ({
    institution: e.institution,
    degree: e.degree,
    field: e.field,
  }));

  return {
    text,
    personalInfo: { fullName, email, phone, links },
    skills,
    experience,
    education,
  };
}
