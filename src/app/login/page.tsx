"use client";

import { useState } from "react";
import Image from "next/image";
import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-violet-400/10 to-pink-400/10 rounded-full blur-2xl animate-spin duration-[20s]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center min-h-screen">
        
        {/* Features Card */}
        <Card className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-blue-900 text-white border-0 shadow-2xl hover:shadow-[0_0_80px_rgba(30,58,138,0.4)] transition-all duration-500 transform hover:scale-[1.03] order-2 lg:order-1 overflow-hidden group" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e40af 100%)'}}>
          {/* Card Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy-600/10 via-blue-800/10 to-indigo-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all duration-500"></div>
          <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all duration-500"></div>
          
          <CardHeader className="relative space-y-4 p-4 sm:p-6 lg:p-8">
            {/* Logo positioned at top left */}
            <div className="flex justify-start mb-4">
              <div className="group-hover:scale-110 transition-all duration-500">
                <Image
                  src="/verfolia-logo.svg"
                  alt="Verfolia Logo"
                  width={160}
                  height={48}
                  className="filter brightness-125 contrast-125 drop-shadow-lg"
                  priority
                />
              </div>
            </div>
            
            <div className="space-y-3 text-center">
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                Welcome to Verfolia
              </CardTitle>
              <CardDescription className="text-blue-100 text-base sm:text-lg font-semibold tracking-wide drop-shadow-md">
                Your Digital Professional Identity Platform
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="relative space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="space-y-4">
              {[
                "Dynamic Professional Portfolio",
                "Career Growth Tracking & Analytics", 
                "Skills Development Insights",
                "Beyond Traditional Resumes"
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-6 group/item hover:translate-x-4 transition-all duration-500 cursor-pointer">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full group-hover/item:scale-150 transition-all duration-500 shadow-lg shadow-blue-500/50 group-hover/item:shadow-blue-400/70"></div>
                  <span className="text-blue-50 text-base sm:text-lg font-semibold tracking-wide group-hover/item:text-white transition-colors duration-300 drop-shadow-sm">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/30 pt-6">
              <blockquote className="text-center space-y-3 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
                <p className="text-blue-100 italic text-sm sm:text-base leading-relaxed font-medium drop-shadow-sm">
                  "Verfolia helped me showcase my professional journey in ways a traditional resume never could. I landed my dream job!"
                </p>
                <footer className="text-white font-bold text-xs tracking-wide drop-shadow-sm">
                  — Alex Martinez, Software Engineer
                </footer>
              </blockquote>
            </div>
            
            <div className="bg-gradient-to-r from-white/10 to-blue-300/10 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/30 hover:bg-gradient-to-r hover:from-white/15 hover:to-blue-300/15 transition-all duration-500 group/cta shadow-lg hover:shadow-xl">
              <p className="text-xs text-blue-200 mb-2 font-semibold tracking-wide group-hover/cta:text-blue-100 transition-colors duration-300">
                Take control of your career
              </p>
              <p className="text-white font-black text-base tracking-wide group-hover/cta:scale-105 transition-transform duration-300 drop-shadow-md">
                Join 10,000+ professionals building their digital identity
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Auth Card */}
        <Card className="relative bg-white/80 backdrop-blur-xl shadow-2xl border border-white/20 hover:shadow-[0_0_80px_rgba(148,163,184,0.3)] transition-all duration-500 transform hover:scale-[1.02] order-1 lg:order-2 overflow-hidden group">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <CardHeader className="relative text-center space-y-4 p-4 sm:p-6">
            <div className="flex justify-center bg-gradient-to-r from-slate-100 to-blue-50 rounded-2xl p-2 mb-4 shadow-inner">
              <button
                onClick={() => setIsLogin(true)}
                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all duration-500 tracking-wide relative overflow-hidden ${
                  isLogin
                    ? 'bg-gradient-to-r from-slate-900 to-blue-900 text-white shadow-lg transform scale-105 shadow-slate-900/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 hover:shadow-md'
                }`}
              >
                <span className="relative z-10">Sign In</span>
                {isLogin && <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 animate-pulse"></div>}
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all duration-500 tracking-wide relative overflow-hidden ${
                  !isLogin
                    ? 'bg-gradient-to-r from-slate-900 to-blue-900 text-white shadow-lg transform scale-105 shadow-slate-900/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 hover:shadow-md'
                }`}
              >
                <span className="relative z-10">Sign Up</span>
                {!isLogin && <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 animate-pulse"></div>}
              </button>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight drop-shadow-sm">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-slate-600 text-sm sm:text-base font-semibold drop-shadow-sm">
                {isLogin 
                  ? 'Sign in to your account to continue' 
                  : 'Join us today and get started'
                }
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="relative p-4 sm:p-6">
            <form className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-bold text-slate-700 tracking-wide">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full h-12 px-4 text-base border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all duration-300 hover:border-slate-400 hover:shadow-lg bg-white/70 backdrop-blur-sm"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-bold text-slate-700 tracking-wide">
                    Password
                  </Label>
                  {isLogin && (
                    <a
                      href="#"
                      className="text-sm text-slate-600 hover:text-slate-900 hover:underline transition-all duration-300 font-semibold hover:scale-105"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                  className="w-full h-12 px-4 text-base border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all duration-300 hover:border-slate-400 hover:shadow-lg bg-white/70 backdrop-blur-sm"
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-3">
                  <Label htmlFor="confirm-password" className="text-sm font-bold text-slate-700 tracking-wide">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full h-12 px-4 text-base border-2 border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all duration-300 hover:border-slate-400 hover:shadow-lg bg-white/70 backdrop-blur-sm"
                    required
                  />
                </div>
              )}

              <div className="space-y-3 pt-4">
                <Button 
                  formAction={isLogin ? login : signup}
                  className="w-full h-12 bg-gradient-to-r from-slate-900 to-blue-900 hover:from-slate-800 hover:to-blue-800 text-white font-bold text-base rounded-xl transition-all duration-500 hover:shadow-xl hover:scale-[1.03] tracking-wide relative overflow-hidden group/btn"
                >
                  <span className="relative z-10">{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t-2 border-slate-300" />
                  </div>
                  <div className="relative flex justify-center text-sm uppercase tracking-wider">
                    <span className="bg-white px-4 text-slate-500 font-bold">Or continue with</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold text-base rounded-xl transition-all duration-500 hover:shadow-xl hover:scale-[1.03] flex items-center justify-center space-x-3 bg-white/70 backdrop-blur-sm group/google"
                >
                  <svg className="w-5 h-5 group-hover/google:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="tracking-wide">Google</span>
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600 font-semibold text-base">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-black text-slate-900 hover:text-blue-900 hover:underline transition-all duration-300 tracking-wide hover:scale-105 inline-block"
                >
                  {isLogin ? "Sign up here" : "Sign in here"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
