"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, User, Bot, Eye, Zap } from "lucide-react";

// Data for the main feature cards
const features = [
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    subtitle: "See Who's Engaged & What They Care About",
    description: "Go beyond a simple view count. Get a live, data-driven dashboard that shows you which companies are viewing your profile, their location, and which projects and skills they're spending the most time on.",
    color: "text-primary",
  },
  {
    icon: User,
    title: "Dynamic Professional Identity",
    subtitle: "Build a Profile that Lives & Breathes",
    description: "Forget static PDFs. Create an interactive profile that showcases your work with embeddable videos, verified skills, and project portfolios. This is your professional story, not just a summary of your past.",
    color: "text-primary",
  },
  {
    icon: Bot,
    title: "AI-Powered Career Assistant",
    subtitle: "Go from Application to Insight in Minutes",
    description: "Our AI isn't just for suggestions. It's a strategic partner. Instantly generate tailored cover letters, find the right recruiters at any company, and get personalized tips to boost your profile's performance.",
    color: "text-accent",
  }
];

// Data for the smaller, additional feature cards
const additionalFeatures = [
  {
    icon: Eye,
    title: "Live Insights",
    description: "Get notified the moment someone views your profile with detailed engagement metrics."
  },
  {
    icon: Zap,
    title: "Instant Updates",
    description: "Update your profile once and it reflects everywhere you've shared it immediately."
  }
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            What You Can Do with{" "}
            <span className="verfolia-text-gradient">Verfolia</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We've rebuilt the professional profile from the ground up. 
            No complicated templates or rigid formats.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="verfolia-animate-slide-up text-center p-8 group overflow-hidden"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardContent className="p-0">
                <div className={`w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className={`${feature.color} font-semibold mb-4`}>{feature.subtitle}</p>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                 {/* Decorative element for hover effect */}
                <div className="mt-8 h-1 bg-gradient-to-r from-primary via-accent to-accent rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {additionalFeatures.map((feature, index) => (
            <Card
              key={feature.title}
              className="verfolia-animate-slide-up text-center p-6 group"
              style={{ animationDelay: `${(index + 3) * 0.2}s` }}
            >
              <CardContent className="p-0 flex flex-col items-center">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                   <feature.icon className="w-6 h-6" />
                 </div>
                 <h4 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h4>
                 <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
