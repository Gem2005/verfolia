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
}: AppLayoutProps) {
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)',
        minHeight: '100vh',
        color: 'white'
      }}
    >
      {showNavbar && <Navbar />}
      <main className={`flex-1`}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
