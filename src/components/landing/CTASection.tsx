"use client";

import { Button } from "@/components/ui/button";
import {
  Rocket,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export const CTASection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/15 to-purple-500/15 rounded-full blur-3xl animate-float opacity-60 hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl animate-float-delayed opacity-60 hover:opacity-100 transition-opacity duration-700" />

      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-1000 ${isVisible ? 'scroll-reveal visible' : 'scroll-reveal'}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-balance leading-tight px-4 sm:px-0">
            Ready to transform your{" "}
            <span className="gradient-text-enhanced">career journey?</span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 lg:mb-12 leading-relaxed max-w-2xl mx-auto px-4 sm:px-0">
            Start building your professional identity today with AI-powered
            tools and real-time analytics. Get started completely free.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-12 lg:mb-14 px-4 sm:px-0">
            <Button
              size="lg"
              className="group text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 h-auto bg-gradient-to-r from-primary via-purple-600 to-blue-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-blue-600/90 shadow-2xl hover:shadow-[0_0_60px_rgba(139,92,246,0.4)] hover:scale-105 transition-all duration-300 animate-glow-pulse hover-glow w-full sm:w-auto"
              asChild
            >
              <Link href="/create-resume">
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
                Start Building for Free
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 h-auto glass-card border-2 hover:border-primary/50 hover:bg-primary/5 hover:scale-105 transition-all duration-300 group hover-lift w-full sm:w-auto"
            >
              Talk to Sales
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
