"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, ArrowLeft } from "lucide-react";
import "../create-resume/glassmorphism.css";
import { parseResumeFromPdf } from "@/utils/pdf-parser";

export const dynamic = "force-dynamic";

export default function UploadResumePage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setIsProcessing(true);
    
    try {
      const parsed = await parseResumeFromPdf(file);

      const prefill = {
        title: `Resume from ${file.name}`,
        personalInfo: {
          fullName: parsed.personalInfo.fullName || "",
          email: parsed.personalInfo.email || "",
          phone: parsed.personalInfo.phone || "",
          location: parsed.personalInfo.location || "",
          headline: parsed.personalInfo.headline || "",
          website: parsed.personalInfo.links?.[0] || "",
        },
        skills: parsed.skills.map(s => ({ name: s, proficiency: "Intermediate" })),
        experience: parsed.experience.map(e => ({
          id: crypto.randomUUID(),
          company: e.company || "",
          role: e.role || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          location: e.location || "",
          description: e.description || "",
          technologies: [],
        })),
        education: parsed.education.map(ed => ({
          id: crypto.randomUUID(),
          institution: ed.institution || "",
          degree: ed.degree || "",
          field: ed.field || "",
          startDate: ed.startDate || "",
          endDate: ed.endDate || "",
          grade: ed.grade || "",
        })),
        projects: [],
        certifications: [],
        languages: [],
        customSections: [],
        rawText: parsed.text,
      };

      const sessionKey = `resume_upload_${Date.now()}`;
      sessionStorage.setItem(sessionKey, JSON.stringify(prefill));
      router.push(`/create-resume?prefill=${sessionKey}`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to process PDF. Please try again.');
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
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload">
                      <Button variant="outline" className="cursor-pointer glass-button">
                        <FileText className="w-4 h-4 mr-2" />
                        Choose PDF File
                      </Button>
                    </label>
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
