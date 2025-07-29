"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-blue-900 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1e40af 100%)'}}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-blue-900 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1e40af 100%)'}}>
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <div className="text-white text-2xl font-bold mb-4 drop-shadow-lg">Access Restricted</div>
          <div className="text-blue-200 mb-6">Please sign in to access Verfolia</div>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-slate-900 to-blue-900 hover:from-slate-800 hover:to-blue-800 text-white font-bold">
              Go to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-blue-900 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1e40af 100%)'}}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-slate-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Image
            src="/verfolia-logo.svg"
            alt="Verfolia"
            width={60}
            height={60}
            className="w-15 h-15 filter brightness-125 contrast-125 drop-shadow-lg"
          />
          <span className="text-3xl font-bold text-white drop-shadow-lg">
            Verfolia
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/account">
            <Button className="bg-gradient-to-r from-slate-900 to-blue-900 hover:from-slate-800 hover:to-blue-800 font-medium shadow-lg">
              Account
            </Button>
          </Link>
          <form action="/auth/signout" method="post">
            <Button variant="outline" className="font-medium border-white/30 text-white hover:bg-white/10 hover:border-white/50">
              Sign Out
            </Button>
          </form>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
            <span className="bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent drop-shadow-2xl">
              Transform Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-100 to-cyan-100 bg-clip-text text-transparent drop-shadow-2xl">
              Professional Identity
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
            Welcome back! Continue building your professional story with Verfolia&apos;s powerful tools and analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Link href="/account">
              <Button size="lg" className="bg-gradient-to-r from-slate-900 to-blue-900 hover:from-slate-800 hover:to-blue-800 text-lg px-10 py-6 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
                Go to Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-10 py-6 h-auto font-semibold border-white/30 text-white hover:bg-white/10 hover:border-white/50">
              Explore Features
            </Button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="text-4xl font-bold text-cyan-200 mb-2 drop-shadow-lg">15,000+</div>
              <div className="text-blue-100 font-medium">Active Professionals</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="text-4xl font-bold text-blue-200 mb-2 drop-shadow-lg">95%</div>
              <div className="text-blue-100 font-medium">Career Growth Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="text-4xl font-bold text-indigo-200 mb-2 drop-shadow-lg">500+</div>
              <div className="text-blue-100 font-medium">Partner Companies</div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl group hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-md">Smart Portfolio Builder</h3>
              <p className="text-blue-100 leading-relaxed">
                Create stunning professional portfolios with AI-powered suggestions and industry-specific templates.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl group hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-md">Career Analytics</h3>
              <p className="text-blue-100 leading-relaxed">
                Track your professional growth with detailed analytics and personalized career development recommendations.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl group hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-slate-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-md">Network & Connect</h3>
              <p className="text-blue-100 leading-relaxed">
                Build meaningful professional connections and discover new opportunities through intelligent networking.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Image
                  src="/verfolia-logo.svg"
                  alt="Verfolia"
                  width={32}
                  height={32}
                  className="w-8 h-8 filter brightness-125 contrast-125"
                />
                <span className="text-xl font-bold text-white drop-shadow-sm">Verfolia</span>
              </div>
              <p className="text-blue-200 text-sm leading-relaxed">
                Empowering professionals to build, grow, and showcase their digital identity.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Portfolio Builder</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Career Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Networking Hub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Skills Assessment</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Career Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Industry Insights</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/20">
            <div className="flex space-x-6 text-sm text-blue-200 mb-4 md:mb-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
            
            <div className="text-sm text-blue-300">
              © 2025 Verfolia. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
