import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Sparkles,
  Rocket,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { BeamsUpstream } from "@/components/ui/beams-upstream";

export const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Beams Background - Only in Hero */}
      <BeamsUpstream className="absolute inset-0 z-0 opacity-70 dark:opacity-40" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
        <div className="max-w-6xl mx-auto flex flex-col justify-center items-center h-full">
          {/* Announcement Badge - bounces in */}
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md border-2 border-primary/40 rounded-full px-4 py-2 sm:px-6 sm:py-3 mb-10 shadow-lg shadow-primary/20 animate-bounce-in hover-glow cursor-pointer">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm lg:text-base font-bold text-primary">
              Beta Version — Early Access
            </span>
          </div>

          {/* Main Headline - slides up with stagger - Using clamp for fluid scaling */}
          <h1 className="font-extrabold text-balance leading-[1.15] stagger-children mb-10" style={{ fontSize: 'clamp(2rem, 7vw + 0.5rem, 4.5rem)' }}>
            <span className="gradient-text-enhanced block mb-2 hover-text-gradient">Build smarter.</span>
            <span className="text-foreground block mb-2 hover:text-primary transition-colors duration-300">Apply faster.</span>
            <span className="gradient-text-enhanced block hover-text-gradient">Track everything.</span>
          </h1>

          {/* Subtitle - fades and slides up - Using clamp for fluid scaling */}
          <p className="text-muted-foreground leading-relaxed max-w-4xl mx-auto animate-slide-up-fade animation-delay-400 hover:text-foreground transition-colors duration-300 px-4 sm:px-6 lg:px-0 mb-10" style={{ fontSize: 'clamp(0.875rem, 1.5vw + 0.25rem, 1.25rem)', lineHeight: '1.6' }}>
            Verfolia is on a mission to bring transparency to your career.
            Build your profile, share your link, and track who&#39;s engaging
            with your story. It&#39;s time to stop feeling invisible and start
            knowing you&#39;ve been seen.
          </p>

          {/* CTA Buttons - zoom in */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-zoom-in animation-delay-500 px-4 sm:px-0 mb-10">
            <Button
              asChild
              size="lg"
              className="group px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 hover-lift w-full sm:w-auto"
              style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }}
            >
              <Link href="/choice">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:rotate-45 group-hover:scale-125 transition-all duration-500" />
                Get Started Free
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 h-auto glass-card border-2 hover:border-primary/50 hover:bg-primary/5 hover:scale-105 transition-all duration-500 hover-lift w-full sm:w-auto"
              style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }}
            >
              <Link href="/upload-resume">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:translate-y-[-4px] transition-transform duration-300" />
                Upload Resume
              </Link>
            </Button>
          </div>

          {/* Trust Indicators - staggered fade in */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-muted-foreground stagger-children px-4 sm:px-0">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 glass-card rounded-full hover-lift hover:border-emerald-500/30 border border-transparent transition-all duration-300 cursor-pointer">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 group-hover:scale-125 transition-transform duration-300" />
              <span className="font-medium hover:text-foreground transition-colors duration-300" style={{ fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)' }}>AI-powered resume builder</span>
            </div>
          </div>
        </div>

        {/* Enhanced Floating Elements with animations */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-xl animate-float hidden md:block opacity-60 hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-blue-500/15 to-cyan-500/15 rounded-full blur-2xl animate-float-delayed hidden md:block opacity-60 hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-float hidden md:block opacity-60 hover:opacity-100 transition-opacity duration-300" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-full blur-lg animate-pulse hidden md:block opacity-60 hover:opacity-100 transition-opacity duration-300" style={{ animationDelay: "3s" }} />
      </div>
    </section>
  );
};
