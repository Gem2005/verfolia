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
import { AnimatedBackground } from "@/components/layout/animated-background";

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
    <div className="min-h-screen relative overflow-hidden bg-background">
      <AnimatedBackground />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl relative z-10">
        <div className="mb-8 sm:mb-10">
          <Button 
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 border border-[#34495E]/20 hover:bg-[#2C3E50]/10 hover:border-[#3498DB]/40 transition-all duration-300 group"
            disabled={uploadStatus === 'uploading' || uploadStatus === 'parsing'}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back
          </Button>
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-[#2C3E50] via-[#3498DB] to-[#2C3E50] bg-clip-text text-transparent">
              Upload Your Resume
            </h1>
            <p className="text-base sm:text-lg text-[#34495E] dark:text-[#ECF0F1]/80 leading-relaxed">
              Upload your existing resume and we&apos;ll help you create a modern, shareable profile with AI-powered parsing.
            </p>
          </div>
        </div>

        {loading ? (
          <Card className="bg-background/90 backdrop-blur-md border-[#3498DB]/30">
            <CardContent className="py-12 sm:py-16">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-[#3498DB]" />
                <p className="text-[#34495E] dark:text-[#ECF0F1]/80">Loading...</p>
              </div>
            </CardContent>
          </Card>
        ) : !user ? (
          <Card className="bg-background/90 backdrop-blur-md border-[#3498DB]/30">
            <CardHeader className="pb-6">
              <CardTitle className="text-[#2C3E50] dark:text-[#ECF0F1] text-xl sm:text-2xl">
                Sign In to Upload Your Resume
              </CardTitle>
              <CardDescription className="text-[#34495E] dark:text-[#ECF0F1]/70 text-sm sm:text-base">
                Sign in to upload and automatically parse your resume with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg border border-[#3498DB]/30 bg-gradient-to-br from-[#3498DB]/10 to-transparent p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-[#3498DB]/30 to-[#3498DB]/10 p-3 shrink-0">
                    <Upload className="w-5 h-5 text-[#3498DB]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#2C3E50] dark:text-[#ECF0F1] mb-2 text-base">
                      AI-Powered Resume Parsing
                    </h3>
                    <p className="text-sm text-[#34495E] dark:text-[#ECF0F1]/80 mb-3 leading-relaxed">
                      Our AI will automatically extract your information from PDF, DOCX, or DOC files and create a beautiful, modern resume.
                    </p>
                    <ul className="space-y-2 text-sm text-[#34495E] dark:text-[#ECF0F1]/80">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#3498DB] shrink-0" />
                        Extract all your experience, education, and skills
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#3498DB] shrink-0" />
                        Save your resume to your account
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#3498DB] shrink-0" />
                        Edit and customize with ease
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => router.push('/login?returnTo=/upload-resume')}
                  className="flex-1 bg-gradient-to-r from-[#2C3E50] to-[#34495E] hover:from-[#34495E] hover:to-[#2C3E50] text-white shadow-lg shadow-[#2C3E50]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#2C3E50]/30"
                  size="default"
                >
                  Sign In to Upload
                </Button>
                <Button 
                  onClick={() => router.push('/create-resume')}
                  variant="outline"
                  className="flex-1 border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB]/10"
                  size="default"
                >
                  Build from Scratch
                </Button>
              </div>

              <p className="text-xs sm:text-sm text-center text-[#34495E] dark:text-[#ECF0F1]/70">
                Don&apos;t have an account?{' '}
                <a 
                  href="/login?returnTo=/upload-resume" 
                  className="text-[#3498DB] hover:text-[#2C3E50] dark:hover:text-[#ECF0F1] font-medium hover:underline transition-colors"
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
                <div className="mb-6">
                  <TabsList className="grid w-full grid-cols-2 h-14 sm:h-16 p-1.5 bg-gradient-to-br from-[#ECF0F1]/50 to-[#ECF0F1]/30 dark:from-[#2C3E50]/40 dark:to-[#2C3E50]/20 backdrop-blur-md border-2 border-[#3498DB]/20 rounded-2xl shadow-lg shadow-[#3498DB]/5">
                    <TabsTrigger 
                      value="existing" 
                      className="relative text-[#34495E] dark:text-[#ECF0F1]/80 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2C3E50] data-[state=active]:to-[#34495E] data-[state=active]:text-white transition-all duration-300 data-[state=active]:shadow-xl data-[state=active]:shadow-[#2C3E50]/30 text-sm sm:text-base rounded-xl h-full flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden xs:inline">Use Existing</span>
                      <span className="xs:hidden">Existing</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="upload" 
                      className="relative text-[#34495E] dark:text-[#ECF0F1]/80 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2C3E50] data-[state=active]:to-[#34495E] data-[state=active]:text-white transition-all duration-300 data-[state=active]:shadow-xl data-[state=active]:shadow-[#2C3E50]/30 text-sm sm:text-base rounded-xl h-full flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden xs:inline">Upload New</span>
                      <span className="xs:hidden">Upload</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Existing Files Tab Content */}
                <TabsContent value="existing" className="mt-0">
                  <UploadedFilesManager />
                </TabsContent>

                {/* Upload New Tab Content */}
                <TabsContent value="upload" className="mt-0">
                  <Card className="bg-background/90 backdrop-blur-md border-[#3498DB]/30 shadow-lg shadow-[#3498DB]/5">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#3498DB]/30 to-[#3498DB]/10">
                          <Upload className="w-5 h-5 text-[#3498DB]" />
                        </div>
                        <CardTitle className="text-[#2C3E50] dark:text-[#ECF0F1] text-xl sm:text-2xl">
                          Upload Resume
                        </CardTitle>
                      </div>
                      <CardDescription className="text-[#34495E] dark:text-[#ECF0F1]/70 text-sm sm:text-base">
                        Supports PDF, DOCX, and DOC files up to 10MB
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
            <div
              className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-[#3498DB] bg-gradient-to-br from-[#3498DB]/10 to-[#3498DB]/5 scale-[1.02]' 
                  : uploadStatus === 'error'
                  ? 'border-[#E74C3C]/50 bg-[#E74C3C]/5'
                  : uploadStatus === 'success'
                  ? 'border-[#2ECC71]/50 bg-[#2ECC71]/5'
                  : 'border-[#ECF0F1] dark:border-[#34495E]/50 hover:border-[#3498DB]/60 hover:bg-gradient-to-br hover:from-[#3498DB]/5 hover:to-transparent'
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
                <div className="space-y-3">
                  <Loader2 className="w-10 h-10 text-[#3498DB] mx-auto animate-spin" />
                  <div className="space-y-2">
                    <p className="text-base font-medium text-foreground">
                      {uploadStatus === 'uploading' ? 'Uploading...' : 'Parsing resume...'}
                    </p>
                    <p className="text-sm text-muted-foreground px-4">
                      {fileName}
                    </p>
                  </div>
                  <div className="max-w-xs mx-auto px-4">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">{progress}% complete</p>
                  </div>
                </div>
              ) : uploadStatus === 'success' ? (
                <div className="space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#2ECC71] mx-auto" />
                  <div>
                    <p className="text-base font-medium text-foreground">
                      Resume parsed successfully!
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Redirecting to editor...</p>
                  </div>
                </div>
              ) : uploadStatus === 'error' ? (
                <div className="space-y-3">
                  <AlertCircle className="w-10 h-10 text-[#E74C3C] mx-auto" />
                  <div>
                    <p className="text-base font-medium text-foreground">Upload failed</p>
                    <p className="text-sm text-muted-foreground mt-1">Please try again</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadStatus('idle');
                      setProgress(0);
                      setFileName('');
                    }}
                    size="sm"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#3498DB]/30 to-[#3498DB]/10">
                    <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-[#3498DB]" />
                  </div>
                  <div className="px-4">
                    <h3 className="text-base font-semibold mb-2 text-[#2C3E50] dark:text-[#ECF0F1]">
                      Drag and drop your resume here
                    </h3>
                    <p className="text-sm text-[#34495E] dark:text-[#ECF0F1]/70 mb-4">
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
                      className="bg-gradient-to-r from-[#2C3E50] to-[#34495E] hover:from-[#34495E] hover:to-[#2C3E50] text-white shadow-lg shadow-[#2C3E50]/20 transition-all duration-300"
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                  <p className="text-xs sm:text-sm text-[#34495E] dark:text-[#ECF0F1]/60 px-4">
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
          <>
            {/* How It Works Section */}
            <Card className="bg-background/90 backdrop-blur-md border-[#3498DB]/30 mt-8">
              <CardHeader className="pb-4">
                <CardTitle className="text-[#2C3E50] dark:text-[#ECF0F1]">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 bg-gradient-to-br from-[#3498DB]/30 to-[#3498DB]/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#3498DB]">1</span>
                </div>
                <div>
                  <p className="font-semibold text-[#2C3E50] dark:text-[#ECF0F1] mb-0.5 text-sm">Upload Your Resume</p>
                  <p className="text-xs text-[#34495E] dark:text-[#ECF0F1]/70">
                    We support PDF, DOCX, and DOC files up to 10MB
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 bg-gradient-to-br from-[#3498DB]/30 to-[#3498DB]/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#3498DB]">2</span>
                </div>
                <div>
                  <p className="font-semibold text-[#2C3E50] dark:text-[#ECF0F1] mb-0.5 text-sm">AI Parses Your Data</p>
                  <p className="text-xs text-[#34495E] dark:text-[#ECF0F1]/70">
                    Our AI extracts all your information automatically
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 bg-gradient-to-br from-[#3498DB]/30 to-[#3498DB]/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#3498DB]">3</span>
                </div>
                <div>
                  <p className="font-semibold text-[#2C3E50] dark:text-[#ECF0F1] mb-0.5 text-sm">Publish & Share</p>
                  <p className="text-xs text-[#34495E] dark:text-[#ECF0F1]/70">
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

