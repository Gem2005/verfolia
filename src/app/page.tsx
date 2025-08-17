"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Users, BarChart3, FileText, Sparkles, Zap, Clock, Bot, User, Eye, CheckCircle, XCircle, Star } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

// --- Features Section Component ---
const FeaturesSection = () => {
  const features = [
    { icon: BarChart3, title: "Real-Time Analytics", subtitle: "See Who's Engaged & What They Care About", description: "Go beyond a simple view count. Get a live, data-driven dashboard that shows you which companies are viewing your profile, their location, and which projects and skills they're spending the most time on.", color: "text-primary" },
    { icon: User, title: "Dynamic Professional Identity", subtitle: "Build a Profile that Lives & Breathes", description: "Forget static PDFs. Create an interactive profile that showcases your work with embeddable videos, verified skills, and project portfolios. This is your professional story, not just a summary of your past.", color: "text-primary" },
    { icon: Bot, title: "AI-Powered Career Assistant", subtitle: "Go from Application to Insight in Minutes", description: "Our AI isn't just for suggestions. It's a strategic partner. Instantly generate tailored cover letters, find the right recruiters at any company, and get personalized tips to boost your profile's performance.", color: "text-accent" }
  ];
  const additionalFeatures = [
    { icon: Eye, title: "Live Insights", description: "Get notified the moment someone views your profile with detailed engagement metrics." },
    { icon: Zap, title: "Instant Updates", description: "Update your profile once and it reflects everywhere you've shared it immediately." }
  ];

  return (
    <section id="features" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">What You Can Do with <span className="verfolia-text-gradient">Verfolia</span></h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">We've rebuilt the professional profile from the ground up. No complicated templates or rigid formats.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={feature.title} className="verfolia-animate-slide-up text-center p-8 group overflow-hidden bg-card/50 backdrop-blur-lg border-border/50" style={{ animationDelay: `${index * 0.2}s` }}>
              <CardContent className="p-0">
                <div className={`w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}><feature.icon className={`w-8 h-8 ${feature.color}`} /></div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className={`${feature.color} font-semibold mb-4`}>{feature.subtitle}</p>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                <div className="mt-8 h-1 bg-gradient-to-r from-primary via-accent to-accent rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {additionalFeatures.map((feature, index) => (
            <Card key={feature.title} className="verfolia-animate-slide-up text-center p-6 group bg-card/50 backdrop-blur-lg border-border/50" style={{ animationDelay: `${(index + 3) * 0.2}s` }}>
              <CardContent className="p-0 flex flex-col items-center">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"><feature.icon className="w-6 h-6" /></div>
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

// --- Comparison Section Component ---
const ComparisonSection = () => {
    const comparisonData = [
        { feature: "Real-time profile views", old: false, verfolia: true },
        { feature: "Interactive media content", old: false, verfolia: true },
        { feature: "AI-powered insights", old: false, verfolia: true },
        { feature: "Company engagement data", old: false, verfolia: true },
        { feature: "Dynamic updates", old: false, verfolia: true },
        { feature: "Static format", old: true, verfolia: false },
        { feature: "One-size-fits-all", old: true, verfolia: false },
        { feature: "Application black hole", old: true, verfolia: false },
    ];
    return (
        <section className="py-20 lg:py-32 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">The Old Way vs <span className="verfolia-text-gradient">The Verfolia Way</span></h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">See why professionals are making the switch from static resumes to dynamic profiles.</p>
            </div>
            <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-lg border-border/50">
              <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 md:gap-8 mb-12 items-center">
                <div className="text-center md:text-right flex flex-col items-center md:items-end">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-destructive/10 border-2 border-destructive/20"><XCircle className="w-8 h-8 text-destructive" strokeWidth={1.5} /></div>
                  <h3 className="text-xl font-bold text-destructive mt-4">The Old Way</h3>
                  <p className="text-sm text-muted-foreground mt-2">A static, one-size-fits-all PDF. You apply and wait.</p>
                </div>
                <div className="flex items-center justify-center">
                    <div className="w-12 h-0.5 bg-gradient-to-r from-destructive to-primary"></div>
                    <div className="mx-4 text-2xl font-light text-muted-foreground">→</div>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
                </div>
                <div className="text-center md:text-left flex flex-col items-center md:items-start">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 border-2 border-primary/20 shadow-[0_0_15px_rgba(79,70,229,0.5)]"><CheckCircle className="w-8 h-8 text-primary" strokeWidth={1.5} /></div>
                  <h3 className="text-xl font-bold text-primary mt-4">The Verfolia Way</h3>
                  <p className="text-sm text-muted-foreground mt-2">A living profile with real-time analytics. You apply, and you know you've been seen.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                      <th className="text-center py-4 px-4 font-semibold text-destructive">Traditional Resume</th>
                      <th className="text-center py-4 px-4 font-semibold text-primary">Verfolia Profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((item) => (
                      <tr key={item.feature} className="border-b border-border/50">
                        <td className="py-4 px-4 font-medium text-foreground">{item.feature}</td>
                        <td className="py-4 px-4"><div className="flex justify-center">{item.old ? <XCircle className="w-5 h-5 text-destructive" /> : <XCircle className="w-5 h-5 text-muted-foreground/50" />}</div></td>
                        <td className="py-4 px-4"><div className="flex justify-center">{item.verfolia ? <CheckCircle className="w-5 h-5 text-primary" /> : <XCircle className="w-5 h-5 text-muted-foreground/50" />}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </section>
    );
};

// --- Reviews Section Component ---
const ReviewsSection = () => {
    const reviews = [
        { id: 1, name: "Sarah Chen", role: "Software Engineer", company: "Tech Corp", rating: 5, content: "Verfolia transformed my job search completely. The real-time analytics showed me exactly which companies were interested, leading to 3 offers in 2 weeks!", avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=SC" },
        { id: 2, name: "Marcus Johnson", role: "Product Designer", company: "Design Studio", rating: 5, content: "The AI-powered insights helped me optimize my profile for the right audience. I landed my dream job at a startup within a month of using Verfolia.", avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=MJ" },
        { id: 3, name: "Emily Rodriguez", role: "Marketing Manager", company: "Growth Inc", rating: 5, content: "Love how dynamic my profile is now! Instead of sending the same static resume, I can share different versions and see what resonates with each company.", avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=ER" },
        { id: 4, name: "David Kim", role: "Data Scientist", company: "AI Labs", rating: 5, content: "The analytics dashboard is incredible. I can see who's viewing my profile, from which companies, and what they're focusing on. Game changer!", avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=DK" },
        { id: 5, name: "Priya Patel", role: "UX Researcher", company: "User Co", rating: 5, content: "Finally, a professional profile that actually represents who I am. The interactive elements and project showcases make all the difference.", avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=PP" },
        { id: 6, name: "Alex Thompson", role: "DevOps Engineer", company: "Cloud Systems", rating: 5, content: "Verfolia's real-time notifications let me know the moment someone views my profile. I can follow up at the perfect time and convert views to interviews.", avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=AT" }
    ];
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [ Autoplay({ delay: 5000, stopOnInteraction: true }) ]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);
    useEffect(() => {
        if (!emblaApi) return;
        const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
        emblaApi.on("select", onSelect);
        return () => { emblaApi.off("select", onSelect); };
    }, [emblaApi]);

    return (
        <section className="py-20 lg:py-32 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Trusted by <span className="verfolia-text-gradient">5,000+ Professionals</span></h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">See what professionals are saying about their Verfolia experience</p>
            </div>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-4">
                {reviews.map((review) => (
                  <div key={review.id} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 pl-4">
                    <Card className="h-full bg-card/50 backdrop-blur-lg border-border/50 shadow-lg flex flex-col">
                      <CardContent className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center mb-4">
                          <Avatar className="w-12 h-12 mr-4 border-2 border-primary/20"><AvatarImage src={review.avatar} alt={review.name} /><AvatarFallback className="bg-primary/10 text-primary">{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                          <div className="flex-1"><h4 className="font-semibold text-foreground">{review.name}</h4><p className="text-sm text-muted-foreground">{review.role} at {review.company}</p></div>
                        </div>
                        <div className="flex items-center mb-4">{[...Array(review.rating)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />))}</div>
                        <p className="text-muted-foreground leading-relaxed flex-grow">"{review.content}"</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mt-8 space-x-2">
              {reviews.map((_, index) => (
                <button key={index} onClick={() => scrollTo(index)} className={cn('w-2 h-2 rounded-full transition-all duration-300', index === selectedIndex ? 'w-6 bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50')} aria-label={`Go to slide ${index + 1}`} />
              ))}
            </div>
          </div>
        </section>
      );
};

// --- Main Home Page Component ---
export default function HomePage() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section 
        id="home" 
        className="min-h-screen flex items-center justify-center relative overflow-hidden verfolia-hero-bg pt-32 pb-16"
      >
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full verfolia-animate-float opacity-60"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent rounded-full verfolia-animate-float opacity-40" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="verfolia-animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Your Professional Journey,{" "}
              <span className="verfolia-text-gradient">Powered by Data</span>
            </h1>
          </div>
          <div className="verfolia-animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Replace your static resume with a dynamic, data-powered identity. 
              Get real-time analytics on who views your profile and take control of your career.
            </p>
          </div>
          <div className="verfolia-animate-slide-up mb-12" style={{ animationDelay: '0.6s' }}>
            <Card className="max-w-5xl mx-auto bg-card/50 backdrop-blur-lg border-border/50 shadow-2xl">
              <CardContent className="p-8 md:p-12">
                <h3 className="text-3xl md:text-4xl font-bold text-center mb-4 verfolia-text-gradient">Get Started in 3 Simple Steps</h3>
                <p className="text-center text-muted-foreground mb-12 text-lg max-w-2xl mx-auto">Transform your career in minutes with our streamlined onboarding process</p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  <div className="text-center group relative">
                     <div className="relative mb-8"><div className="relative w-20 h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl flex items-center justify-center mx-auto transition-all duration-300 border border-primary/20"><Users className="w-10 h-10 text-primary" /></div><Badge className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm px-3 py-1 border-none">01</Badge></div>
                     <h4 className="text-xl font-bold mb-3 text-foreground">Create Account</h4>
                     <p className="text-muted-foreground leading-relaxed">Sign up in seconds and start building your dynamic professional presence with our intuitive platform.</p>
                   </div>
                   <div className="text-center group relative">
                     <div className="relative mb-8"><div className="relative w-20 h-20 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent rounded-3xl flex items-center justify-center mx-auto transition-all duration-300 border border-accent/20"><FileText className="w-10 h-10 text-accent" /></div><Badge className="absolute -top-3 -right-3 bg-gradient-to-r from-accent to-primary text-primary-foreground text-sm px-3 py-1 border-none">02</Badge></div>
                     <h4 className="text-xl font-bold mb-3 text-foreground">Build Profile</h4>
                     <p className="text-muted-foreground leading-relaxed">Upload your resume and let our AI transform it into an interactive, engaging professional profile.</p>
                   </div>
                   <div className="text-center group relative">
                     <div className="relative mb-8"><div className="relative w-20 h-20 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-3xl flex items-center justify-center mx-auto transition-all duration-300 border border-primary/20"><BarChart3 className="w-10 h-10 text-primary" /></div><Badge className="absolute -top-3 -right-3 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground text-sm px-3 py-1 border-none">03</Badge></div>
                     <h4 className="text-xl font-bold mb-3 text-foreground">Track Success</h4>
                     <p className="text-muted-foreground leading-relaxed">Monitor profile views, engagement metrics, and optimize your presence for better career results.</p>
                   </div>
                </div>
                <div className="pt-8 border-t border-border/50">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                     <div className="flex flex-col items-center gap-3 group"><div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"><Zap className="w-6 h-6 text-primary" /></div><span className="text-sm font-medium text-muted-foreground">AI-Powered</span></div>
                     <div className="flex flex-col items-center gap-3 group"><div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"><Clock className="w-6 h-6 text-accent" /></div><span className="text-sm font-medium text-muted-foreground">Real-time</span></div>
                     <div className="flex flex-col items-center gap-3 group"><div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"><BarChart3 className="w-6 h-6 text-primary" /></div><span className="text-sm font-medium text-muted-foreground">Analytics</span></div>
                     <div className="flex flex-col items-center gap-3 group"><div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"><Sparkles className="w-6 h-6 text-accent" /></div><span className="text-sm font-medium text-muted-foreground">Dynamic</span></div>
                   </div>
                 </div>
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" asChild className="px-8 py-4 text-lg"><Link href="/create-resume">Create Profile</Link></Button>
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg group"><Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />Watch Demo</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <ComparisonSection />
      <ReviewsSection />
    </AppLayout>
  );
}
