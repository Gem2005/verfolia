import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export const TestimonialsSection = () => {
  return (
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
          <Card className="card-enhanced group transition-all duration-300">
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

          <Card className="card-enhanced group transition-all duration-300">
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

          <Card className="card-enhanced group transition-all duration-300">
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
  );
};