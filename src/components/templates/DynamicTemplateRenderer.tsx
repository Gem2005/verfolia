"use client";

import dynamic from "next/dynamic";
import type { PortfolioData } from "@/types/PortfolioTypes";

// Lazy load templates - only the one being used will be loaded
const CleanMonoTemplate = dynamic(
  () => import("@/components/templates/CleanMonoTemplate").then((mod) => ({ default: mod.CleanMonoTemplate })),
  { loading: () => <div className="flex items-center justify-center min-h-screen">Loading template...</div> }
);

const DarkMinimalistTemplate = dynamic(
  () => import("@/components/templates/DarkMinimalistTemplate").then((mod) => ({ default: mod.DarkMinimalistTemplate })),
  { loading: () => <div className="flex items-center justify-center min-h-screen">Loading template...</div> }
);

const DarkTechTemplate = dynamic(
  () => import("@/components/templates/DarkTechTemplate").then((mod) => ({ default: mod.DarkTechTemplate })),
  { loading: () => <div className="flex items-center justify-center min-h-screen">Loading template...</div> }
);

const ModernAIFocusedTemplate = dynamic(
  () => import("@/components/templates/ModernAIFocusedTemplate").then((mod) => ({ default: mod.ModernAIFocusedTemplate })),
  { loading: () => <div className="flex items-center justify-center min-h-screen">Loading template...</div> }
);

interface DynamicTemplateRendererProps {
  templateId: string;
  data: PortfolioData;
  theme?: string;
  resumeId?: string;
  preview?: boolean;
}

export function DynamicTemplateRenderer({ 
  templateId, 
  data, 
  theme, 
  resumeId,
  preview = false,
}: DynamicTemplateRendererProps) {
  const templateProps = {
    data,
    theme,
    resumeId,
    preview,
  };

  const content = (() => {
    switch (templateId) {
      case "dark-minimalist":
        return <DarkMinimalistTemplate {...templateProps} />;
      case "dark-tech":
        return <DarkTechTemplate {...templateProps} />;
      case "modern-ai-focused":
        return <ModernAIFocusedTemplate {...templateProps} />;
      case "clean-mono":
      default:
        return <CleanMonoTemplate {...templateProps} />;
    }
  })();

  return preview ? <div className="preview-sandbox">{content}</div> : content;
}
