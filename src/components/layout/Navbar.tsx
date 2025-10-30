"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, PanInfo } from "framer-motion";
import { useTheme } from "next-themes";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [chainPulled, setChainPulled] = useState(false);
  const [chainLength, setChainLength] = useState(48);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    if (resolvedTheme === "dark") {
      setChainPulled(true);
      setChainLength(72);
    } else {
      setChainPulled(false);
      setChainLength(48);
    }
  }, [resolvedTheme]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const finalDragY = Math.max(0, info.offset.y);
    if (finalDragY > 8) {
      const newTheme = theme === "dark" ? "light" : "dark";
      setTheme(newTheme);
      setChainPulled(newTheme === "dark");
      setChainLength(newTheme === "dark" ? 72 : 48);
    }
    setTimeout(() => {
      setDragY(0);
    }, 100);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full py-4">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full bg-background/40 backdrop-blur-xl shadow-lg">
            {/* Logo Section */}
            <div className="flex items-center flex-shrink-0 min-w-0">
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
            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
              {navigationLinks.map((link, index) =>
                link.href.startsWith("#") ? (
                  <button
                    key={index}
                    onClick={() => handleLinkClick(link.href)}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105 active:scale-95 transition-all duration-200 text-sm font-medium font-jakarta cursor-pointer relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </button>
                ) : (
                  <Link
                    key={index}
                    href={link.href}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105 active:scale-95 transition-all duration-200 text-sm font-medium font-jakarta cursor-pointer relative group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </Link>
                )
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0 justify-end min-w-0">
              {/* Theme Toggle Button - Shows when scrolled */}
              <motion.div 
                className="hidden sm:block"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: isScrolled ? 1 : 0,
                  scale: isScrolled ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <ThemeToggle />
              </motion.div>

              {loading ? (
                // Show loading state
                <div className="flex items-center gap-2">
                  <div className="h-9 w-16 lg:w-20 animate-pulse rounded-full bg-muted/30"></div>
                  <div className="h-9 w-20 lg:w-24 animate-pulse rounded-full bg-muted/30"></div>
                </div>
              ) : isAuthenticated ? (
                // Show authenticated user options
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="hidden sm:inline text-xs lg:text-sm text-foreground font-medium font-jakarta truncate max-w-[60px] sm:max-w-[100px] lg:max-w-none animate-in fade-in slide-in-from-left-2 duration-300">
                    Hi, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-full text-xs lg:text-sm h-8 sm:h-9 px-3 sm:px-4 lg:px-5 border-border/50 hover:bg-muted/80 hover:border-border hover:scale-105 active:scale-95 transition-all duration-200 animate-in fade-in slide-in-from-right-2 flex-shrink-0"
                  >
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="hidden md:flex rounded-full text-xs lg:text-sm h-9 px-4 lg:px-5 hover:bg-muted/80 hover:scale-105 active:scale-95 transition-all duration-200 animate-in fade-in slide-in-from-right-3 flex-shrink-0"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                // Show non-authenticated user options
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hidden md:flex rounded-full text-xs lg:text-sm h-9 px-4 lg:px-5 hover:bg-muted/80 hover:scale-105 active:scale-95 transition-all duration-200 animate-in fade-in slide-in-from-right-2 flex-shrink-0"
                  >
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="rounded-full text-xs lg:text-sm h-8 sm:h-9 px-3 sm:px-4 lg:px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 animate-in fade-in slide-in-from-right-3 flex-shrink-0"
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

      {/* Hanging Lamp - Below Navbar - Shows when not scrolled */}
      <motion.div 
        className="fixed top-[88px] left-0 right-0 z-40 hidden sm:block pointer-events-none"
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: isScrolled ? 0 : 1,
          y: isScrolled ? -60 : 0,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="relative flex justify-end pr-3 sm:pr-4 lg:pr-6">
            <div className="relative flex flex-col items-center group pointer-events-auto">
          <motion.div
            className="w-1 bg-gradient-to-b from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-300 rounded-full shadow-sm relative"
            animate={{
              height: chainLength + dragY,
              scaleY: 1,
            }}
            transition={{
              duration: isDragging ? 0.05 : 0.6,
              ease: isDragging ? "linear" : "easeOut",
              type: isDragging ? "tween" : "spring",
              stiffness: isDragging ? undefined : 200,
              damping: isDragging ? undefined : 20,
            }}
            style={{
              height: `${chainLength + dragY}px`,
              transformOrigin: "top center",
            }}
          >
            {dragY > 4 && (
              <div className="absolute inset-0 flex flex-col justify-evenly">
                {Array.from({ length: Math.floor((chainLength + dragY) / 8) }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="w-full h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full opacity-40"
                    />
                  )
                )}
              </div>
            )}
          </motion.div>
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 12 }}
            dragElastic={0}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrag={(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
              const newDragY = Math.max(0, info.offset.y);
              setDragY(newDragY);
            }}
            whileHover={{ scale: 1.05 }}
            whileDrag={{
              scale: 1.12,
              boxShadow: `0 ${6 + dragY * 0.3}px ${14 + dragY * 0.3}px rgba(0,0,0,0.3)`,
            }}
            className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-300 dark:to-yellow-500 rounded-full shadow-lg border-2 border-yellow-500 dark:border-yellow-400 transition-shadow duration-200 relative overflow-hidden cursor-grab active:cursor-grabbing"
            animate={{
              rotateZ: chainPulled ? 180 : 0,
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-transparent opacity-60"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col space-y-0.5">
                <motion.div
                  className="w-3 h-0.5 bg-yellow-700 dark:bg-yellow-200 rounded-full opacity-60"
                  animate={{ scaleX: 1 + dragY * 0.02 }}
                />
                <motion.div
                  className="w-3 h-0.5 bg-yellow-700 dark:bg-yellow-200 rounded-full opacity-60"
                  animate={{ scaleX: 1 + dragY * 0.02 }}
                />
                <motion.div
                  className="w-3 h-0.5 bg-yellow-700 dark:bg-yellow-200 rounded-full opacity-60"
                  animate={{ scaleX: 1 + dragY * 0.02 }}
                />
              </div>
            </div>
            {isDarkMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-yellow-500/90 dark:bg-yellow-400/90 rounded-full backdrop-blur-sm"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-800"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </motion.div>
            )}
            {!isDragging && !chainPulled && (
              <motion.div
                className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap pointer-events-none bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded-full"
                initial={{ opacity: 0, y: -5 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [0, -2, -2, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
              >
                Pull me!
              </motion.div>
            )}
            {isDragging && dragY > 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: dragY > 8 ? 1 : 0.7,
                  scale: dragY > 8 ? 1.1 : 1,
                }}
                className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs text-white px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none font-medium transition-all duration-200 ${
                  isDarkMode ? "bg-amber-600" : "bg-purple-600"
                }`}
              >
                {dragY > 8
                  ? `🌟 Release!`
                  : `Pull ${Math.round(8 - dragY)}px`}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
      </motion.div>

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
                  <div className="text-sm font-medium text-foreground mb-2">
                    Hi, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
                  </div>
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
