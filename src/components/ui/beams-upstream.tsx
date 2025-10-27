"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Seeded random number generator for consistent SSR/CSR
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const BeamsUpstream = React.memo(
  ({ className }: { className?: string }) => {
    const { paths, animationConfigs, gradientConfigs } = useMemo(() => {
      const pathList: string[] = [];
      const animations: Array<{ duration: number; delay: number }> = [];
      const gradients: Array<{ duration: number; delay: number }> = [];
      const screenSections = 12;
      let seed = 12345; // Fixed seed for consistency
      
      // Generate paths
      for (let section = 0; section < screenSections; section++) {
        const baseX = (section * 100) / (screenSections - 1); 
        for (let variation = 0; variation < 4; variation++) {
          const startX = baseX + (seededRandom(seed++) - 0.5) * 15; 
          const midX1 = startX + (seededRandom(seed++) - 0.5) * 20;
          const midX2 = startX + (seededRandom(seed++) - 0.5) * 25;
          const endX = startX + (seededRandom(seed++) - 0.5) * 30;
          const path = `M${startX} 100C${startX} 100 ${midX1} 75 ${midX1} 50C${midX1} 50 ${midX2} 25 ${midX2} 12C${midX2} 12 ${endX} 5 ${endX} 0`;
          pathList.push(path);
          const altPath = `M${startX} 100C${startX} 100 ${startX + 5} 80 ${midX1} 60C${midX1} 60 ${midX2} 35 ${midX2} 15C${midX2} 15 ${endX} 3 ${endX} -2`;
          pathList.push(altPath);
        }
      }
      
      // Pre-calculate animation configs
      for (let i = 0; i < pathList.length; i++) {
        const animSeed = 54321 + i;
        animations.push({
          duration: 2 + seededRandom(animSeed) * 3,
          delay: seededRandom(animSeed + 1) * 4,
        });
      }
      
      // Pre-calculate gradient configs
      for (let i = 0; i < 20; i++) {
        const gradSeed = 99999 + i;
        gradients.push({
          duration: 3 + seededRandom(gradSeed) * 4,
          delay: seededRandom(gradSeed + 1) * 5,
        });
      }
      
      return { 
        paths: pathList, 
        animationConfigs: animations,
        gradientConfigs: gradients 
      };
    }, []);

    return (
      <div
        className={cn(
          "absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden",
          className,
        )}
      >
        <svg
          className="pointer-events-none absolute z-0 h-full w-full"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <rect width="100%" height="100%" fill="url(#backgroundGradient)" opacity="0.1" />
          
          <g opacity="0.4">
            {paths.map((path, index) => (
              <path
                key={`static-path-${index}`}
                d={path}
                stroke="url(#staticGradient)"
                strokeOpacity="0"
                strokeWidth="0.25"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>

          {paths.map((path, index) => {
            const config = animationConfigs[index];
            
            return (
              <motion.path
                key={`path-${index}`}
                d={path}
                stroke={`url(#flowingGradient-${index % 20})`}
                strokeOpacity="1"
                strokeWidth="0.5"
                fill="none"
                vectorEffect="non-scaling-stroke"
                initial={{ 
                  pathLength: 0,
                  pathOffset: 0 
                }}
                animate={{ 
                  pathLength: [0, 0.8, 0],
                  pathOffset: [0, 1]
                }}
                transition={{
                  duration: config.duration,
                  ease: "linear",
                  repeat: Infinity,
                  repeatDelay: config.delay,
                  times: [0, 0.5, 1]
                }}
              />
            );
          })}

          <defs>
            <radialGradient
              id="backgroundGradient"
              cx="50%"
              cy="80%"
              r="60%"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
            </radialGradient>

            <linearGradient
              id="staticGradient"
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor="#6366F1" stopOpacity="1" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.6" />
            </linearGradient>

            {Array.from({ length: 20 }).map((_, index) => {
              const config = gradientConfigs[index];
              
              return (
                <motion.linearGradient
                  key={`flowingGradient-${index}`}
                  id={`flowingGradient-${index}`}
                  x1="0%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                  gradientUnits="objectBoundingBox"
                  initial={{
                    y1: "100%",
                    y2: "90%",
                  }}
                  animate={{
                    y1: ["100%", "0%"],
                    y2: ["90%", "-10%"],
                  }}
                  transition={{
                    duration: config.duration,
                    ease: "linear",
                    repeat: Infinity,
                    delay: config.delay,
                  }}
                >
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0" />
                  <stop offset="30%" stopColor="#3B82F6" stopOpacity="1" />
                  <stop offset="60%" stopColor="#8B5CF6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0.2" />
                </motion.linearGradient>
              );
            })}

            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
    );
  },
);

BeamsUpstream.displayName = "BeamsUpstream";