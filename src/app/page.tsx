import { AppLayout } from "@/components/layout/app-layout";
import {
  HeroSection,
  FeaturesOverviewSection,
  ResumeBuilderShowcaseSection,
  AnalyticsShowcaseSection,
  AIAssistantSection,
  TestimonialsSection,
  CTASection,
} from "@/components/landing";

const HomePage = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background font-jakarta animate-fade-in">
        <HeroSection />
        <FeaturesOverviewSection />
        <ResumeBuilderShowcaseSection />
        <AnalyticsShowcaseSection />
        <AIAssistantSection />
        <TestimonialsSection />
        <CTASection />
      </div>
    </AppLayout>
  );
};

export default HomePage;
