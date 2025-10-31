"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    initialize();
    
    // Also check auth immediately
    checkAuth();
  }, [initialize, checkAuth]);

  return <>{children}</>;
}
