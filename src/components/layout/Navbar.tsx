"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: "/", label: "Home", active: true },
  { href: "#features", label: "Features" },
  {
    href: "https://www.notion.so/Plans-and-Pricing-24722774e30a81db942af223d2d000b6",
    label: "Pricing",
  },
  {
    href: "https://www.notion.so/Verfolia-Documentation-24722774e30a80e48922d21361630f9f",
    label: "Docs",
  },
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

  const handleLinkClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300 ${
              scrolled
                ? "shadow-md backdrop-blur-xl bg-background/80 border border-border/50"
                : "shadow-sm backdrop-blur-md bg-background/60 border border-border/20"
            }`}
          >
            {/* Logo Section */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl shadow-glow group-hover:scale-105 transition-transform duration-200">
                  <Image
                    src="/Logo.png"
                    alt="Verfolia Logo"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 gradient-primary rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
                </div>
                <span className="text-foreground text-2xl font-bold tracking-tight font-jakarta">
                  Verfolia
                </span>
              </Link>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center space-x-1 mx-8">
              {navigationLinks.map((link, index) =>
                link.href.startsWith("#") ? (
                  <button
                    key={index}
                    onClick={() => handleLinkClick(link.href)}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 text-sm font-medium font-jakarta cursor-pointer"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={index}
                    href={link.href}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 text-sm font-medium font-jakarta cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              <ThemeToggle />

              {loading ? (
                // Show loading state
                <div className="flex items-center gap-3">
                  <div className="h-10 w-20 animate-pulse rounded-xl bg-muted/30"></div>
                  <div className="h-10 w-24 animate-pulse rounded-xl bg-muted/30"></div>
                </div>
              ) : isAuthenticated ? (
                // Show authenticated user options
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground hidden md:block font-jakarta">
                    {user?.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hidden sm:flex rounded-xl"
                  >
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="rounded-xl"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                // Show non-authenticated user options
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hidden sm:flex rounded-xl"
                  >
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="rounded-xl bg-gradient-primary hover:opacity-90 text-white shadow-glow"
                  >
                    <Link href="/choice">Get Started</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/95 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="relative h-full flex flex-col bg-background/95 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl">
                  <Image
                    src="/Logo.png"
                    alt="Verfolia Logo"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <span className="text-foreground text-2xl font-bold tracking-tight font-jakarta">
                  Verfolia
                </span>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 flex flex-col justify-center px-6">
              <nav className="space-y-8">
                {navigationLinks.map((link, index) =>
                  link.href.startsWith("#") ? (
                    <button
                      key={index}
                      onClick={() => handleLinkClick(link.href)}
                      className="block text-2xl font-semibold text-foreground hover:text-primary transition-colors duration-200 font-jakarta text-left"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={index}
                      href={link.href}
                      className="block text-2xl font-semibold text-foreground hover:text-primary transition-colors duration-200 font-jakarta text-left"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>
            </div>

            {/* Bottom Action */}
            <div className="p-6 border-t border-border/50">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Button
                    asChild
                    className="w-full rounded-xl bg-gradient-primary text-white shadow-glow"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    asChild
                    className="w-full rounded-xl bg-gradient-primary text-white shadow-glow"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/choice">Get Started</Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full rounded-xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
