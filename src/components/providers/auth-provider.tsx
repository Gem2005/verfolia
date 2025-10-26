"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    console.log("AuthProvider initializing...");
    initialize();
    
    // Also check auth immediately
    checkAuth().then(user => {
      console.log("Initial auth check:", user ? "User found" : "No user");
    });
  }, [initialize, checkAuth]);

  return <>{children}</>;
}
