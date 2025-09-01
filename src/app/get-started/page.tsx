"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, PenSquare } from "lucide-react";

export default function GetStartedPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">How would you like to start?</h1>
      <p className="text-muted-foreground mb-8">
        Upload your existing PDF resume for instant parsing, or build a new profile from scratch.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" /> Upload PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Drag and drop your resume PDF. We&apos;ll parse your info and prefill the editor.
            </p>
            <Button onClick={() => router.push("/upload-resume")}>Upload PDF</Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenSquare className="w-5 h-5" /> Build from Scratch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Start with a clean canvas using our guided editor.
            </p>
            <Link href="/create-resume">
              <Button variant="outline">Start Building</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


