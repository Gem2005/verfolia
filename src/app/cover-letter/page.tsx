"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";

export default function CoverLetter() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        redirect("/login");
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-navy-950 to-blue-950 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #020617 0%, #0c1426 30%, #1e3a8a 100%)'}}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/15 rounded-full mix-blend-screen filter blur-3xl opacity-80 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-80 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-200 via-blue-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-2xl">
              Cover Letter Generator
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed drop-shadow-xl font-medium mb-12">
            Generate personalized cover letters with AI assistance for your job applications.
          </p>

          <div className="bg-gradient-to-br from-white/10 via-blue-500/10 to-indigo-500/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl">
            <div className="text-white text-xl font-semibold mb-4">Coming Soon</div>
            <div className="text-blue-100 text-lg">
              We&apos;re building an intelligent cover letter generator for you. Stay tuned!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
