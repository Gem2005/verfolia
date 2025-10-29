import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let wasPrivate = false;
  let resumeId: string | null = null;
  const supabase = await createClient();
  
  try {
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    resumeId = id;

    // Get resume data directly using server-side Supabase client
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (resumeError || !resume) {
      console.error('Error fetching resume:', resumeError);
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Verify ownership
    if (resume.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if resume is public, if not, temporarily make it public for PDF generation
    wasPrivate = !resume.is_public;
    
    if (wasPrivate) {
      console.log('Resume is private, temporarily making it public for PDF generation');
      await supabase
        .from('resumes')
        .update({ is_public: true })
        .eq('id', resumeId);
    }

    // Generate PDF from the resume page
    const publicUrl = `${request.nextUrl.origin}/resume/${resume.slug}`;

    let browser;
    try {
      // Determine if we're in production (Vercel) or development
      const isDev = process.env.NODE_ENV === 'development';
      
      let puppeteer;
      let chromium;
      
      if (isDev) {
        // For local development, use full puppeteer with bundled Chromium
        puppeteer = await import('puppeteer');
        browser = await puppeteer.default.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
      } else {
        // For production (Vercel), use puppeteer-core with @sparticuz/chromium
        puppeteer = await import('puppeteer-core');
        chromium = await import('@sparticuz/chromium');
        browser = await puppeteer.default.launch({
          args: chromium.default.args,
          defaultViewport: { width: 1920, height: 1080 },
          executablePath: await chromium.default.executablePath(),
          headless: true,
        });
      }

      const page = await browser.newPage();
      
      // Set viewport for better rendering
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Emulate screen media instead of print to avoid print.css issues
      await page.emulateMediaType('screen');
      
      // Enable console logging from the page for debugging
      page.on('console', msg => console.log('PAGE LOG:', msg.text()));
      
      console.log('Navigating to:', publicUrl);
      
      // Navigate to the resume page
      await page.goto(publicUrl, { 
        waitUntil: ["networkidle0", "load", "domcontentloaded"],
        timeout: 60000 
      });

      console.log('Page loaded, waiting for content...');

      // Wait for the main content to be visible
      try {
        await page.waitForSelector('body', { timeout: 10000 });
        console.log('Body element found');
      } catch (e) {
        console.error('Failed to find body element:', e);
      }

      // Wait for fonts and styles to load
      await page.evaluateHandle('document.fonts.ready');
      console.log('Fonts loaded');
      
      // Additional wait for React hydration and any dynamic content
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if content is actually rendered
      const hasContent = await page.evaluate(() => {
        return document.body.innerText.length > 100;
      });
      
      console.log('Page has content:', hasContent);
      
      if (!hasContent) {
        console.warn('Page appears to be empty, taking screenshot for debugging...');
      }

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: false,
        margin: {
          top: "0mm",
          right: "0mm",
          bottom: "0mm",
          left: "0mm",
        },
      });

      console.log('PDF generated, size:', pdfBuffer.length);

      await browser.close();
      
      // Restore privacy setting if it was private
      if (wasPrivate) {
        console.log('Restoring resume to private');
        await supabase
          .from('resumes')
          .update({ is_public: false })
          .eq('id', resumeId);
      }

      // Return PDF as downloadable file with proper filename
      const sanitizedTitle = resume.title
        .replace(/[^a-z0-9\s-]/gi, '')
        .replace(/\s+/g, '_')
        .toLowerCase()
        .trim();
      
      // Ensure we have a valid filename
      const filename = sanitizedTitle || 'resume';
      
      console.log('Sending PDF with filename:', `${filename}.pdf`);
      
      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}.pdf"`,
          "Cache-Control": "no-cache",
        },
      });
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError);
      if (browser) {
        await browser.close();
      }
      
      // Restore privacy setting if it was private
      if (wasPrivate) {
        console.log('Restoring resume to private after error');
        await supabase
          .from('resumes')
          .update({ is_public: false })
          .eq('id', resumeId);
      }
      
      return NextResponse.json(
        { error: "Failed to generate PDF" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error downloading resume:", error);
    return NextResponse.json(
      { error: "Failed to download resume" },
      { status: 500 }
    );
  }
}
