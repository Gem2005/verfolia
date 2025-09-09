"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { marked } from "marked";

const loadPdfJs = async () => {
  const pdfjs: any = await import("pdfjs-dist");
  const workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  try {
    // @ts-ignore
    // no-op: rely on CDN workerSrc
  } catch {}
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  } catch {}
  return pdfjs;
};

function textToMarkdown(text: string): string {
  if (!text) return "";
  return text
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (/^(summary|experience|education|skills|projects|certifications|languages|awards|interests|objective)\b/i.test(trimmed)) {
        return `## ${trimmed}`;
      }
      if (/^[•\-*]\s+/.test(trimmed)) {
        return trimmed.replace(/^[•\-*]\s+/, "- ");
      }
      return trimmed;
    })
    .join("\n");
}

export default function GoogleMarkdownEditor() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [markdown, setMarkdown] = useState<string>(
    `# Welcome!\n\nSign in and upload a PDF resume to auto-fill.\n\n## Education\n- Degree — School (Dates)\n\n## Experience\n- Title — Company (Dates)\n  - Achievement bullet\n\n## Skills\n- JavaScript\n- React\n- Next.js\n`
  );
  const [isParsing, setIsParsing] = useState(false);

  const html = useMemo(() => {
    marked.setOptions({ breaks: true, gfm: true });
    return marked.parse(markdown || "");
  }, [markdown]);

  const onChooseFile = () => fileInputRef.current?.click();

  const parsePdfToText = useCallback(async (file: File): Promise<string> => {
    const pdfjs: any = await loadPdfJs();
    const data = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data }).promise;
    let full = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const strings = textContent.items.map((it: any) => it.str).join(" ");
      full += strings + "\n\n";
    }
    return full.trim();
  }, []);

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const file = files[0];
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload a PDF file.");
      return;
    }
    setIsParsing(true);
    try {
      const text = await parsePdfToText(file);
      const md = textToMarkdown(text);
      setMarkdown(md || text || markdown);
    } catch (err) {
      console.error("PDF parse error:", err);
      alert("Failed to parse PDF. Please try another file.");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-noise relative">
      <header className="fixed top-0 inset-x-0 z-50">
        <div
          className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between rounded-b-2xl border border-white/15"
          style={{ backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg border border-white/20 flex items-center justify-center text-white/80">MD</div>
            <span className="text-white font-semibold">Glass Markdown Editor</span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <button
                  onClick={onChooseFile}
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-[#E6E6FA33] text-white hover:text-[#E6E6FA] hover:border-[#E6E6FA66]"
                  style={{ backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.06)" }}
                >
                  Upload PDF
                </button>
                <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={onFileSelected} className="hidden" />
                <div className="h-8 w-8 rounded-full overflow-hidden border border-white/20">
                  {session?.user?.image ? (
                    <Image src={session.user.image} alt="profile" width={32} height={32} />
                  ) : (
                    <div className="h-full w-full bg-white/10" />
                  )}
                </div>
                <span className="hidden sm:inline text-white/80 text-sm">{session?.user?.name || "User"}</span>
              </>
            )}

            {!isAuthenticated ? (
              <button
                onClick={() => signIn("google")}
                className="px-4 py-2 rounded-xl border border-[#E6E6FA33] text-white hover:text-[#E6E6FA] hover:border-[#E6E6FA66]"
                style={{ backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.06)" }}
              >
                Sign in with Google
              </button>
            ) : (
              <button
                onClick={() => signOut()}
                className="px-4 py-2 rounded-xl text-[#0B0F15] font-medium"
                style={{ background: "#E6E6FA" }}
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-12">
        {!isAuthenticated ? (
          <div
            className="max-w-lg mx-auto mt-12 p-8 rounded-2xl border border-white/15 text-center"
            style={{ backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.06)" }}
          >
            <h1 className="text-2xl font-bold text-white mb-2">Welcome</h1>
            <p className="text-white/70 mb-6">Sign in to upload a PDF resume and edit it as Markdown.</p>
            <button
              onClick={() => signIn("google")}
              className="px-5 py-3 rounded-xl border border-[#E6E6FA33] text-white hover:text-[#E6E6FA] hover:border-[#E6E6FA66]"
              style={{ backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.06)" }}
            >
              Sign in with Google
            </button>
          </div>
        ) : (
          <>
            <div className="sm:hidden mb-4">
              <button
                onClick={onChooseFile}
                className="w-full px-4 py-2 rounded-xl border border-[#E6E6FA33] text-white hover:text-[#E6E6FA] hover:border-[#E6E6FA66]"
                style={{ backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.06)" }}
              >
                Upload PDF
              </button>
              <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={onFileSelected} className="hidden" />
            </div>

            <div className="sm:hidden mb-3 flex gap-2">
              <button
                onClick={() => setActiveTab("edit")}
                className={`flex-1 px-4 py-2 rounded-xl border ${activeTab === "edit" ? "border-[#E6E6FA] text-white" : "border-white/20 text-white/70"}`}
                style={{ backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.06)" }}
              >
                Edit
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex-1 px-4 py-2 rounded-xl border ${activeTab === "preview" ? "border-[#E6E6FA] text-white" : "border-white/20 text-white/70"}`}
                style={{ backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.06)" }}
              >
                Preview
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={`${activeTab === "edit" ? "" : "hidden sm:block"} rounded-2xl border border-white/15 overflow-hidden`}
                style={{ backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.06)" }}
              >
                <div className="px-4 py-2 text-white/70 border-b border-white/10 flex items-center justify-between">
                  <span>Markdown</span>
                  {isParsing && <span className="text-xs">Parsing PDF…</span>}
                </div>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full h-[50vh] sm:h-[65vh] bg-transparent outline-none p-4 text-white"
                  placeholder="# Start typing…"
                />
              </div>

              <div
                className={`${activeTab === "preview" ? "" : "hidden sm:block"} rounded-2xl border border-white/15 overflow-hidden`}
                style={{ backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.06)" }}
              >
                <div className="px-4 py-2 text-white/70 border-b border-white/10">Preview</div>
                <div
                  className="p-5 prose prose-invert max-w-none [&_a]:text-[#E6E6FA] [&_a:hover]:underline"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </div>
          </>
        )}
      </main>

      <style jsx global>{`
        .bg-noise {
          background-image:
            linear-gradient(180deg, #0B0F15 0%, #101722 100%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 40 40'%3E%3Cpath fill='%23ffffff08' d='M0 0h40v40H0z'/%3E%3C/svg%3E");
          background-size: cover, 160px 160px;
          background-blend-mode: overlay;
          min-height: 100vh;
        }
        .prose :where(code):not(:where(pre code)) {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          padding: .15rem .35rem;
          border-radius: .375rem;
        }
        .prose pre {
          background: rgba(16,23,34,.9);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: .75rem;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
}
