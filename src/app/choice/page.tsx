"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, PenSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { storageHelpers } from "@/utils/storage";

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
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6 text-bg-background">How would you like to start?</h1>
        <p className="text-text-muted-foreground mb-8">
          Upload your existing PDF resume or build a new profile from scratch. You can save your progress when you're ready.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card hover:border-text-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-bg-background">
                <Upload className="w-5 h-5 text-text-primary" /> Upload PDF Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-muted-foreground">
                We'll parse your PDF and prefill the editor for you.
              </p>
              <Button onClick={() => handleSelect("upload")} className="">Upload PDF</Button>
            </CardContent>
          </Card>

          <Card className="bg-card hover:border-text-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-bg-background">
                <PenSquare className="w-5 h-5 text-text-primary" /> Build From Scratch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-muted-foreground">Start with a clean slate using our guided editor.</p>
              <Button variant="outline" onClick={() => handleSelect("create")} className="">
                Start Building
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


