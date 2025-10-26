"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, FileText, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { formatDateToInput } from "@/utils/date-utils";
import { useAuth } from "@/hooks/use-auth";
import { UploadedFilesManager } from "@/components/uploaded-files-manager";

export const dynamic = "force-dynamic";

type UploadStatus = 'idle' | 'uploading' | 'parsing' | 'success' | 'error';

// Type for AI-parsed resume data
interface ParsedSkill {
  name?: string;
}

interface ParsedExperience {
  company?: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  description?: string;
}

interface ParsedEducation {
  institution?: string;
  degree?: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
}

interface ParsedProject {
  name?: string;
  description?: string;
  technologies?: string[];
  url?: string;
}

interface ParsedCertification {
  name?: string;
  issuer?: string;
  date?: string;
  url?: string;
}

interface ParsedLanguage {
  name?: string;
  proficiency?: string;
}

interface ParsedCustomSectionItem {
  title?: string;
  subtitle?: string;
  description?: string;
  date?: string;
  location?: string;
  details?: string[];
}

interface ParsedCustomSection {
  title?: string;
  items?: ParsedCustomSectionItem[];
}

interface ParsedResumeData {
  personal_info?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  skills?: (string | ParsedSkill)[];
  experience?: ParsedExperience[];
  education?: ParsedEducation[];
  projects?: ParsedProject[];
  certifications?: ParsedCertification[];
  languages?: ParsedLanguage[];
  custom_sections?: ParsedCustomSection[];
}

