import { AppLayout } from "@/components/layout/app-layout";
import { AnimatedBackground } from "@/components/layout/animated-background";
import {
  HeroSection,
  ResumeBuilderShowcaseSection,
  AnalyticsShowcaseSection,
  CTASection,
  FOMOBanner,
} from "@/components/landing";
import { Metadata } from "next";
import { StructuredData } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: 'Verfolia - Transform Your Resume into a Professional Portfolio with AI',
  description: 'Convert your resume to a stunning professional portfolio in seconds. Free AI-powered resume parser, beautiful templates, and advanced analytics to track your resume performance.',
  openGraph: {
    title: 'Verfolia - Transform Your Resume into a Professional Portfolio',
    description: 'Convert your resume to a stunning professional portfolio in seconds with AI. Track views, analyze engagement, and showcase your career.',
    url: 'https://verfolia.com',
    type: 'website',
  },
  alternates: {
    canonical: 'https://verfolia.com',
  },
};

const HomePage = () => {
  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData type="WebApplication" />
      <StructuredData type="Organization" />
      <StructuredData type="WebSite" />
      
      <AppLayout>
        <div className="min-h-screen bg-background font-jakarta animate-fade-in relative overflow-hidden">
          <AnimatedBackground />

          {/* Content */}
          <div className="relative z-20">
            <HeroSection />
            <ResumeBuilderShowcaseSection />
            <AnalyticsShowcaseSection />
            <CTASection />
          </div>

          {/* FOMO Banner */}
          <FOMOBanner />
        </div>
      </AppLayout>
    </>
  );
};

export default HomePage;
