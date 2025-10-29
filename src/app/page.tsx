import { AppLayout } from "@/components/layout/app-layout";
import { AnimatedBackground } from "@/components/layout/animated-background";
import {
  HeroSection,
  ResumeBuilderShowcaseSection,
  AnalyticsShowcaseSection,
  AIAssistantSection,
  CTASection,
} from "@/components/landing";

const HomePage = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background font-jakarta animate-fade-in relative overflow-hidden">
        <AnimatedBackground />

        {/* Content */}
        <div className="relative z-20">
          <HeroSection />
          <ResumeBuilderShowcaseSection />
          <AnalyticsShowcaseSection />
          <AIAssistantSection />
          <CTASection />
        </div>
      </div>
    </AppLayout>
  );
};

export default HomePage;
