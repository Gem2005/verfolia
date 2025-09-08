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
  const experience = experienceLines.slice(0, 6).map(line => ({ description: line }));

  const educationBlock = sections["education"] || "";
  const educationLines = naiveBulletsToArray(educationBlock);
  const education = educationLines.slice(0, 4).map(line => ({ institution: line }));

  return {
    text,
    personalInfo: { fullName, email, phone, links },
    skills,
    experience,
    education,
  };
}
