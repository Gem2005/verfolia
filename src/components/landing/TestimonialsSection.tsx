"use client";

import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export const TestimonialsSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const testimonials = [
    {
      name: "Sarah Chen",
      handle: "@sarahchen",
      description: "Verfolia's AI cover letters helped me land interviews 2x faster. The analytics showed exactly which companies were engaging with my profile.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    {
      name: "Marcus Johnson",
      handle: "@marcusj",
      description: "As a recruiter, I love seeing Verfolia profiles. The analytics help me understand candidate engagement and interest levels.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    },
    {
      name: "Elena Rodriguez",
      handle: "@erodriguez",
      description: "The QR code feature is perfect for networking events. I've connected with so many professionals using my Verfolia profile!",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    },
    {
      name: "David Kim",
      handle: "@davidkim",
      description: "Switched careers using Verfolia. The AI-generated resumes were tailored perfectly to my new industry. Got 3 offers in 2 months!",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    },
    {
      name: "Priya Sharma",
      handle: "@priyasharma",
      description: "The profile analytics are game-changing. I can see which recruiters viewed my profile and when. It's like LinkedIn on steroids!",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    },
    {
      name: "Alex Thompson",
      handle: "@alexthompson",
      description: "Best investment in my career. The AI suggestions for resume improvements were spot-on. Landing page looks incredibly professional.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
  ];

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-24 relative overflow-hidden">
      {/* Animated background accent */}
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-amber-500/6 to-yellow-500/6 rounded-full blur-3xl animate-float-delayed opacity-60 hover:opacity-100 transition-opacity duration-700" />
      
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${isVisible ? 'scroll-reveal visible' : 'scroll-reveal'}`}>
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-amber-500/20 backdrop-blur-md text-amber-600 dark:text-amber-400 border-2 border-amber-500/40 px-6 py-2.5 text-sm font-bold shadow-lg shadow-amber-500/20">
            <Sparkles className="w-4 h-4 mr-2 inline" />
            Testimonials
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-balance">
            Loved by <span className="gradient-text-enhanced">professionals</span>{" "}
            worldwide
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See how Verfolia is helping job seekers land their dream roles
            and advance their careers.
          </p>
        </div>

        <AnimatedTestimonials 
          data={testimonials}
          cardClassName="glass-card-strong border-2 border-primary/10 dark:border-primary/20 bg-background/50 dark:bg-background/30"
        />
      </div>
    </section>
  );
};
