"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Award,
  TrendingUp,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export const ResumeBuilderShowcaseSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  
  return (
    <section ref={ref as React.RefObject<HTMLElement>} id="features" className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
      {/* Animated background orb */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-500/8 to-pink-500/8 rounded-full blur-3xl animate-float opacity-60 hover:opacity-100 transition-opacity duration-700" />
      
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${isVisible ? 'scroll-reveal visible' : 'scroll-reveal'}`}>
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-20 items-center">
          <div className="order-1 lg:order-1 space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-balance leading-tight">
                Craft your professional story in{" "}
                <span className="gradient-text-enhanced">minutes</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                Our intuitive identity builder allows you to import your
                existing documents or start from scratch. We help you create a
                clean, modern profile that&#39;s optimized to show your unique
                value and gets noticed for all the right reasons.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {[
                { text: "Stunning, Dynamic Profiles", icon: Star },
                { text: "4+ professional templates", icon: Award },
                { text: "A Profile Optimized for Humans", icon: Sparkles },
                { text: "The PDF is not a dead end", icon: FileText },
                { text: "The Future is a Shared Experience", icon: TrendingUp },
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 sm:space-x-4 group hover-lift cursor-default">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-primary/30 border border-primary/20 flex-shrink-0">
                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-foreground font-semibold text-sm sm:text-base lg:text-lg group-hover:text-primary transition-colors duration-300">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <Button 
              size="lg"
              className="group text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 hover-glow w-full sm:w-auto"
              asChild
            >
              <Link href="/login">
                Start Building
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
              </Link>
            </Button>
          </div>

          <div className="order-2 lg:order-2 animate-slide-in-right">
            <div className="relative group">
              {/* Main Card */}
              <div className="glass-card-strong p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(139,92,246,0.3)]">
                <div className="aspect-[4/5] bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden p-8">
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                  
                  {/* Mock Resume Lines */}
                  <div className="w-full space-y-4 mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-primary/30 rounded-full w-3/4 animate-pulse" style={{ animationDelay: '100ms' }} />
                        <div className="h-2 bg-primary/20 rounded-full w-1/2 animate-pulse" style={{ animationDelay: '200ms' }} />
                      </div>
                    </div>
                    <div className="space-y-2 mt-6">
                      <div className="h-2 bg-primary/30 rounded-full w-full animate-pulse" style={{ animationDelay: '300ms' }} />
                      <div className="h-2 bg-primary/25 rounded-full w-5/6 animate-pulse" style={{ animationDelay: '400ms' }} />
                      <div className="h-2 bg-primary/20 rounded-full w-4/6 animate-pulse" style={{ animationDelay: '500ms' }} />
                    </div>
                    <div className="space-y-2 mt-6">
                      <div className="h-3 bg-primary/30 rounded-full w-2/5 animate-pulse" style={{ animationDelay: '600ms' }} />
                      <div className="h-2 bg-primary/20 rounded-full w-full animate-pulse" style={{ animationDelay: '700ms' }} />
                      <div className="h-2 bg-primary/20 rounded-full w-3/4 animate-pulse" style={{ animationDelay: '800ms' }} />
                    </div>
                  </div>
                  
                  <div className="text-center relative z-10">
                    <div className="mb-4 relative">
                      <FileText className="w-16 h-16 text-primary mx-auto drop-shadow-lg" />
                      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    </div>
                    <p className="text-muted-foreground font-medium text-sm">Interactive Resume Preview</p>
                    <div className="mt-3 flex justify-center gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-primary/50 rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 glass-card p-3 sm:p-4 rounded-2xl backdrop-blur-xl shadow-xl border-2 border-primary/30 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
              </div>
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 glass-card p-3 sm:p-4 rounded-2xl backdrop-blur-xl shadow-xl border-2 border-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
