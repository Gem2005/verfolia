"use client";

import React from "react";
import { ModernAIFocusedTemplate } from "@/components/templates";

export default function ModernAIFocusedPreviewPage() {
  return (
    <div className="w-full min-h-screen">
      <ModernAIFocusedTemplate preview={true} data={{} as any} />
    </div>
  );
}
