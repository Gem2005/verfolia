"use client";

import Navbar from "./Navbar";
import Footer from "./Footer";

interface AppLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function AppLayout({
  children,
  showNavbar = true,
  showFooter = true,
  className = "",
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className={`flex-1 ${showNavbar ? "" : ""} ${className}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
