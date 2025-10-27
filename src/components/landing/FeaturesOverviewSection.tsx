"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  BarChart3,
  Brain,
  Share2,
  Shield,
  Target,
  Sparkles,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export const FeaturesOverviewSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const features = [
    {
      icon: FileText,
      title: "Profile Builder",
      description: "Go beyond the old way. Build a modern identity with content assistance and beautiful, intuitive design.",
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track who views your profile, when they visit, and gain insights into your application performance.",
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
    },
    {
      icon: Brain,
      title: "AI Cover Letters",
      description: "Generate personalized cover letters instantly using advanced AI that understands your industry.",
      gradient: "from-emerald-500 to-teal-500",
      iconBg: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10",
      badge: "Coming Soon",
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Share your professional profile with a simple link.",
      gradient: "from-orange-500 to-amber-500",
      iconBg: "bg-gradient-to-br from-orange-500/10 to-amber-500/10",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is encrypted and secure. We've built Verfolia beta with advanced privacy controls so you can manage your information and share your profile with confidence.",
      gradient: "from-indigo-500 to-blue-500",
      iconBg: "bg-gradient-to-br from-indigo-500/10 to-blue-500/10",
    },
    {
      icon: Target,
      title: "Career Insights",
      description: "Get data-driven insights about your career progress and recommendations for improvement.",
      gradient: "from-rose-500 to-red-500",
      iconBg: "bg-gradient-to-br from-rose-500/10 to-red-500/10",
      badge: "Coming Soon",
    },
  ];

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
      {/* Subtle animated background accent */}
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-full blur-3xl animate-float opacity-60 hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl animate-float-delayed opacity-60 hover:opacity-100 transition-opacity duration-700" />
      
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${isVisible ? 'scroll-reveal visible' : 'scroll-reveal'}`}>
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <Badge className="mb-4 sm:mb-6 bg-primary/20 backdrop-blur-md text-primary border-2 border-primary/40 px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold shadow-lg shadow-primary/20">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 inline" />
            Platform Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-balance px-4 sm:px-0">
            Everything you need to{" "}
            <span className="gradient-text-enhanced">succeed</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Comprehensive tools designed for modern professionals who want
            to take control of their career growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                  <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-primary/30`}>
                    <Icon className={`w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300`} strokeWidth={2.5} />
                  </div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                    {feature.badge && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                        {feature.badge}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
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
