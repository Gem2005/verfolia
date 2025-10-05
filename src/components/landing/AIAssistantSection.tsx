import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Target,
  MessageSquare,
} from "lucide-react";

export const AIAssistantSection = () => {
  return (
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
          <Card className="card-enhanced group transition-all duration-300 hover:-translate-y-1">
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

          <Card className="card-enhanced group transition-all duration-300 hover:-translate-y-1">
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

          <Card className="card-enhanced group transition-all duration-300 hover:-translate-y-1">
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
  );
};