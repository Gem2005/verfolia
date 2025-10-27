"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

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
      <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'py-4' : 'py-4'
      }`}>
        <div className={`mx-auto transition-all duration-300 px-4 sm:px-6 lg:px-8 ${
          scrolled ? 'max-w-7xl' : 'max-w-full'
        }`}>
          <div className={`flex items-center justify-between gap-2 transition-all duration-300 rounded-2xl ${
            scrolled 
              ? 'px-3 sm:px-4 lg:px-6 py-2 sm:py-3 navbar-scrolled card-enhanced border-border/80 shadow-md' 
              : 'px-3 sm:px-4 lg:px-6 py-2 sm:py-3 navbar-glass'
          }`}>
            {/* Logo Section */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center overflow-hidden rounded-xl shadow-glow group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                  <Image
                    src="/Logo.png"
                    alt="Verfolia Logo"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 gradient-primary rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
                </div>
                <span className="text-foreground text-lg sm:text-xl lg:text-2xl font-bold tracking-tight font-jakarta">
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
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {loading ? (
                // Show loading state
                <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                  <div className="h-8 w-16 lg:h-10 lg:w-20 animate-pulse rounded-xl bg-muted/30"></div>
                  <div className="h-8 w-20 lg:h-10 lg:w-24 animate-pulse rounded-xl bg-muted/30"></div>
                </div>
              ) : isAuthenticated ? (
                // Show authenticated user options
                <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                  <span className="text-xs lg:text-sm text-muted-foreground hidden md:block font-jakarta truncate max-w-[120px] lg:max-w-none">
                    {user?.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hidden md:flex rounded-xl text-xs lg:text-sm"
                  >
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="rounded-xl text-xs lg:text-sm"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                // Show non-authenticated user options
                <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hidden md:flex rounded-xl text-xs lg:text-sm"
                  >
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    variant="default"
                    className="rounded-xl text-xs lg:text-sm px-3 lg:px-4"
                  >
                    <Link href="/choice">Get Started</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-muted/50 transition-colors flex-shrink-0"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
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
            <div className="p-6 border-t border-border/50 space-y-4">
              {/* Theme Toggle for Mobile */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Theme</span>
                <ThemeToggle />
              </div>
              
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Button
                    asChild
                    variant="default"
                    className="w-full rounded-xl"
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
                    variant="default"
                    className="w-full rounded-xl"
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
