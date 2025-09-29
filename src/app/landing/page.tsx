"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const LandingPage = () => {
  const sessionResult: any = useSession && typeof useSession === 'function' ? useSession() : undefined;
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const isAuthenticated = status === "authenticated" && !!session;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="hero py-24">
        <h1 className="text-5xl md:text-6xl font-bold mb-5">
          Build smarter.
          <br />
          Apply faster.
          <br />
          Track everything.
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-muted-foreground">
          Verfolia is on a mission to bring transparency to your career. Build your profile, share your link, 
          and track who’s engaging with your story.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isAuthenticated ? (
            <Button onClick={() => signIn("google")} variant="secondary" size="lg">
              Sign in with Google
            </Button>
          ) : (
            <Button onClick={() => signOut()} variant="secondary" size="lg">
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


