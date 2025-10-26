import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Rocket,
  Shield,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export const CTASection = () => {
  return (
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
              className="text-lg px-8 py-4 h-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-large hover:scale-105 transition-all duration-200"
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
              className="text-lg px-8 py-4 h-auto bg-card/50 backdrop-blur-sm hover:bg-muted/50 transition-all duration-200"
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
  );
};
