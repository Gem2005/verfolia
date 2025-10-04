"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, FileText, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

type UploadStatus = 'idle' | 'uploading' | 'parsing' | 'success' | 'error';

export default function UploadResumePage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (file: File) => {
    // Validation
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a PDF, DOCX, or TXT file'
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File too large', {
        description: 'Please upload a file smaller than 10MB'
      });
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');
    setProgress(10);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload and parse
      const formData = new FormData();
      formData.append('file', file);

      setUploadStatus('parsing');
      setProgress(50);

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to parse resume');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      setProgress(100);
      setUploadStatus('success');

      // Show success toast
      toast.success('Resume parsed successfully!', {
        description: 'Redirecting to editor...'
      });

      // Transform API response to prefill format
      const parsedResume = data.data.parsed_resume;
      const warnings = data.data.warnings || [];

      // Show warnings if any
      if (warnings.length > 0) {
        toast.warning('Parsing completed with warnings', {
          description: warnings.slice(0, 2).join(', ') + (warnings.length > 2 ? '...' : '')
        });
      }

      const prefillData = {
        title: `Resume from ${file.name}`,
        personalInfo: {
          firstName: parsedResume.personal_info?.first_name || '',
          lastName: parsedResume.personal_info?.last_name || '',
          email: parsedResume.personal_info?.email || '',
          phone: parsedResume.personal_info?.phone || '',
          location: parsedResume.personal_info?.location || '',
          summary: parsedResume.summary || '',
          title: '',
          photo: '',
          linkedinUrl: parsedResume.personal_info?.linkedin || '',
          githubUrl: parsedResume.personal_info?.github || '',
        },
        skills: (parsedResume.skills || []).map((s: any) => 
          typeof s === 'string' ? s : s.name || ''
        ).filter(Boolean),
        experience: (parsedResume.experience || []).map((e: any) => ({
          id: crypto.randomUUID(),
          company: e.company || '',
          position: e.position || '',
          startDate: e.start_date || '',
          endDate: e.end_date || '',
          isPresent: e.current || false,
          description: e.description || '',
        })),
        education: (parsedResume.education || []).map((ed: any) => ({
          id: crypto.randomUUID(),
          institution: ed.institution || '',
          degree: ed.degree || '',
          field: ed.field || '',
          startDate: ed.start_date || '',
          endDate: ed.graduation_date || '',
          gpa: ed.gpa || '',
        })),
        projects: (parsedResume.projects || []).map((p: any) => ({
          id: crypto.randomUUID(),
          name: p.name || '',
          description: p.description || '',
          techStack: p.technologies || [],
          sourceUrl: p.url || '',
          demoUrl: '',
        })),
        certifications: (parsedResume.certifications || []).map((c: any) => ({
          id: crypto.randomUUID(),
          name: c.name || '',
          issuer: c.issuer || '',
          date: c.date || '',
          credentialId: c.credential_id || '',
        })),
        languages: (parsedResume.languages || []).map((l: any) => ({
          id: crypto.randomUUID(),
          name: l.name || '',
          proficiency: l.proficiency || '',
        })),
        customSections: [],
        rawText: data.data.editor_markdown || '',
        markdown: data.data.editor_markdown || '',
        originalFilename: file.name,
        warnings: warnings,
      };

      // Store in session storage
      const sessionKey = `resume_upload_${Date.now()}`;
      sessionStorage.setItem(sessionKey, JSON.stringify(prefillData));

      // Redirect after a short delay for better UX
      setTimeout(() => {
        router.push(`/create-resume?prefill=${sessionKey}`);
      }, 500);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      setProgress(0);
      
      toast.error('Failed to parse resume', {
        description: error instanceof Error ? error.message : 'Please try again or contact support'
      });
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
            disabled={uploadStatus === 'uploading' || uploadStatus === 'parsing'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2 text-glass-white">Upload Your Resume</h1>
          <p className="text-glass-gray">
            Upload your existing resume and we'll help you create a modern, shareable profile.
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-glass-white">Upload Resume</CardTitle>
            <CardDescription className="text-glass-gray">
              Supports PDF, DOCX, and TXT files up to 10MB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging 
                  ? 'border-glass-blue/70 bg-white/10' 
                  : uploadStatus === 'error'
                  ? 'border-red-500/50 bg-red-500/5'
                  : uploadStatus === 'success'
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-white/20 hover:border-glass-blue/50'
              } ${(uploadStatus === 'uploading' || uploadStatus === 'parsing') ? 'pointer-events-none' : ''}`}
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
              {uploadStatus === 'uploading' || uploadStatus === 'parsing' ? (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 text-glass-blue mx-auto animate-spin" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-glass-white">
                      {uploadStatus === 'uploading' ? 'Uploading...' : 'Parsing resume...'}
                    </p>
                    <p className="text-sm text-glass-gray">
                      {fileName}
                    </p>
                  </div>
                  <div className="max-w-xs mx-auto">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-glass-gray mt-2">{progress}% complete</p>
                  </div>
                </div>
              ) : uploadStatus === 'success' ? (
                <div className="space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-glass-white">Resume parsed successfully!</p>
                    <p className="text-sm text-glass-gray mt-1">Redirecting to editor...</p>
                  </div>
                </div>
              ) : uploadStatus === 'error' ? (
                <div className="space-y-4">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-glass-white">Upload failed</p>
                    <p className="text-sm text-glass-gray mt-1">Please try again</p>
                  </div>
                  <Button
                    variant="outline"
                    className="glass-button"
                    onClick={() => {
                      setUploadStatus('idle');
                      setProgress(0);
                      setFileName('');
                    }}
                  >
                    Try Again
                  </Button>
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
                      accept=".pdf,.docx,.doc,.txt"
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
                      Choose File
                    </Button>
                  </div>
                  <p className="text-xs text-glass-gray">
                    Supported formats: PDF, DOCX, TXT • Max size: 10MB
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
