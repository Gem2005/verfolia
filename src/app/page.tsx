"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        <div className="container relative z-10 mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary/80 to-secondary bg-clip-text text-transparent">
                Professional Story
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Create dynamic portfolios, track your career growth, and showcase
              your skills with Verfolia&apos;s cutting-edge platform.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              {isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="text-lg">
                    <Link href="/account">Go to Dashboard</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-lg"
                  >
                    <Link href="/profile">View Profile</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg">
                    <Link href="/login">Get Started</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-lg"
                  >
                    <Link href="#features">Learn More</Link>
                  </Button>
                </>
              )}
            </div>

            {user && (
              <div className="mt-8">
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-secondary/20 blur-3xl"></div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Professional tools to build your perfect portfolio
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0-1.125.504-1.125 1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">Resume Builder</h3>
              <p className="mt-2 text-muted-foreground">
                Create professional resumes with our intuitive builder
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                Professional Profile
              </h3>
              <p className="mt-2 text-muted-foreground">
                Showcase your skills and experience beautifully
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">Career Analytics</h3>
              <p className="mt-2 text-muted-foreground">
                Track your career growth with detailed insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free and upgrade as you grow
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-lg border bg-card p-6 text-center">
              <h3 className="text-xl font-semibold">Free</h3>
              <div className="mt-4 text-3xl font-bold">$0</div>
              <p className="text-sm text-muted-foreground">Forever</p>
              <ul className="mt-6 space-y-3 text-sm">
                <li>Basic resume builder</li>
                <li>3 resume templates</li>
                <li>PDF downloads</li>
                <li>Basic analytics</li>
              </ul>
              <Button asChild className="mt-6 w-full" variant="outline">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="rounded-lg border bg-card p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-full">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold">Pro</h3>
              <div className="mt-4 text-3xl font-bold">$19</div>
              <p className="text-sm text-muted-foreground">Per month</p>
              <ul className="mt-6 space-y-3 text-sm">
                <li>Advanced resume builder</li>
                <li>50+ premium templates</li>
                <li>Unlimited downloads</li>
                <li>Advanced analytics</li>
                <li>Custom domains</li>
                <li>Priority support</li>
              </ul>
              <Button asChild className="mt-6 w-full">
                <Link href="/login">Start Free Trial</Link>
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-lg border bg-card p-6 text-center">
              <h3 className="text-xl font-semibold">Enterprise</h3>
              <div className="mt-4 text-3xl font-bold">Custom</div>
              <p className="text-sm text-muted-foreground">Contact us</p>
              <ul className="mt-6 space-y-3 text-sm">
                <li>Everything in Pro</li>
                <li>Team collaboration</li>
                <li>White-label options</li>
                <li>API access</li>
                <li>Dedicated support</li>
                <li>Custom integrations</li>
              </ul>
              <Button asChild className="mt-6 w-full" variant="outline">
                <Link href="#contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
