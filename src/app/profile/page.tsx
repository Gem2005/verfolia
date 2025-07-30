"use client";

import { AppLayout } from "@/components/layout/app-layout";

export default function Profile() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Profile
            </span>
          </h1>

          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Manage your professional profile and showcase your digital identity.
          </p>

          <div className="mt-12 max-w-md mx-auto">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
              <div className="text-center space-y-4">
                <div className="text-lg font-semibold">Coming Soon</div>
                <div className="text-muted-foreground">
                  We&apos;re building a comprehensive profile management system
                  for you. Stay tuned!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
