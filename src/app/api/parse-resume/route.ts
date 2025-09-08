import { NextRequest, NextResponse } from "next/server";
import { parseResumeFromPdf, extractPdfText } from "@/utils/pdf-parser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    try {
      const parsed = await parseResumeFromPdf(file);
      return NextResponse.json({ ok: true, parsed });
    } catch (err) {
      try {
        const rawText = await extractPdfText(file);
        return NextResponse.json({ ok: true, parsed: { text: rawText } });
      } catch (fallbackErr) {
        return NextResponse.json({ error: "Failed to parse PDF" }, { status: 422 });
      }
    }
  } catch (e) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}


