"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
            "relative overflow-hidden rounded-lg",
            "bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600",
            "shadow-2xl border border-purple-400/20",
            "backdrop-blur-sm"
          )}
          style={{
            maxHeight: "80px",
          }}
        >
          {/* Animated background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

          <div className="relative flex items-center justify-between gap-4 px-6 py-4 h-[80px]">
            {/* Content */}
            <div className="flex-1 flex items-center gap-6">
              <div className="flex-1">
                <p className="text-white font-semibold text-sm sm:text-base leading-tight">
                  Thousands are building their Verfolia profiles. Don&apos;t get left
                  behind — start free today.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-white/90 text-xs sm:text-sm font-medium">
                      {profileCount.toLocaleString()} profiles built this month
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleSignup}
                className={cn(
                  "px-6 py-2.5 rounded-lg font-semibold text-sm",
                  "bg-white text-purple-600 hover:bg-purple-50",
                  "transition-all duration-200",
                  "shadow-lg hover:shadow-xl hover:scale-105",
                  "whitespace-nowrap"
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
