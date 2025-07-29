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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-navy-950 to-blue-950 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #020617 0%, #0c1426 30%, #1e3a8a 100%)'}}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative text-white text-xl font-semibold tracking-wide">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-navy-950 to-blue-950 flex items-center justify-center relative overflow-hidden" style={{background: 'linear-gradient(135deg, #020617 0%, #0c1426 30%, #1e3a8a 100%)'}}>
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-navy-500/10 rounded-full blur-2xl animate-spin duration-[30s]"></div>
        </div>
        
        <div className="text-center space-y-8 max-w-lg mx-auto p-8 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-8">
              <Image
                src="/verfolia-logo.svg"
                alt="Verfolia"
                width={80}
                height={80}
                className="filter brightness-125 contrast-125 drop-shadow-2xl"
              />
            </div>
            <div className="text-4xl font-black mb-6 drop-shadow-2xl bg-gradient-to-r from-blue-200 via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
              Welcome to Verfolia
            </div>
            <div className="text-blue-200 text-lg font-medium leading-relaxed drop-shadow-lg">
              Please sign in to access your professional dashboard and start building your digital identity.
            </div>
          </div>
          
          <div className="pt-4">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-slate-900 to-navy-900 hover:from-slate-800 hover:to-navy-800 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 border border-blue-500/20">
                Sign In to Continue
              </Button>
            </Link>
          </div>
          
          <div className="text-center pt-6">
            <p className="text-blue-300 text-sm font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/login" className="text-blue-100 hover:text-white font-bold hover:underline transition-all duration-300">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-navy-950 to-blue-950 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #020617 0%, #0c1426 30%, #1e3a8a 100%)'}}>
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/15 rounded-full mix-blend-screen filter blur-3xl opacity-80 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-80 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-96 h-96 bg-navy-500/15 rounded-full mix-blend-screen filter blur-3xl opacity-80 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full mix-blend-screen filter blur-2xl opacity-70 animate-spin duration-[20s]"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-blue-400/60 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 right-1/3 w-3 h-3 bg-indigo-400/60 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-1/3 left-20 w-2 h-2 bg-cyan-400/60 rounded-full animate-ping delay-2000"></div>
      </div>

      {/* Enhanced Navigation with Premium Glass Effect */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto backdrop-blur-xl bg-gradient-to-r from-white/15 via-blue-500/10 to-indigo-500/15 rounded-2xl mt-6 border border-white/25 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
        {/* Clean Brand Section */}
        <div className="flex items-center">
          <span className="text-3xl font-bold text-white drop-shadow-lg hover:text-blue-100 transition-colors duration-300">
            Verfolia
          </span>
        </div>
        
        {/* Navigation Links with Enhanced Styling */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link href="/resume-builder" className="relative text-blue-100 hover:text-white font-semibold text-lg transition-all duration-300 hover:scale-105 group">
            <span className="relative z-10">Resume Builder</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 rounded-lg -m-2 transition-all duration-300"></div>
          </Link>
          <Link href="/profile" className="relative text-blue-100 hover:text-white font-semibold text-lg transition-all duration-300 hover:scale-105 group">
            <span className="relative z-10">Profile</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 rounded-lg -m-2 transition-all duration-300"></div>
          </Link>
          <Link href="/cover-letter" className="relative text-blue-100 hover:text-white font-semibold text-lg transition-all duration-300 hover:scale-105 group">
            <span className="relative z-10">Cover Letter</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 rounded-lg -m-2 transition-all duration-300"></div>
          </Link>
        </div>
        
        {/* Action Buttons with Premium Design */}
        <div className="flex items-center space-x-4">
          <Link href="/account">
            <Button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-500 font-semibold text-white px-6 py-3 shadow-xl hover:shadow-blue-500/40 border border-blue-400/30 hover:border-blue-300/50 transition-all duration-300 transform hover:scale-105 rounded-xl">
              Account
            </Button>
          </Link>
          <form action="/auth/signout" method="post">
            <Button variant="outline" className="font-semibold px-6 py-3 !border-blue-400/50 !text-blue-200 hover:!bg-blue-500/20 hover:!border-blue-300/70 hover:!text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 rounded-xl bg-white/5 shadow-lg hover:shadow-blue-500/20">
              Sign Out
            </Button>
          </form>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-16">
        <div className="text-center">
          {/* Main Title with Enhanced Animation */}
          <div className="relative mb-8">
            <h1 className="relative text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-xl">
                Build. Share. Track.
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-xl">
                Own Your Professional Story.
              </span>
            </h1>
          </div>
          
          <div className="relative mb-12">
            <p className="relative text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light">
              Verfolia is an all-in-one toolkit to create standout resumes, write AI-powered cover letters, and track document engagement with real-time analytics. Transform your job search with intelligent insights and professional presentation.
            </p>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/resume-builder">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-500 text-lg px-8 py-4 h-auto font-bold shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 border border-blue-400/30 rounded-xl">
                Start Building Now
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="outline" size="lg" className="font-medium text-lg px-8 py-4 h-auto !border-blue-400/40 !text-blue-200 hover:!bg-blue-500/10 hover:!border-blue-300/60 transition-all duration-300 hover:scale-105 rounded-xl bg-transparent">
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Enhanced Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="bg-gradient-to-br from-white/8 via-blue-500/8 to-indigo-500/8 backdrop-blur-xl rounded-2xl p-6 border border-white/15 shadow-xl group hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="relative z-10 text-center">
                <div className="text-3xl font-black text-cyan-300 mb-2 drop-shadow-xl">15,000+</div>
                <div className="text-blue-100 font-medium text-base">Active Professionals</div>
                <div className="text-blue-200/70 text-sm mt-1">Building their careers daily</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/8 via-indigo-500/8 to-blue-500/8 backdrop-blur-xl rounded-2xl p-6 border border-white/15 shadow-xl group hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="relative z-10 text-center">
                <div className="text-3xl font-black text-blue-300 mb-2 drop-shadow-xl">95%</div>
                <div className="text-blue-100 font-medium text-base">Career Growth Rate</div>
                <div className="text-blue-200/70 text-sm mt-1">Users see career advancement</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/8 via-cyan-500/8 to-blue-500/8 backdrop-blur-xl rounded-2xl p-6 border border-white/15 shadow-xl group hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="relative z-10 text-center">
                <div className="text-3xl font-black text-indigo-300 mb-2 drop-shadow-xl">500+</div>
                <div className="text-blue-100 font-medium text-base">Partner Companies</div>
                <div className="text-blue-200/70 text-sm mt-1">Hiring through our platform</div>
              </div>
            </div>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            <div className="bg-gradient-to-br from-white/8 via-slate-500/8 to-blue-500/8 backdrop-blur-xl rounded-2xl p-6 border border-white/15 shadow-xl group hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3 text-white">Smart Resume Builder</h3>
                <p className="text-blue-100/90 leading-relaxed text-sm font-light">
                  AI-powered resume creation with industry-specific templates and intelligent suggestions.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 via-blue-500/8 to-indigo-500/8 backdrop-blur-xl rounded-2xl p-6 border border-white/15 shadow-xl group hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3 text-white">Career Analytics</h3>
                <p className="text-blue-100/90 leading-relaxed text-sm font-light">
                  Track your progress with detailed insights and personalized recommendations.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/8 via-indigo-500/8 to-cyan-500/8 backdrop-blur-xl rounded-2xl p-6 border border-white/15 shadow-xl group hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="relative z-10 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3 text-white">Professional Network</h3>
                <p className="text-blue-100/90 leading-relaxed text-sm font-light">
                  Connect with industry professionals and discover new opportunities.
                </p>
              </div>
            </div>
          </div>

          {/* Why Verfolia Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="relative text-3xl md:text-4xl font-black mb-4 leading-tight">
                <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-xl">
                  Why Choose Verfolia?
                </span>
              </h2>
              <p className="text-lg text-blue-100/90 max-w-2xl mx-auto leading-relaxed font-light">
                Join thousands of professionals who trust Verfolia to elevate their careers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gradient-to-br from-white/8 via-blue-500/8 to-indigo-500/8 backdrop-blur-xl rounded-2xl p-6 border border-white/15 shadow-xl group hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white">AI-Powered Intelligence</h3>
                  </div>
                  <p className="text-blue-100/90 leading-relaxed font-light text-sm">
                    Advanced AI algorithms optimize your professional profile for maximum impact.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/8 via-indigo-500/8 to-cyan-500/8 backdrop-blur-xl rounded-2xl p-6 border border-white/15 shadow-xl group hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white">Enterprise Security</h3>
                  </div>
                  <p className="text-blue-100/90 leading-relaxed font-light text-sm">
                    Bank-level encryption ensures your professional data remains safe and confidential.
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-white/10 via-blue-500/10 to-indigo-500/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white mb-4">
                    Ready to Transform Your Career?
                  </h3>
                  <p className="text-blue-100/90 text-base mb-6 max-w-xl mx-auto leading-relaxed font-light">
                    Join over 15,000 professionals who have elevated their careers with Verfolia.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/resume-builder">
                      <Button size="lg" className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-500 text-lg px-8 py-4 h-auto font-bold shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 border border-blue-400/30 rounded-xl">
                        Start Building Now
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="outline" size="lg" className="font-medium text-lg px-8 py-4 h-auto !border-blue-400/40 !text-blue-200 hover:!bg-blue-500/10 hover:!border-blue-300/60 transition-all duration-300 hover:scale-105 rounded-xl bg-transparent">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-gradient-to-r from-slate-950/90 via-navy-950/90 to-blue-950/90 backdrop-blur-xl mt-16">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-xl blur-md"></div>
                  <Image
                    src="/verfolia-logo.svg"
                    alt="Verfolia"
                    width={40}
                    height={40}
                    className="relative w-10 h-10 filter brightness-125 contrast-125"
                  />
                </div>
                <span className="text-2xl font-black drop-shadow-lg bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Verfolia</span>
              </div>
              <p className="text-blue-200 text-base leading-relaxed font-medium">
                Empowering professionals to build, grow, and showcase their digital identity with cutting-edge technology.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-black mb-6 text-lg">Platform</h4>
              <ul className="space-y-3 text-blue-200 text-base font-medium">
                <li><a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Portfolio Builder</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Career Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Networking Hub</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Skills Assessment</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-black mb-6 text-lg">Resources</h4>
              <ul className="space-y-3 text-blue-200 text-base font-medium">
                <li><a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Career Guides</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Industry Insights</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-black mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-blue-200 text-base font-medium">
                <li><a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Press</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
            <div className="flex space-x-8 text-base text-blue-200 mb-6 md:mb-0 font-medium">
              <a href="#" className="hover:text-white transition-all duration-300 hover:scale-105">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-all duration-300 hover:scale-105">Terms of Service</a>
              <a href="#" className="hover:text-white transition-all duration-300 hover:scale-105">Cookie Policy</a>
            </div>
            
            <div className="text-base text-blue-300 font-semibold">
              © 2025 Verfolia. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
