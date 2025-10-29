"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, PenSquare } from "lucide-react";
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

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 max-w-5xl relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
            How would you like to start?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Upload your existing PDF resume or build a new profile from scratch. You can save your progress when you&apos;re ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Upload PDF Card */}
          <Card className="bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-foreground text-xl sm:text-2xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                Upload PDF Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We&apos;ll parse your PDF and prefill the editor for you.
              </p>
              <Button 
                onClick={() => handleSelect("upload")} 
                className="w-full bg-primary hover:bg-primary/90 border border-primary"
                size="lg"
              >
                Upload PDF
              </Button>
            </CardContent>
          </Card>

          {/* Build From Scratch Card */}
          <Card className="bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-foreground text-xl sm:text-2xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <PenSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                Build From Scratch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Start with a clean slate using our guided editor.
              </p>
              <Button 
                variant="outline" 
                onClick={() => handleSelect("create")}
                className="w-full"
                size="lg"
              >
                Start Building
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


