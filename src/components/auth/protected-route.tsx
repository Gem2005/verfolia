"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAuthStore,
  useIsAuthenticated,
  useAuthLoading,
  useAuthInitialized,
} from "@/stores/auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = "/login",
  loadingComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const isInitialized = useAuthInitialized();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    if (!isInitialized) return;

    const handleAuth = async () => {
      if (requireAuth && !isAuthenticated) {
        // Double-check auth status before redirecting
        const user = await checkAuth();
        if (!user) {
          router.push(redirectTo);
        }
      }
    };

    handleAuth();
  }, [
    isAuthenticated,
    isInitialized,
    requireAuth,
    redirectTo,
    router,
    checkAuth,
  ]);

  // Show loading while initializing or checking auth
  if (!isInitialized || isLoading) {
    return (
      loadingComponent || (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg animate-pulse"></div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Verfolia
              </span>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
            <p className="text-muted-foreground text-sm">
              Preparing your workspace...
            </p>
          </div>
        </div>
      )
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
