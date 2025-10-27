"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Eye,
  Sparkles,
  TrendingUp,
  Activity,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export const AnalyticsShowcaseSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
      {/* Animated background orb */}
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-cyan-500/8 rounded-full blur-3xl animate-float-delayed opacity-60 hover:opacity-100 transition-opacity duration-700" />
      
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${isVisible ? 'scroll-reveal visible' : 'scroll-reveal'}`}>
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-20 items-center">
          <div className="order-1 lg:order-2 space-y-6 sm:space-y-8 animate-slide-in-right">
            <div>
              <Badge className="mb-4 sm:mb-6 bg-blue-500/20 backdrop-blur-md text-blue-500 border-2 border-blue-500/40 px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 inline" />
                Analytics & Insights
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-balance leading-tight">
                Know you&apos;ve been{" "}
                <span className="gradient-text-enhanced">seen</span>, every single time.
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                Verfolia ends the guesswork. Our real-time analytics turn your
                profile into a data-powered asset, giving you the clarity and
                confidence to know that your professional story is getting
                noticed.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {[
                { text: "Live engagement tracking", icon: Activity },
                { text: "Geographic analytics", icon: MapPin },
                { text: "Time-based engagement data", icon: TrendingUp },
                { text: "Behavioral heatmaps", icon: Eye },
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 sm:space-x-4 group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  </div>
                  <span className="text-foreground font-semibold text-sm sm:text-base lg:text-lg group-hover:text-blue-500 transition-colors duration-300">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Button
                size="lg"
                className="group text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                asChild
              >
                <Link href="/analytics">
                  View Analytics
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto glass-card border-2 hover:border-blue-500/50 hover:bg-blue-500/5 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                See Demo
              </Button>
            </div>
          </div>

          <div className="order-2 lg:order-1 animate-slide-in-left">
            <div className="relative group">
              {/* Main Analytics Card */}
              <div className="glass-card-strong p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl border-2 border-blue-500/20 group-hover:border-blue-500/40 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] hover-tilt hover-lift">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Grid Background */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                  
                  {/* Mock Chart Elements */}
                  <div className="absolute inset-6 flex items-end justify-around gap-2">
                    {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-blue-500/50 to-blue-500/20 rounded-t-lg backdrop-blur-sm animate-pulse"
                        style={{ 
                          height: `${height}%`,
                          animationDelay: `${i * 150}ms`
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="text-center relative z-10">
                    <BarChart3 className="w-16 h-16 sm:w-20 sm:h-20 text-blue-500 mx-auto mb-4 drop-shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
                    <p className="text-muted-foreground font-medium text-sm sm:text-base lg:text-lg group-hover:text-foreground transition-colors duration-300">
                      Analytics Dashboard
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 glass-card p-3 sm:p-5 rounded-2xl backdrop-blur-xl shadow-xl border-2 border-blue-500/30 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                <div className="text-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mx-auto mb-1" />
                  <div className="text-2xl sm:text-3xl font-bold gradient-text-enhanced">1.2k</div>
                  <div className="text-xs text-muted-foreground font-medium">Views</div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 glass-card p-3 sm:p-5 rounded-2xl backdrop-blur-xl shadow-xl border-2 border-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <div className="text-center">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto mb-1" />
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-500">85%</div>
                  <div className="text-xs text-muted-foreground font-medium">Engagement</div>
                </div>
              </div>

              {/* Additional floating badge */}
              <div className="absolute top-1/2 -left-3 sm:-left-4 glass-card p-2 sm:p-3 rounded-xl backdrop-blur-xl shadow-lg border border-purple-500/30 group-hover:scale-110 transition-all duration-500">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
