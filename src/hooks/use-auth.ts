import {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthInitialized,
} from "@/stores/auth-store";

export function useAuth() {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const loading = useAuthLoading();
  const isInitialized = useAuthInitialized();
  const signOut = useAuthStore((state) => state.signOut);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  return {
    user,
    isAuthenticated,
    loading,
    isInitialized,
    signOut,
    checkAuth,
  };
}
