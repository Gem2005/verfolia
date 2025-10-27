"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Target,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export const AIAssistantSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const features = [
    {
      icon: Brain,
      title: "Smart Cover Letters",
      description: "Generate personalized cover letters that match job requirements and highlight your unique strengths.",
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
    },
    {
      icon: Target,
      title: "Job Matching",
      description: "AI analyzes job descriptions and suggests optimizations to improve your compatibility score.",
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
    },
    {
      icon: MessageSquare,
      title: "Interview Prep",
      description: "Practice with AI-generated questions tailored to your industry and specific role requirements.",
      gradient: "from-emerald-500 to-teal-500",
      iconBg: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10",
    },
  ];

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
      {/* Animated background accent */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/6 to-pink-500/6 rounded-full blur-3xl animate-float opacity-60 hover:opacity-100 transition-opacity duration-700" />
      
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-1000 ${isVisible ? 'scroll-reveal visible' : 'scroll-reveal'}`}>
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <Badge className="mb-4 sm:mb-6 bg-purple-500/20 backdrop-blur-md text-purple-500 border-2 border-purple-500/40 px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/20">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 inline" />
            AI-Powered
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-balance px-4 sm:px-0">
            Your AI career <span className="gradient-text-enhanced">copilot</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Let artificial intelligence guide your career journey with
            personalized recommendations, smart content generation, and
            data-driven insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group relative overflow-hidden glass-card-strong border-2 border-primary/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-up hover-tilt hover-glow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <CardHeader className="pb-4 relative z-10">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-primary/30 border border-primary/20`}>
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary group-hover:scale-110 transition-transform duration-300`} strokeWidth={2.5} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {feature.description}
                  </p>
                </CardContent>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
