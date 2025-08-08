"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: "/", label: "Home", active: true },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
];

export default function Navbar() {
  const { isAuthenticated, loading, user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-6 left-0 right-0 z-50 w-full">
        <div className="mx-auto max-w-fit px-6">
          <div
            className={`flex items-center justify-between px-6 py-3 rounded-3xl transition-all duration-300 ${
              scrolled
                ? "bg-card/90 border border-border/50"
                : "bg-card/60 border border-border/30"
            }`}
            style={{
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Logo Section */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg font-serif">
                    V
                  </span>
                </div>
                <span className="text-foreground text-2xl font-bold tracking-tight font-serif">
                  Verfolia
                </span>
              </Link>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-2 mx-8">
              {navigationLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="px-4 py-2 rounded-2xl text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {loading ? (
                // Show loading state
                <div className="flex items-center gap-2">
                  <div className="h-9 w-16 animate-pulse rounded-2xl bg-muted"></div>
                  <div className="h-9 w-24 animate-pulse rounded-2xl bg-muted"></div>
                </div>
              ) : isAuthenticated ? (
                // Show authenticated user options
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:block mr-2">
                    {user?.email}
                  </span>
                  <Link
                    href="/dashboard"
                    className="hidden md:block px-4 py-2 rounded-2xl text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="hidden md:block px-4 py-2 rounded-2xl text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium border border-border"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                // Show non-authenticated user options
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="hidden md:block px-4 py-2 rounded-2xl text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/login"
                    className="hidden md:block px-4 py-2 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 text-sm font-medium"
                  >
                    Sign up for free
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden size-9 flex items-center justify-center text-foreground hover:text-muted-foreground transition-colors ml-2"
              >
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </svg>
              </button>

              {/* Theme Toggle - At the end */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/95 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    V
                  </span>
                </div>
                <span className="text-foreground text-2xl font-bold tracking-tight">
                  Verfolia
                </span>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="size-10 flex items-center justify-center text-foreground hover:text-muted-foreground transition-colors"
              >
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 flex flex-col justify-center px-6">
              <nav className="space-y-8">
                {navigationLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-3xl font-semibold text-foreground hover:text-muted-foreground transition-colors duration-200 font-sans"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Additional mobile links */}
                <Link
                  href="#blogs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-3xl font-semibold text-foreground hover:text-muted-foreground transition-colors duration-200 font-sans"
                >
                  Blogs
                </Link>

                <Link
                  href="#solutions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-3xl font-semibold text-foreground hover:text-muted-foreground transition-colors duration-200 font-sans"
                >
                  Solutions
                </Link>

                <Link
                  href="#documentation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-3xl font-semibold text-foreground hover:text-muted-foreground transition-colors duration-200 font-sans"
                >
                  Documentation
                </Link>
              </nav>
            </div>

            {/* Bottom Action */}
            <div className="p-6">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-4 text-center bg-primary text-primary-foreground rounded-full text-lg font-semibold hover:bg-primary/90 transition-colors font-sans"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full py-4 text-center border border-border text-foreground rounded-full text-lg font-semibold hover:bg-muted transition-colors font-sans"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-4 text-center bg-primary text-primary-foreground rounded-full text-lg font-semibold hover:bg-primary/90 transition-colors font-sans"
                >
                  Sign up for free
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
