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
    <section className="relative pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 overflow-hidden">
      {/* Animated Beams Background - Only in Hero */}
      <BeamsUpstream className="absolute inset-0 z-0 opacity-70 dark:opacity-40" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Announcement Badge - bounces in */}
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md border-2 border-primary/40 rounded-full px-4 py-2 sm:px-6 sm:py-3 mb-6 sm:mb-8 shadow-lg shadow-primary/20 animate-bounce-in hover-glow cursor-pointer">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-primary">
              Beta Version — Early Access
            </span>
          </div>

          {/* Main Headline - slides up with stagger */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-extrabold mb-6 sm:mb-8 lg:mb-10 text-balance leading-[1.25] stagger-children">
            <span className="gradient-text-enhanced block mb-2 sm:mb-3 lg:mb-4 hover-text-gradient">Build smarter.</span>
            <span className="text-foreground block mb-2 sm:mb-3 lg:mb-4 hover:text-primary transition-colors duration-300">Apply faster.</span>
            <span className="gradient-text-enhanced block pb-2 sm:pb-3 lg:pb-4 hover-text-gradient">Track everything.</span>
          </h1>

          {/* Subtitle - fades and slides up */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 lg:mb-12 leading-relaxed max-w-3xl mx-auto animate-slide-up-fade animation-delay-400 hover:text-foreground transition-colors duration-300 px-4 sm:px-0">
            Verfolia is on a mission to bring transparency to your career.
            Build your profile, share your link, and track who&#39;s engaging
            with your story. It&#39;s time to stop feeling invisible and start
            knowing you&#39;ve been seen.
          </p>

          {/* CTA Buttons - zoom in */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-12 lg:mb-16 animate-zoom-in animation-delay-500 px-4 sm:px-0">
            <Button
              asChild
              size="lg"
              className="group text-base sm:text-lg px-6 sm:px-8 lg:px-10 py-5 sm:py-6 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-500 hover-lift w-full sm:w-auto"
            >
              <Link href="/choice">
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:rotate-45 group-hover:scale-125 transition-all duration-500" />
                Get Started Free
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base sm:text-lg px-6 sm:px-8 lg:px-10 py-5 sm:py-6 h-auto glass-card border-2 hover:border-primary/50 hover:bg-primary/5 hover:scale-110 transition-all duration-500 hover-lift w-full sm:w-auto"
            >
              <Link href="/upload-resume">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:translate-y-[-4px] transition-transform duration-300" />
                Upload Resume
              </Link>
            </Button>
          </div>

          {/* Trust Indicators - staggered fade in */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-sm text-muted-foreground stagger-children px-4 sm:px-0">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 glass-card rounded-full hover-lift hover:border-emerald-500/30 border border-transparent transition-all duration-300 cursor-pointer">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 group-hover:scale-125 transition-transform duration-300" />
              <span className="text-xs sm:text-sm font-medium hover:text-foreground transition-colors duration-300">AI-powered resume builder</span>
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
