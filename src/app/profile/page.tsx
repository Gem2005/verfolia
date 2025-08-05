"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.replace("/dashboard");
  }, [router]);

  // Return null or a loading spinner while redirecting
  return null;
}
