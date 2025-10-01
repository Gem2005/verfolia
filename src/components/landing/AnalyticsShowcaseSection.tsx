import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Eye,
} from "lucide-react";
import Link from "next/link";

export const AnalyticsShowcaseSection = () => {
  return (
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
              Know you've been seen, every single time.
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
              <Button variant="outline" size="lg" className="glass-button">
                See Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};