import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Sparkles,
  Rocket,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Beta Version
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight">
            <span className="gradient-text">Build smarter.</span>
            <br />
            <span className="text-foreground">Apply faster.</span>
            <br />
            <span className="gradient-text">Track everything.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
            Verfolia is on a mission to bring transparency to your career.
            Build your profile, share your link, and track who&#39;s engaging
            with your story. It&#39;s time to stop feeling invisible and start
            knowing you&#39;ve been seen.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              variant="default"
              size="lg"
              className="text-lg px-8 py-4 h-auto transition-all duration-200"
            >
              <Link href="/choice">
                <Rocket className="w-5 h-5 mr-2" />
                Get Started Free
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-4 h-auto bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200"
            >
              <Link href="/upload-resume">
                <Upload className="w-5 h-5 mr-2" />
                Upload Resume
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Free forever plan</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>10,000+ professionals</span>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-primary/10 rounded-full animate-pulse hidden lg:block" />
        <div
          className="absolute top-40 right-20 w-8 h-8 bg-primary/20 rounded-full animate-bounce hidden lg:block"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-20 w-12 h-12 bg-primary/15 rounded-full animate-pulse hidden lg:block"
          style={{ animationDelay: "2s" }}
        />
      </div>
    </section>
  );
};
