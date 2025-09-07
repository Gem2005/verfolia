"use client";

import { useEffect } from "react";

export function GlassmorphismInjector() {
  useEffect(() => {
    // Force glassmorphism styles
    const style = document.createElement('style');
    style.textContent = `
      * {
        background: transparent !important;
        color: white !important;
      }
      
      html, body {
        background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%) !important;
        min-height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .card, [class*="card"] {
        background: rgba(255, 255, 255, 0.15) !important;
        backdrop-filter: blur(30px) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        color: white !important;
      }
      
      button, .btn, [class*="button"] {
        background: rgba(255, 255, 255, 0.2) !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        color: white !important;
      }
      
      button:hover, .btn:hover {
        background: rgba(255, 255, 255, 0.3) !important;
      }
      
      input, textarea, select {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        color: white !important;
        backdrop-filter: blur(10px) !important;
      }
      
      nav, header, .navbar {
        background: rgba(255, 255, 255, 0.1) !important;
        backdrop-filter: blur(20px) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}
