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
    <div className="container mx-auto max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">How would you like to start?</h1>
      <p className="text-muted-foreground mb-8">
        Upload your existing PDF resume or build a new profile from scratch.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" /> Upload PDF Resume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We’ll parse your PDF and prefill the editor.
            </p>
            <Button onClick={() => handleSelect("upload")}>Upload PDF</Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenSquare className="w-5 h-5" /> Build From Scratch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Start with a blank editor.</p>
            <Button variant="outline" onClick={() => handleSelect("create")}>
              Start Building
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


