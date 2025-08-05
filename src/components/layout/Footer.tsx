import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Twitter } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-background">
      <div className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Create Your Perfect Resume.{" "}
            <span className="text-primary">Build Your Career.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your professional story with our AI-powered resume builder
            that gets you noticed by top employers.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Start Building Your Resume →
          </Link>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Solutions</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/resume-builder"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link
                  href="/templates"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/cover-letters"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cover Letters
                </Link>
              </li>
              <li>
                <Link
                  href="/ats-checker"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ATS Checker
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/guides"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Career Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/examples"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Resume Examples
                </Link>
              </li>
              <li>
                <Link
                  href="/tips"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Interview Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Additional */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm">More</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/api"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  API
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Logo and Copyright */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Link href="/" className="flex items-center">
                <Image
                  src="/verfolia-logo.svg"
                  alt="Verfolia"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                />
              </Link>
              <p className="text-sm text-muted-foreground">
                © 2025 Verfolia. All rights reserved.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <Link
                href="https://instagram.com/verfolia"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com/company/verfolia"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com/verfolia"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
