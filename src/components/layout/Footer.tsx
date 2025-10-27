import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Twitter, FileText, Book } from "lucide-react";
import VenomBeam from "@/components/ui/venom-beam";

function Footer() {
  return (
    <footer className="bg-background border-t border-border relative overflow-hidden">
      {/* VenomBeam Background - Absolute positioned to fill entire footer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-60 dark:opacity-50">
        <VenomBeam />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Create Your Perfect Profile.{" "}
            <span className="text-primary">Build Your Career.</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto px-4 sm:px-0">
            Transform your professional story with our AI-powered resume builder
            that gets you noticed by top employers.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Start Building Your Resume →
          </Link>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://www.notion.so/Profile-24722774e30a814f91bcfead615ba1e5"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Profile Building
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://www.notion.so/Privacy-Policy-24722774e30a812bacf5f8d22fca7b06"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.notion.so/Terms-Conditions-24722774e30a816d95fefaa857d80aa6"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://www.notion.so/Support-Policy-24722774e30a81c9b4dacbfef45b2a80"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.notion.so/Data-Transparency-24722774e30a80bca143ec2a008fcdd8"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Data Transparency
                </Link>
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Pricing
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://www.notion.so/Plans-and-Pricing-24722774e30a81db942af223d2d000b6"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Plans & Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* More */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              More
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://www.notion.so/Verfolia-Documentation-24722774e30a80e48922d21361630f9f"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Book className="h-3.5 w-3.5" />
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Logo and Copyright */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/Logo.png"
                  alt="Verfolia"
                  width={100}
                  height={28}
                  className="h-7 w-auto rounded-xl object-contain"
                />
              </Link>
              <p className="text-xs text-muted-foreground">
                © 2025 Verfolia. All rights reserved.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              <Link
                href="https://instagram.com/verfolia"
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="https://linkedin.com/company/verfolia"
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link
                href="https://twitter.com/verfolia"
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
