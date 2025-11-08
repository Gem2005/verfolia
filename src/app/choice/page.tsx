"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, PenSquare, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { storageHelpers } from "@/utils/storage";
import { AnimatedBackground } from "@/components/layout/animated-background";

export const dynamic = "force-dynamic";

export default function ChoicePage() {
  const router = useRouter();

  const handleSelect = (option: "upload" | "create") => {
    try {
      storageHelpers.setSelectedOption(option);
    } catch {}
    
    if (option === "upload") router.push("/upload-resume");
    else router.push("/create-resume");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <AnimatedBackground />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 max-w-6xl relative z-10">
        {/* Back Button */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="group border border-[#34495E]/30 hover:bg-[#2C3E50]/10 hover:border-[#3498DB]/50 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-[#2C3E50] via-[#3498DB] to-[#2C3E50] bg-clip-text text-transparent">
            How would you like to start?
          </h1>
          <p className="text-base sm:text-lg text-[#34495E] dark:text-[#ECF0F1]/80 max-w-2xl mx-auto px-4">
            Choose your path to create a professional, shareable resume with detailed analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-8 sm:mb-10">
          {/* Upload PDF Card */}
          <Card className="bg-background/90 backdrop-blur-md border-[#3498DB]/30 hover:border-[#3498DB]/60 transition-all duration-300 hover:shadow-xl hover:shadow-[#3498DB]/10 hover:-translate-y-1 group">
            <CardHeader className="pb-4 space-y-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#3498DB]/20 to-[#3498DB]/5 group-hover:from-[#3498DB]/30 group-hover:to-[#3498DB]/10 transition-all duration-300">
                <Upload className="w-6 h-6 text-[#3498DB]" />
              </div>
              <CardTitle className="text-center text-xl sm:text-2xl font-bold text-[#2C3E50] dark:text-[#ECF0F1]">
                Upload PDF Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-[#34495E] dark:text-[#ECF0F1]/70 leading-relaxed">
                Let our AI extract your information and create a beautiful resume automatically.
              </p>
              
              <div className="space-y-2 bg-[#ECF0F1]/30 dark:bg-[#2C3E50]/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-[#34495E] dark:text-[#ECF0F1]/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3498DB] shrink-0" />
                  <span>Automatic data extraction</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#34495E] dark:text-[#ECF0F1]/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3498DB] shrink-0" />
                  <span>Smart parsing with AI</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#34495E] dark:text-[#ECF0F1]/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3498DB] shrink-0" />
                  <span>Save time and effort</span>
                </div>
              </div>

              <Button 
                onClick={() => handleSelect("upload")} 
                className="w-full bg-gradient-to-r from-[#2C3E50] to-[#34495E] hover:from-[#34495E] hover:to-[#2C3E50] text-white shadow-lg shadow-[#2C3E50]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#2C3E50]/30 hover:scale-[1.02]"
                size="default"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Resume
              </Button>
            </CardContent>
          </Card>

          {/* Build From Scratch Card */}
          <Card className="bg-background/90 backdrop-blur-md border-[#3498DB]/30 hover:border-[#3498DB]/60 transition-all duration-300 hover:shadow-xl hover:shadow-[#3498DB]/10 hover:-translate-y-1 group">
            <CardHeader className="pb-4 space-y-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#3498DB]/20 to-[#3498DB]/5 group-hover:from-[#3498DB]/30 group-hover:to-[#3498DB]/10 transition-all duration-300">
                <PenSquare className="w-6 h-6 text-[#3498DB]" />
              </div>
              <CardTitle className="text-center text-xl sm:text-2xl font-bold text-[#2C3E50] dark:text-[#ECF0F1]">
                Build From Scratch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-[#34495E] dark:text-[#ECF0F1]/70 leading-relaxed">
                Create your resume step-by-step with our intuitive guided editor.
              </p>
              
              <div className="space-y-2 bg-[#ECF0F1]/30 dark:bg-[#2C3E50]/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-[#34495E] dark:text-[#ECF0F1]/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3498DB] shrink-0" />
                  <span>Step-by-step guidance</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#34495E] dark:text-[#ECF0F1]/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3498DB] shrink-0" />
                  <span>Full creative control</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#34495E] dark:text-[#ECF0F1]/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3498DB] shrink-0" />
                  <span>Professional templates</span>
                </div>
              </div>

              <Button 
                onClick={() => handleSelect("create")}
                className="w-full bg-gradient-to-r from-[#2C3E50] to-[#34495E] hover:from-[#34495E] hover:to-[#2C3E50] text-white shadow-lg shadow-[#2C3E50]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#2C3E50]/30 hover:scale-[1.02]"
                size="default"
              >
                <PenSquare className="w-4 h-4 mr-2" />
                Start Building
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


