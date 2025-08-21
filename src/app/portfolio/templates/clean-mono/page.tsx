"use client";

import React from "react";
import { CleanMonoTemplate } from "@/components/templates";

export default function CleanMonoPreviewPage() {
  return (
    <div className="w-full min-h-screen">
      <CleanMonoTemplate preview={true} data={{} as any} />
    </div>
  );
}
