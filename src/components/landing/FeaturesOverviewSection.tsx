import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  BarChart3,
  Brain,
  Share2,
  Shield,
  Target,
} from "lucide-react";

export const FeaturesOverviewSection = () => {
  return (
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
          <Card className="card-enhanced group transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <FileText className="w-6 h-6 text-primary-foreground" />
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

          <Card className="card-enhanced group transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
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

          <Card className="card-enhanced group transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Brain className="w-6 h-6 text-primary-foreground" />
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

          <Card className="card-enhanced group transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Share2 className="w-6 h-6 text-primary-foreground" />
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

          <Card className="card-enhanced group transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl font-semibold">
                Privacy First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your data is encrypted and secure. We've built Verfolia beta
                with advanced privacy controls so you can manage your
                information and share your profile with confidence.
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced group transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Target className="w-6 h-6 text-primary-foreground" />
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
  );
};