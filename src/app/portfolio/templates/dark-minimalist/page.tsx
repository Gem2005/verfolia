"use client";

import React from "react";
import { DarkMinimalistTemplate } from "@/components/templates";

export default function DarkMinimalistPreviewPage() {
  return (
    <div className="w-full min-h-screen">
      <DarkMinimalistTemplate preview={true} data={{} as any} />
    </div>
  );
}
