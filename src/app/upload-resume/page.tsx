"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, ArrowLeft } from "lucide-react";
import "../create-resume/glassmorphism.css";
import { parseResumeFromPdf } from "@/utils/pdf-parser";
import { extractPdfText } from "@/utils/pdf-parser";
import { useRef } from "react";

export const dynamic = "force-dynamic";

export default function UploadResumePage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Prefer server parsing to preserve formatting and section order
      try {
        const form = new FormData();
        form.append('file', file);
        const resp = await fetch('/api/parse-resume', { method: 'POST', body: form });
        if (resp.ok) {
          const data = await resp.json();
          const server = data?.parsedResume;
          const rawText = data?.rawText as string | undefined;
          const toMarkdown = (text: string | undefined) => {
            if (!text) return '';
            return text
              .split(/\r?\n/)
              .map((line) => {
                const trimmed = line.trim();
                if (/^(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|LANGUAGES|PROFILE|OBJECTIVE)\b/i.test(trimmed)) {
                  return `## ${trimmed}`;
                }
                if (/^[•\-*]\s+/.test(trimmed)) {
                  return trimmed.replace(/^[•\-*]\s+/, '- ');
                }
                return trimmed;
              })
              .join('\n');
          };
          const markdown = toMarkdown(rawText);
          const prefillFromServer = {
            title: `Resume from ${file.name}`,
            personalInfo: {
              firstName: server?.personalInfo?.firstName || "",
              lastName: server?.personalInfo?.lastName || "",
              email: server?.personalInfo?.email || "",
              phone: server?.personalInfo?.phone || "",
              location: server?.personalInfo?.location || "",
              summary: server?.personalInfo?.summary || "",
              title: server?.personalInfo?.title || "",
              photo: "",
              linkedinUrl: server?.personalInfo?.linkedinUrl || "",
              githubUrl: server?.personalInfo?.githubUrl || "",
            },
            skills: server?.skills || [],
            experience: (server?.experience || []).map((e: any) => ({
              id: crypto.randomUUID(),
              company: e.company || "",
              position: e.position || "",
              startDate: e.startDate || "",
              endDate: e.endDate || "",
              isPresent: !!e.isPresent,
              description: e.description || "",
            })),
            education: (server?.education || []).map((ed: any) => ({
              id: crypto.randomUUID(),
              institution: ed.institution || "",
              degree: ed.degree || "",
              field: ed.field || "",
              startDate: ed.startDate || "",
              endDate: ed.endDate || "",
              gpa: ed.gpa || "",
            })),
            projects: (server?.projects || []).map((p: any) => ({
              id: crypto.randomUUID(),
              name: p.name || "",
              description: p.description || "",
              techStack: p.techStack || [],
              sourceUrl: p.sourceUrl || "",
              demoUrl: p.demoUrl || "",
            })),
            certifications: server?.certifications || [],
            languages: server?.languages || [],
            customSections: [],
            rawText: rawText || "",
            markdown,
          };
          const sessionKey = `resume_upload_${Date.now()}`;
          sessionStorage.setItem(sessionKey, JSON.stringify(prefillFromServer));
          // Save local copy of original file
          try {
            const blobUrl = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `copy-${Date.now()}-${file.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
          } catch {}
          router.push(`/create-resume?prefill=${sessionKey}`);
          return;
        }
      } catch (serverErr) {
        console.warn('Server parse failed, falling back to client:', serverErr);
      }

      const parsed = await parseResumeFromPdf(file);

      const toMarkdown = (text: string | undefined) => {
        if (!text) return '';
        return text
          .split(/\r?\n/)
          .map((line) => {
            const trimmed = line.trim();
            if (/^(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|LANGUAGES|PROFILE|OBJECTIVE)\b/i.test(trimmed)) {
              return `## ${trimmed}`;
            }
            if (/^[•\-*]\s+/.test(trimmed)) {
              return trimmed.replace(/^[•\-*]\s+/, '- ');
            }
            return trimmed;
          })
          .join('\n');
      };

      const prefill = {
        title: `Resume from ${file.name}`,
        personalInfo: {
          // Split fullName into first/last if needed
          ...((() => {
            const pi: any = parsed?.personalInfo || {};
            const full = (pi.fullName || "").trim();
            const parts = full ? full.split(/\s+/) : [];
            const first = parts.length ? parts[0] : (pi.firstName || "");
            const last = parts.length > 1 ? parts.slice(1).join(" ") : (pi.lastName || "");
            return { firstName: first, lastName: last };
          })()),
          email: (parsed as any)?.personalInfo?.email || "",
          phone: (parsed as any)?.personalInfo?.phone || "",
          location: (parsed as any)?.personalInfo?.location || "",
          summary: (parsed as any)?.personalInfo?.summary || (parsed as any)?.personalInfo?.headline || "",
          title: (parsed as any)?.personalInfo?.title || "",
          photo: "",
          linkedinUrl: (parsed as any)?.personalInfo?.linkedinUrl || (parsed as any)?.personalInfo?.links?.[0] || "",
          githubUrl: (parsed as any)?.personalInfo?.githubUrl || "",
        },
        skills: (parsed as any)?.skills || [],
        experience: (parsed as any)?.experience?.map((e: any) => ({
          id: crypto.randomUUID(),
          company: e.company || "",
          position: e.position || e.role || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          isPresent: !!e.isPresent,
          description: e.description || "",
        })) || [],
        education: (parsed as any)?.education?.map((ed: any) => ({
          id: crypto.randomUUID(),
          institution: ed.institution || "",
          degree: ed.degree || "",
          field: ed.field || "",
          startDate: ed.startDate || "",
          endDate: ed.endDate || "",
          gpa: ed.gpa || ed.grade || "",
        })) || [],
        projects: [],
        certifications: [],
        languages: [],
        customSections: [],
        rawText: (parsed as any)?.text,
        markdown: toMarkdown((parsed as any)?.text),
      };

      const sessionKey = `resume_upload_${Date.now()}`;
      sessionStorage.setItem(sessionKey, JSON.stringify(prefill));
      // Save local copy of original file
      try {
        const blobUrl = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `copy-${Date.now()}-${file.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch {}
      router.push(`/create-resume?prefill=${sessionKey}`);
    } catch (error) {
      console.error('Structured parse failed, attempting raw text fallback:', error);
      try {
        const rawText = await extractPdfText(file);
        const toMarkdown = (text: string | undefined) => {
          if (!text) return '';
          return text
            .split(/\r?\n/)
            .map((line) => {
              const trimmed = line.trim();
              if (/^(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|LANGUAGES|PROFILE|OBJECTIVE)\b/i.test(trimmed)) {
                return `## ${trimmed}`;
              }
              if (/^[•\-*]\s+/.test(trimmed)) {
                return trimmed.replace(/^[•\-*]\s+/, '- ');
              }
              return trimmed;
            })
            .join('\n');
        };
        const markdown = toMarkdown(rawText);
        const fallbackPrefill = {
          title: `Resume from ${file.name}`,
          personalInfo: { firstName: "", lastName: "", email: "", phone: "", location: "", summary: "", title: "", photo: "", linkedinUrl: "", githubUrl: "" },
          skills: [],
          experience: [],
          education: [],
          projects: [],
          certifications: [],
          languages: [],
          customSections: [],
          rawText,
          markdown,
        };
        const sessionKey = `resume_upload_${Date.now()}`;
        sessionStorage.setItem(sessionKey, JSON.stringify(fallbackPrefill));
        // Save local copy of original file
        try {
          const blobUrl = URL.createObjectURL(file);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `copy-${Date.now()}-${file.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        } catch {}
        router.push(`/create-resume?prefill=${sessionKey}`);
      } catch (fallbackErr) {
        console.error('Raw text fallback also failed:', fallbackErr);
        alert('Failed to process PDF. Please try another file.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files[0]);
      // reset value so selecting same file again still triggers change
      e.currentTarget.value = "";
    }
  };

  return (
    <div className="glass-bg min-h-screen">
      <div className="container mx-auto max-w-4xl py-10">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4 glass-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2 text-glass-white">Upload Your Resume</h1>
          <p className="text-glass-gray">
            Upload your existing PDF resume and we'll help you create a modern, shareable profile.
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-glass-white">Upload PDF Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging 
                  ? 'border-glass-blue/70 bg-white/10' 
                  : 'border-white/20 hover:border-glass-blue/50'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
            >
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glass-blue mx-auto" />
                  <p className="text-lg font-medium text-glass-white">Processing your resume...</p>
                  <p className="text-sm text-glass-gray">
                    This may take a few moments while we extract your information.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-white/10">
                    <Upload className="w-8 h-8 text-glass-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-glass-white">
                      Drag and drop your resume here
                    </h3>
                    <p className="text-glass-gray mb-4">
                      or click to browse files
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer glass-button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Choose PDF File
                    </Button>
                  </div>
                  <p className="text-xs text-glass-gray">
                    Supported format: PDF (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg text-glass-white">What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-glass-blue">1</span>
                </div>
                <div>
                  <p className="font-medium text-glass-white">AI Analysis</p>
                  <p className="text-sm text-glass-gray">
                    Our AI will extract and organize your information
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-glass-blue">2</span>
                </div>
                <div>
                  <p className="font-medium text-glass-white">Review & Edit</p>
                  <p className="text-sm text-glass-gray">
                    Review the extracted data and make any necessary adjustments
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-glass-blue">3</span>
                </div>
                <div>
                  <p className="font-medium text-glass-white">Publish & Share</p>
                  <p className="text-sm text-glass-gray">
                    Create your shareable profile with analytics tracking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
