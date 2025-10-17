"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

const LandingPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, [supabase]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="hero py-24">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Build smarter.
          <br />
          <span className="verfolia-text-gradient">Apply faster.</span>
          <br />
          Track everything.
        </h1>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-muted-foreground leading-relaxed">
          Verfolia is on a mission to bring transparency to your career. Build your profile, share your link, 
          and track who’s engaging with your story.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isAuthenticated ? (
              <Button 
                onClick={handleSignIn}
                size="lg" 
                className="button-enhanced text-lg px-8 py-6 h-auto"
              >
                <Users className="w-5 h-5 mr-2" />
                Sign in with Google
              </Button>
          ) : (
            <Button onClick={handleSignOut} variant="secondary" size="lg">
              Sign out
            </Button>
          )}

          {isAuthenticated && (
            <>
              <Button asChild size="lg">
                <Link href="/create-resume">🚀 Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/upload-resume">📄 Upload PDF</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;