export default function UploadResumePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [hasExistingFiles, setHasExistingFiles] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"existing" | "upload">("existing");

  // Check if user has existing uploaded files
  useEffect(() => {
    const checkExistingFiles = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/uploaded-files');
        if (response.ok) {
          const data = await response.json();
          const hasFiles = data.files && data.files.length > 0;
          setHasExistingFiles(hasFiles);
          
          // If user has files, default to existing tab; otherwise upload tab
          if (!hasFiles) {
            setActiveTab("upload");
          } else {
            setActiveTab("existing");
          }
        }
      } catch (error) {
        console.error('Error checking existing files:', error);
        // Default to upload tab on error
        setActiveTab("upload");
      }
    };

    if (user && !loading) {
      checkExistingFiles();
    }
  }, [user, loading]);

  const handleFileUpload = async (file: File) => {
    // Validation
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a PDF, DOCX, or DOC file'
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
      
      if (user?.id) {
        formData.append('userId', user.id);
        const resumeId = crypto.randomUUID();
        formData.append('resumeId', resumeId);
      }

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
      const parsedResume = data.data.parsed_resume as ParsedResumeData;
      const warnings = data.data.warnings || [];

      console.log('[Upload] Parsed resume data received:', {
        hasCertifications: !!parsedResume.certifications,
        certificationsCount: parsedResume.certifications?.length || 0,
        hasLanguages: !!parsedResume.languages,
        languagesCount: parsedResume.languages?.length || 0,
        hasCustomSections: !!parsedResume.custom_sections,
        customSectionsCount: parsedResume.custom_sections?.length || 0,
      });

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
        skills: (parsedResume.skills || []).map((s: string | ParsedSkill) => 
          typeof s === 'string' ? s : s.name || ''
        ).filter(Boolean),
        experience: (parsedResume.experience || []).map((e: ParsedExperience) => ({
          id: crypto.randomUUID(),
          company: e.company || '',
          position: e.position || '',
          startDate: formatDateToInput(e.start_date || ''),
          endDate: formatDateToInput(e.end_date || ''),
          isPresent: e.current || false,
          description: e.description || '',
        })),
        education: (parsedResume.education || []).map((ed: ParsedEducation) => ({
          id: crypto.randomUUID(),
          institution: ed.institution || '',
          degree: ed.degree || '',
          field: ed.field || '',
          startDate: formatDateToInput(ed.start_date || ''),
          endDate: formatDateToInput(ed.end_date || ''),
          gpa: ed.gpa || '',
        })),
        projects: (parsedResume.projects || []).map((p: ParsedProject) => ({
          id: crypto.randomUUID(),
          name: p.name || '',
          description: p.description || '',
          techStack: p.technologies || [],
          sourceUrl: p.url || '',
          demoUrl: '',
        })),
        certifications: (parsedResume.certifications || []).map((c: ParsedCertification) => ({
          id: crypto.randomUUID(),
          name: c.name || '',
          issuer: c.issuer || '',
          date: formatDateToInput(c.date || ''),
          url: c.url || '',
        })),
        languages: (parsedResume.languages || []).map((l: ParsedLanguage) => ({
          id: crypto.randomUUID(),
          name: l.name || '',
          proficiency: l.proficiency || '',
        })),
        customSections: (parsedResume.custom_sections || []).map((section: ParsedCustomSection) => ({
          id: crypto.randomUUID(),
          title: section.title || '',
          items: (section.items || []).map((item: ParsedCustomSectionItem) => ({
            title: item.title || '',
            subtitle: item.subtitle || '',
            description: item.description || '',
            date: formatDateToInput(item.date || ''),
            location: item.location || '',
            details: item.details || [],
          })),
        })),
        rawText: data.data.editor_markdown || '',
        markdown: data.data.editor_markdown || '',
        originalFilename: file.name,
        warnings: warnings,
        uploadedFile: data.data.uploaded_file || null,
      };

      console.log('[Upload] Prefill data prepared:', {
        certificationsCount: prefillData.certifications.length,
        languagesCount: prefillData.languages.length,
        customSectionsCount: prefillData.customSections.length,
        certifications: prefillData.certifications,
        languages: prefillData.languages,
        customSections: prefillData.customSections,
      });

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
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-4xl py-10">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4 "
            disabled={uploadStatus === 'uploading' || uploadStatus === 'parsing'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2 text-bg-background">Upload Your Resume</h1>
          <p className="text-text-muted-foreground">
            Upload your existing resume and we&apos;ll help you create a modern, shareable profile.
          </p>
        </div>

        {loading ? (
          <Card className="bg-card">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-text-primary" />
                <p className="text-text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        ) : !user ? (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-bg-background">Sign In to Upload Your Resume</CardTitle>
              <CardDescription className="text-text-muted-foreground">
                Sign in to upload and automatically parse your resume with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border bg-white/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-text-primary/20 p-3">
                    <Upload className="w-6 h-6 text-text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-bg-background mb-2">
                      AI-Powered Resume Parsing
                    </h3>
                    <p className="text-sm text-text-muted-foreground mb-4">
                      Our AI will automatically extract your information from PDF, DOCX, or DOC files and create a beautiful, modern resume.
                    </p>
                    <ul className="space-y-2 text-sm text-text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Extract all your experience, education, and skills
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Save your resume to your account
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Edit and customize with ease
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => router.push('/login?returnTo=/upload-resume')}
                  className="flex-1 bg-text-primary hover:bg-text-primary/80 text-white"
                >
                  Sign In to Upload
                </Button>
                <Button 
                  onClick={() => router.push('/create-resume')}
                  variant="outline"
                  className="flex-1 "
                >
                  Build from Scratch
                </Button>
              </div>

              <p className="text-xs text-center text-text-muted-foreground">
                Don&apos;t have an account?{' '}
                <a 
                  href="/login?returnTo=/upload-resume" 
                  className="text-text-primary hover:underline"
                >
                  Sign up for free
                </a>
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Tabs for Existing vs Upload New */}
            {hasExistingFiles !== null && (
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "existing" | "upload")} className="w-full">
                <TabsList className="card-enhanced grid w-full grid-cols-2 h-12 p-1 bg-muted/50 border border-border">
                  <TabsTrigger 
                    value="existing" 
                    className="text-foreground font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:border data-[state=active]:border-primary data-[state=active]:shadow-sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Use Existing
                  </TabsTrigger>
                  <TabsTrigger 
                    value="upload" 
                    className="text-foreground font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:border data-[state=active]:border-primary data-[state=active]:shadow-sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </TabsTrigger>
                </TabsList>

                {/* Existing Files Tab Content */}
                <TabsContent value="existing" className="mt-6">
                  <Card className="card-enhanced border border-border shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-bg-background">Your Uploaded Resumes</CardTitle>
                      <CardDescription className="text-text-muted-foreground">
                        Select a previously uploaded resume to use
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div id="uploaded-files-section">
                        <UploadedFilesManager />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Upload New Tab Content */}
                <TabsContent value="upload" className="mt-6">
                  <Card className="card-enhanced border border-border shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-bg-background">Upload Resume</CardTitle>
                      <CardDescription className="text-text-muted-foreground">
                        Supports PDF, DOCX, and DOC files up to 10MB
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging 
                  ? 'border-text-primary/70 bg-white/10' 
                  : uploadStatus === 'error'
                  ? 'border-red-500/50 bg-red-500/5'
                  : uploadStatus === 'success'
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-white/20 hover:border-text-primary/50'
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
                  <Loader2 className="w-12 h-12 text-text-primary mx-auto animate-spin" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-bg-background">
                      {uploadStatus === 'uploading' ? 'Uploading...' : 'Parsing resume...'}
                    </p>
                    <p className="text-sm text-text-muted-foreground">
                      {fileName}
                    </p>
                  </div>
                  <div className="max-w-xs mx-auto">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-text-muted-foreground mt-2">{progress}% complete</p>
                  </div>
                </div>
              ) : uploadStatus === 'success' ? (
                <div className="space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-bg-background">Resume parsed successfully!</p>
                    <p className="text-sm text-text-muted-foreground mt-1">Redirecting to editor...</p>
                  </div>
                </div>
              ) : uploadStatus === 'error' ? (
                <div className="space-y-4">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-bg-background">Upload failed</p>
                    <p className="text-sm text-text-muted-foreground mt-1">Please try again</p>
                  </div>
                  <Button
                    variant="outline"
                    className=""
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
                    <Upload className="w-8 h-8 text-text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-bg-background">
                      Drag and drop your resume here
                    </h3>
                    <p className="text-text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer "
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                  <p className="text-xs text-text-muted-foreground">
                    Supported formats: PDF, DOCX, DOC • Max size: 10MB
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}

        {user && (
          <Card className="bg-card mt-8">
            <CardHeader>
              <CardTitle className="text-lg text-bg-background">What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-bg-background">AI Analysis</p>
                  <p className="text-sm text-text-muted-foreground">
                    Our AI will extract and organize your information
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-bg-background">Review & Edit</p>
                  <p className="text-sm text-text-muted-foreground">
                    Review the extracted data and make any necessary adjustments
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-bg-background">Publish & Share</p>
                  <p className="text-sm text-text-muted-foreground">
                    Create your shareable profile with analytics tracking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user && (
          <>
            {/* How It Works Section */}
            <Card className="bg-card mt-8">
              <CardHeader>
                <CardTitle className="text-bg-background">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-bg-background">Upload Your Resume</p>
                  <p className="text-sm text-text-muted-foreground">
                    We support PDF, DOCX, and DOC files up to 10MB
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-bg-background">AI Parses Your Data</p>
                  <p className="text-sm text-text-muted-foreground">
                    Our AI extracts all your information automatically
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-bg-background">Publish & Share</p>
                  <p className="text-sm text-text-muted-foreground">
                    Create your shareable profile with analytics tracking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          </>
        )}
      </div>
    </div>
  );
}

