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
            className="flex items-center justify-between px-6 py-3 rounded-3xl"
            style={{
              backdropFilter: "blur(20px)",
              backgroundColor: "rgba(0, 0, 0, 0.02)",
            }}
          >
            {/* Logo Section */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-lg">V</span>
                </div>
                <span className="text-white text-2xl font-bold tracking-tight">
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
                  className="px-4 py-2 rounded-2xl text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
                  style={{
                    backgroundColor: "rgba(244, 247, 249, 0)",
                    border: "1px solid rgba(221, 229, 237, 0)",
                  }}
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
                  <div className="h-9 w-16 animate-pulse rounded-2xl bg-white/10"></div>
                  <div className="h-9 w-24 animate-pulse rounded-2xl bg-white/10"></div>
                </div>
              ) : isAuthenticated ? (
                // Show authenticated user options
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 hidden sm:block mr-2">
                    {user?.email}
                  </span>
                  <Link
                    href="/dashboard"
                    className="hidden md:block px-4 py-2 rounded-2xl text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
                    style={{
                      backgroundColor: "rgba(244, 247, 249, 0)",
                      border: "1px solid rgba(221, 229, 237, 0)",
                    }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="hidden md:block px-4 py-2 rounded-2xl text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium border border-white/10"
                    style={{
                      backgroundColor: "rgba(244, 247, 249, 0)",
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                // Show non-authenticated user options
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="hidden md:block px-4 py-2 rounded-2xl text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
                    style={{
                      backgroundColor: "rgba(244, 247, 249, 0)",
                      border: "1px solid rgba(221, 229, 237, 0)",
                    }}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/login"
                    className="hidden md:block px-4 py-2 rounded-2xl bg-white text-black hover:bg-gray-100 transition-colors duration-200 text-sm font-medium"
                  >
                    Sign up for free
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden size-9 flex items-center justify-center text-white hover:text-gray-300 transition-colors ml-2"
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
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-lg">V</span>
                </div>
                <span className="text-white text-2xl font-bold tracking-tight">
                  Verfolia
                </span>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="size-10 flex items-center justify-center text-white hover:text-gray-300 transition-colors"
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
                    className="block text-3xl font-semibold text-white hover:text-gray-300 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Additional mobile links */}
                <Link
                  href="#blogs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-3xl font-semibold text-white hover:text-gray-300 transition-colors duration-200"
                >
                  Blogs
                </Link>

                <Link
                  href="#solutions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-3xl font-semibold text-white hover:text-gray-300 transition-colors duration-200"
                >
                  Solutions
                </Link>

                <Link
                  href="#documentation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-3xl font-semibold text-white hover:text-gray-300 transition-colors duration-200"
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
                    className="block w-full py-4 text-center bg-white text-black rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full py-4 text-center border border-white/20 text-white rounded-full text-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-4 text-center bg-white text-black rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
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
