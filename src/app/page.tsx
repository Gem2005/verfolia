import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  BarChart3,
  Share2,
  Brain,
  Shield,
  Eye,
  CheckCircle,
  Target,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Rocket,
  TrendingUp,
  Award,
  UserCheck,
  HeartHandshake,
  Play,
  Linkedin,
  Github,
  Mail,
  Users,
  Star,
  Upload,
} from "lucide-react";
import Link from "next/link";

const HomePage = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background font-jakarta">
        {/* Hero Section */}
        <section className="pt-32 pb-20 gradient-bg relative overflow-hidden">
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
                Build your profile, share your link, and track who's engaging
                with your story. It's time to stop feeling invisible and start
                knowing you've been seen.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 h-auto glass-effect hover:bg-muted/50 transition-all duration-200"
                >
                  <Link href="/create-resume">
                    <Rocket className="w-5 h-5 mr-2" />
                    Get Started Free
                  </Link>
                </Button>
                {/* CORRECTED BUTTON */}
                <Button
  asChild
  size="lg"
  className="text-lg px-8 py-4 h-auto bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200"
>
  <Link href="/upload-resume">  {/* ✅ FIXED */}
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

        {/* Features Overview */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Platform Features
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-balance">
                Everything you need to{" "}
                <span className="gradient-text">succeed</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools designed for modern professionals who want
                to take control of their career growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards */}
              <Card className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    Profile Builder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Go beyond the old way. Build a modern identity with content
                    assistance and beautiful, intuitive design.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    Real-time Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Track who views your profile, when they visit, and gain
                    insights into your application performance.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    AI Cover Letters{" "}
                    <Badge className="mb-4 bg-green-500 text-white">
                      Comming Soon..
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Generate personalized cover letters instantly using advanced
                    AI that understands your industry.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    Easy Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Share your professional profile with a simple link.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    Privacy First
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your data is encrypted and secure. We’ve built Verfolia beta
                    with advanced privacy controls so you can manage your
                    information and share your profile with confidence.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    Career Insights{" "}
                    <Badge className="mb-4 bg-green-500 text-white">
                      Comming Soon..
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get data-driven insights about your career progress and
                    recommendations for improvement.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Resume Builder Showcase */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  Profile Builder
                </Badge>
                <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-balance">
                  Craft your professional story in minutes
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Our intuitive identity builder allows you to import your
                  existing documents or start from scratch. We help you create a
                  clean, modern profile that's optimized to show your unique
                  value and gets noticed for all the right reasons.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    "Stunning, Dynamic Profiles",
                    "4+ professional templates",
                    "A Profile Optimized for Humans",
                    "The PDF is not a dead end",

                    "The Future is a Shared Experience.",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button variant="outline" size="lg" className="glass-effect">
                  <Link
                    href="/login"
                    className="flex flex-row justify-center items-center"
                  >
                    Start Building
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="glass-effect p-8 rounded-3xl shadow-large">
                    <div className="aspect-[4/5] bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Resume Preview</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-primary/10 p-3 rounded-xl backdrop-blur-sm">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-primary/10 p-3 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Showcase */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-1 lg:order-1">
                <div className="relative">
                  <div className="glass-effect p-8 rounded-3xl shadow-large">
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Analytics Dashboard
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Stats */}
                  <div className="absolute -top-4 -right-4 bg-primary/10 p-4 rounded-xl backdrop-blur-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        1.2k
                      </div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-primary/10 p-4 rounded-xl backdrop-blur-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">85%</div>
                      <div className="text-xs text-muted-foreground">Match</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-2 lg:order-2">
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  Analytics & Insights
                </Badge>
                <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-balance">
                  Know you’ve been seen, every single time.
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Verfolia ends the guesswork. Our real-time analytics turn your
                  profile into a data-powered asset, giving you the clarity and
                  confidence to know that your professional story is getting
                  noticed.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    "Live engagement tracking",
                    "Geographic analytics.",
                    "Time-based engagement data",
                    "Behavioral heatmaps",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-primary text-white shadow-glow hover:shadow-large transition-all duration-200"
                    asChild
                  >
                    <Link href="/analytics">
                      View Analytics
                      <BarChart3 className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="glass-effect">
                    See Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Assistant Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              AI-Powered
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-balance">
              Your AI career <span className="gradient-text">copilot</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-16 max-w-3xl mx-auto">
              Let artificial intelligence guide your career journey with
              personalized recommendations, smart content generation, and
              data-driven insights.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Smart Cover Letters</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Generate personalized cover letters that match job
                    requirements and highlight your unique strengths.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Job Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AI analyzes job descriptions and suggests optimizations to
                    improve your compatibility score.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Interview Prep</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Practice with AI-generated questions tailored to your
                    industry and specific role requirements.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonials */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Testimonials
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-balance">
                Loved by <span className="gradient-text">professionals</span>{" "}
                worldwide
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See how Verfolia is helping job seekers land their dream roles
                and advance their careers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="group hover:shadow-soft transition-all duration-300 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">
                    "Verfolia's AI cover letters helped me land interviews 2x
                    faster. The analytics showed exactly which companies were
                    engaging with my profile."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full mr-3 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        SC
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">Sarah Chen</p>
                      <p className="text-sm text-muted-foreground">
                        Software Engineer at Google
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-soft transition-all duration-300 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">
                    "As a recruiter, I love seeing Verfolia profiles. The
                    analytics help me understand candidate engagement and
                    interest levels."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full mr-3 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        MJ
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">Marcus Johnson</p>
                      <p className="text-sm text-muted-foreground">
                        Senior Tech Recruiter
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-soft transition-all duration-300 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">
                    "The QR code feature is perfect for networking events. I've
                    connected with so many professionals using my Verfolia
                    profile!"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full mr-3 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        ER
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">Elena Rodriguez</p>
                      <p className="text-sm text-muted-foreground">
                        Marketing Manager
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-balance">
                Ready to transform your{" "}
                <span className="gradient-text">career journey?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Join thousands of professionals who are already using Verfolia
                to land their dream jobs. Start building your professional
                identity today, completely free.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  size="lg"
                  className="text-lg px-8 py-4 h-auto bg-gradient-primary text-white shadow-glow hover:shadow-large hover:scale-105 transition-all duration-200"
                  asChild
                >
                  <Link href="/create-resume">
                    Start Building for Free
                    <Rocket className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 h-auto glass-effect hover:bg-muted/50 transition-all duration-200"
                >
                  Talk to Sales
                </Button>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>GDPR compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  <span>14-day premium trial</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default HomePage;
