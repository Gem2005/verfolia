"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import GoogleMarkdownEditor from "@/components/google-markdown-editor";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <SessionProvider>
      <GoogleMarkdownEditor />
    </SessionProvider>
  );
}
