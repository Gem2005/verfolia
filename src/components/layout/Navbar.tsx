// src/components/layout/Navbar.tsx
"use client";

import React, { useState, forwardRef, ElementRef, ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown, Zap, BarChart3, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthDialog from "../AuthDialog"; // Correctly import the AuthDialog

const LOGO_PATH = "/logo.png";

const ListItem = forwardRef<
  ElementRef<"a">,
  ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <DropdownMenuItem asChild>
        <Link
          href={props.href || "#"}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent focus:bg-accent w-full",
            className
          )}
          {...props}
        >
          <div className="flex items-start gap-3">
            {children}
            <div>
              <div className="text-sm font-medium leading-none">{title}</div>
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                The description for {title} goes here.
              </p>
            </div>
          </div>
        </Link>
      </DropdownMenuItem>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const navLinks = (
    <>
      <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
        Home
      </Link>
      <Link href="/#about" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
        About
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-1 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            <span>Features</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 p-2">
            <DropdownMenuItem asChild>
                <Link href="/#features" className="flex items-start gap-3 p-2">
                    <Zap className="h-5 w-5 mt-1 text-primary flex-shrink-0"/>
                    <div>
                        <div className="font-medium">Dynamic Templates</div>
                        <p className="text-xs text-muted-foreground">Adaptable layouts for your story.</p>
                    </div>
                </Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
                <Link href="/#analytics" className="flex items-start gap-3 p-2">
                    <BarChart3 className="h-5 w-5 mt-1 text-primary flex-shrink-0"/>
                    <div>
                        <div className="font-medium">Real-time Analytics</div>
                        <p className="text-xs text-muted-foreground">Track views and engagement.</p>
                    </div>
                </Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
                <Link href="/#ai-builder" className="flex items-start gap-3 p-2">
                    <Bot className="h-5 w-5 mt-1 text-primary flex-shrink-0"/>
                    <div>
                        <div className="font-medium">AI-Powered Builder</div>
                        <p className="text-xs text-muted-foreground">Craft summaries with AI assistance.</p>
                    </div>
                </Link>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <a href="https://www.notion.so/Verfolia-Documentation-24722774e30a80e48922d21361630f9f?source=copy_link" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
        Docs
      </a>
    </>
  );

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 px-6 bg-card/80 backdrop-blur-lg border border-border/50 rounded-full shadow-lg">
          <Link href="/" className="flex items-center space-x-2">
            <Image src={LOGO_PATH} alt="Verfolia Logo" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-bold verfolia-text-gradient">
              Verfolia
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks}
          </nav>

          <div className="flex items-center space-x-2">
             <div className="hidden md:flex items-center space-x-2">
                 <ThemeToggle />
                 {loading ? (
                     <div className="h-9 w-24 animate-pulse rounded-full bg-muted"></div>
                 ) : isAuthenticated ? (
                    <>
                        <Button variant="ghost" asChild className="rounded-full">
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                        <Button onClick={handleSignOut} className="rounded-full">Sign Out</Button>
                    </>
                 ) : (
                    // Replaced separate buttons with a single "Get Started" button
                    <AuthDialog buttonText="Get Started" />
                 )}
             </div>
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-2 bg-card/95 backdrop-blur-lg border border-border/50 rounded-2xl p-4 verfolia-animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {navLinks}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                {isAuthenticated ? (
                    <>
                        <Button asChild className="w-full justify-start"><Link href="/dashboard">Dashboard</Link></Button>
                        <Button variant="outline" onClick={handleSignOut} className="w-full justify-start">Sign Out</Button>
                    </>
                ) : (
                    
                    <AuthDialog buttonText="Get Started" />
                )}
                 <div className="pt-2"><ThemeToggle /></div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
