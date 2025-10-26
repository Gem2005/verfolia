import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ArrowRight,
  FileText,
  Award,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const ResumeBuilderShowcaseSection = () => {
  return (
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
              clean, modern profile that&#39;s optimized to show your unique
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

            <Button variant="default" size="lg">
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
              <div className="bg-card/50 backdrop-blur-sm p-8 rounded-3xl shadow-large">
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
  );
};
