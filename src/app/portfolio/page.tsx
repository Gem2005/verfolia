import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function PortfolioLandingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Create Your Professional Portfolio
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Showcase your skills, projects, and experience with our beautifully
          designed portfolio templates.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/portfolio/templates">
            <Button size="lg" className="text-lg px-8 py-6">
              Browse Templates <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Create a Portfolio?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Stand Out</h3>
            <p className="text-gray-600">
              Differentiate yourself from other candidates with a professional
              portfolio that showcases your unique skills and experience.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Showcase Projects</h3>
            <p className="text-gray-600">
              Display your best work in a visually appealing way, making it easy
              for potential clients or employers to see what you're capable of.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Build Your Brand</h3>
            <p className="text-gray-600">
              Create a consistent personal brand that represents your
              professional identity and helps you make a lasting impression.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Choose from our collection of professionally designed templates and
          create your portfolio in minutes.
        </p>
        <Link href="/portfolio/templates">
          <Button size="lg" className="text-lg">
            Explore Templates
          </Button>
        </Link>
      </div>
    </div>
  );
}
