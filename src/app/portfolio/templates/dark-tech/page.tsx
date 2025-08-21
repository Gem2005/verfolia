"use client";

import React from "react";
import { DarkTechTemplate } from "@/components/templates";

export default function DarkTechPreviewPage() {
  return (
    <div className="w-full min-h-screen">
      <DarkTechTemplate preview={true} data={{} as any} />
    </div>
  );
}
