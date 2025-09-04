"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export const dynamic = "force-dynamic";

export default function UploadResumePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?returnTo=/upload');
    }
  }, [user, loading, router]);

  async function extractTextFromPdf(file: File): Promise<string> {
    // Dynamically import pdfjs for client-side only
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const pdfjs: any = await import("pdfjs-dist");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    const arrayBuffer = await file.arrayBuffer();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // @ts-ignore items typing
      const pageText = content.items.map((it: any) => it.str).join(" ");
      text += pageText + "\n";
    }
    return text;
  }

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file");
      return;
    }

    setError(null);
    setIsParsing(true);
    try {
      // Try client-side parsing first
      let parsedResume: any | null = null;
      try {
        const text = await extractTextFromPdf(file);
        // Reuse server mapping by posting text only
        const resp = await fetch("/api/parse-resume", {
          method: "POST",
          body: (() => { const fd = new FormData(); fd.append("file", file); return fd; })(),
        });
        if (resp.ok) {
          const data = await resp.json();
          parsedResume = data.parsedResume;
        }
      } catch (_) {
        // fall through to API-only
      }

      // If client parse+map failed, use API fallback
      if (!parsedResume) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/parse-resume", { method: "POST", body: formData });
        if (!response.ok) {
          const { error: apiError } = await response.json().catch(() => ({ error: "Failed to parse" }));
          throw new Error(apiError || "Failed to parse resume");
        }
        const { parsedResume: apiParsed } = await response.json();
        parsedResume = apiParsed;
      }

      if (!parsedResume) throw new Error("No parsed data returned");

      const storageKey = `parsed_resume_${Date.now()}`;
      sessionStorage.setItem(storageKey, JSON.stringify(parsedResume));
      router.push(`/create-resume?prefill=${encodeURIComponent(storageKey)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setIsParsing(false);
    }
  }, [router]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Upload your PDF resume</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragEnter={() => setDragActive(true)}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30"}`}
          >
            {isParsing ? (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="w-8 h-8 animate-pulse" />
                <p className="text-sm">Parsing your resume...</p>
              </div>
            ) : (
              <>
                <UploadCloud className="w-10 h-10 mx-auto mb-3" />
                <p className="text-sm mb-2">Drag & drop your PDF here</p>
                <p className="text-xs text-muted-foreground mb-4">or</p>
                <label>
                  <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={onChange} />
                  <Button type="button" variant="outline">Choose File</Button>
                </label>
              </>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm mt-4">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
            <CheckCircle2 className="w-4 h-4" />
            <span>We only process your file to extract resume content. Nothing is stored until you save.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


