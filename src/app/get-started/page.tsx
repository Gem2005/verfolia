"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, PenSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const dynamic = "force-dynamic";

export default function GetStartedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect unauthenticated users to login with returnTo
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?returnTo=/get-started');
    }
  }, [loading, user, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="glass-bg flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-glass-blue mx-auto mb-4"></div>
          <p className="text-glass-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading if not authenticated
  if (!user) {
    return (
      <div className="glass-bg flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-glass-blue mx-auto mb-4"></div>
          <p className="text-glass-white">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-bg min-h-screen">
      <div className="container mx-auto max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6 text-glass-white">How would you like to start?</h1>
        <p className="text-glass-gray mb-8">
          Upload your existing PDF resume for instant parsing, or build a new profile from scratch.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card hover:border-glass-blue transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-glass-white">
                <Upload className="w-5 h-5 text-glass-blue" /> Upload PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-glass-gray">
                Drag and drop your resume PDF. We&apos;ll parse your info and prefill the editor.
              </p>
              <Button onClick={() => router.push("/upload-resume")} className="glass-button">Upload PDF</Button>
            </CardContent>
          </Card>

          <Card className="glass-card hover:border-glass-blue transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-glass-white">
                <PenSquare className="w-5 h-5 text-glass-blue" /> Build from Scratch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-glass-gray">
                Start with a clean canvas using our guided editor.
              </p>
              <Link href="/create-resume">
                <Button variant="outline" className="glass-button">Start Building</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


