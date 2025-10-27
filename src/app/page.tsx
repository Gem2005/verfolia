import { AppLayout } from "@/components/layout/app-layout";
import {
  HeroSection,
  FeaturesOverviewSection,
  ResumeBuilderShowcaseSection,
  AnalyticsShowcaseSection,
  AIAssistantSection,
  CTASection,
} from "@/components/landing";

const HomePage = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background font-jakarta animate-fade-in relative overflow-hidden">
        {/* Consistent Background Gradients with Animations */}
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background animate-shimmer" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.08),transparent_50%)] animate-float" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(74,198,255,0.06),transparent_50%)] animate-float-delayed" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(167,139,250,0.04),transparent_70%)] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.015]" />
          
          {/* Animated accent orbs */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-40 right-20 w-80 h-80 bg-gradient-to-br from-blue-500/8 to-cyan-500/8 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        </div>

        {/* Content */}
        <div className="relative z-20">
          <HeroSection />
          <FeaturesOverviewSection />
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
