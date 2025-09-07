"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, PenSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const dynamic = "force-dynamic";

export default function ChoicePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Always show choice; if already authenticated, clicking goes straight to destination
  const handleSelect = (option: "upload" | "create") => {
    try {
      localStorage.setItem("selectedOption", option);
    } catch {}
    if (!user) {
      router.push("/login");
      return;
    }
    if (option === "upload") router.push("/upload");
    else router.push("/create");
  };

  // No blocking spinners here – choice must be shown even pre-auth
  return (
    <div className="glass-bg min-h-screen">
      <div className="container mx-auto max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6 text-glass-white">How would you like to start?</h1>
        <p className="text-glass-gray mb-8">
          Upload your existing PDF resume or build a new profile from scratch.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card hover:border-glass-blue transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-glass-white">
                <Upload className="w-5 h-5 text-glass-blue" /> Upload PDF Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-glass-gray">
                We'll parse your PDF and prefill the editor.
              </p>
              <Button onClick={() => handleSelect("upload")} className="glass-button">Upload PDF</Button>
            </CardContent>
          </Card>

          <Card className="glass-card hover:border-glass-blue transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-glass-white">
                <PenSquare className="w-5 h-5 text-glass-blue" /> Build From Scratch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-glass-gray">Start with a blank editor.</p>
              <Button variant="outline" onClick={() => handleSelect("create")} className="glass-button">
                Start Building
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


