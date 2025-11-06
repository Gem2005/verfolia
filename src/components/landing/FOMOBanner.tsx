"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const FOMOBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [profileCount, setProfileCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const router = useRouter();

  // Fetch real count from database
  useEffect(() => {
    const fetchCompletedCount = async () => {
      try {
        const response = await fetch('/api/stats/completed-resumes');
        const data = await response.json();
        const realCount = data.count || 0;
        setTargetCount(realCount);
      } catch {
        setTargetCount(0);
      }
    };

    fetchCompletedCount();
  }, []);

  // Animated counter effect - counts up to target with easing
  useEffect(() => {
    if (!isVisible) return;
    
    // If count is 0, just show 0
    if (targetCount === 0) {
      setProfileCount(0);
      return;
    }

    const duration = 2000; // 2 seconds animation
    const steps = 60; // 60 frames
    let current = 0;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      // Easing function for smooth animation
      const progress = frame / steps;
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      current = Math.floor(easeOutQuad * targetCount);
      
      setProfileCount(current);

      if (frame >= steps) {
        setProfileCount(targetCount);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, targetCount]);

  useEffect(() => {
    let interactionTimer: NodeJS.Timeout | null = null;
    let autoFadeTimer: NodeJS.Timeout | null = null;
    let hasInteracted = false;

    // TEMPORARY: Show immediately in dev for testing
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      setTimeout(() => setIsVisible(true), 2000);
      return;
    }

    const interactionDelay = 60000; // 1 minute in prod

    // Track user interaction (scroll or click)
    const handleInteraction = () => {
      if (hasInteracted) return;
      
      hasInteracted = true;

      // Start countdown
      interactionTimer = setTimeout(() => {
        setIsVisible(true);

        // Auto-fade after 15 seconds if ignored
        autoFadeTimer = setTimeout(() => {
          setIsVisible(false);
        }, 15000);
      }, interactionDelay);
    };

    // Listen for scroll and mouse movement
    window.addEventListener("scroll", handleInteraction, { once: true });
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("mousemove", handleInteraction, { once: true });

    return () => {
      if (interactionTimer) clearTimeout(interactionTimer);
      if (autoFadeTimer) clearTimeout(autoFadeTimer);
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("mousemove", handleInteraction);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSignup = () => {
    // Redirect to get-started page which has Google OAuth
    router.push("/get-started");
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "transform transition-all duration-500 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl",
            "bg-gradient-to-r from-[#2C3E50] via-[#34495E] to-[#3498DB]",
            "shadow-2xl border-2 border-[#3498DB]/30 dark:border-[#3498DB]/50",
            "backdrop-blur-sm"
          )}
          style={{
            maxHeight: "80px",
          }}
        >
          {/* Animated background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ECF0F1]/10 to-transparent animate-shimmer" />

          <div className="relative flex items-center justify-between gap-4 px-6 py-4 h-[80px]">
            {/* Content */}
            <div className="flex-1 flex items-center gap-6">
              <div className="flex-1">
                <p className="text-white font-bold text-sm sm:text-base leading-tight">
                  Thousands are building their Verfolia profiles. Don&apos;t get left behind — start free today.
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27AE60] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#27AE60]"></span>
                    </span>
                    <TrendingUp className="h-3.5 w-3.5 text-[#27AE60]" />
                    <span className="text-white/95 text-xs sm:text-sm font-semibold">
                      {profileCount.toLocaleString()} profiles built this month
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleSignup}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-bold text-sm",
                  "bg-white text-[#2C3E50] hover:bg-[#ECF0F1]",
                  "transition-all duration-300",
                  "shadow-xl hover:shadow-2xl hover:scale-105",
                  "whitespace-nowrap border-2 border-white/20"
                )}
              >
                Start Free
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className={cn(
                "flex-shrink-0 p-1.5 rounded-full",
                "text-white/80 hover:text-white",
                "hover:bg-white/10 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-white/20"
              )}
              aria-label="Close banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
};
