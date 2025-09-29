"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

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

// Custom icons to perfectly match the design
const CustomXCircle = () => (
    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-destructive/10 border-2 border-destructive/20">
        <XCircle className="w-8 h-8 text-destructive" strokeWidth={1.5} />
    </div>
);

const CustomCheckCircle = () => (
    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 border-2 border-primary/20 shadow-[0_0_15px_rgba(79,70,229,0.5)]">
        <CheckCircle className="w-8 h-8 text-primary" strokeWidth={1.5} />
    </div>
);


export const ComparisonSection = () => {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            The Old Way vs{" "}
            <span className="verfolia-text-gradient">The Verfolia Way</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            See why professionals are making the switch from static resumes to dynamic profiles.
          </p>
        </div>

        <Card className="card-enhanced p-8 md:p-12 bg-card/50 backdrop-blur-lg border-border/50">
          <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 md:gap-8 mb-12 items-center">
            {/* The Old Way */}
            <div className="text-center md:text-right flex flex-col items-center md:items-end">
              <CustomXCircle />
              <h3 className="text-xl font-bold text-destructive mt-4">The Old Way</h3>
              <p className="text-sm text-muted-foreground mt-2">
                A static, one-size-fits-all PDF. You apply and wait.
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center">
                <div className="w-12 h-0.5 bg-gradient-to-r from-destructive to-primary"></div>
                <div className="mx-4 text-2xl font-light text-muted-foreground">→</div>
                <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
            </div>

            {/* The Verfolia Way */}
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <CustomCheckCircle />
              <h3 className="text-xl font-bold text-primary mt-4">The Verfolia Way</h3>
              <p className="text-sm text-muted-foreground mt-2">
                A living profile with real-time analytics. You apply, and you know you've been seen.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
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
                  <tr 
                    key={item.feature} 
                    className="border-b border-border/50"
                  >
                    <td className="py-4 px-4 font-medium text-foreground">{item.feature}</td>
                    <td className="py-4 px-4">
                        <div className="flex justify-center">
                            {item.old ? (
                                <XCircle className="w-5 h-5 text-destructive" />
                            ) : (
                                <XCircle className="w-5 h-5 text-muted-foreground/50" />
                            )}
                        </div>
                    </td>
                    <td className="py-4 px-4">
                        <div className="flex justify-center">
                            {item.verfolia ? (
                                <CheckCircle className="w-5 h-5 text-primary" />
                            ) : (
                                <XCircle className="w-5 h-5 text-muted-foreground/50" />
                            )}
                        </div>
                    </td>
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