import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),

  initialize: async () => {
    const supabase = createClient();

    try {
      set({ isLoading: true });

      // Get initial session
      const {
        data: { user },
      } = await supabase.auth.getUser();
      set({ user, isInitialized: true });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        set({ user: session?.user ?? null });

        if (event === "SIGNED_OUT") {
          // Clear any cached data here if needed
          set({ user: null });
        }
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ user: null, isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      set({ user });
      return user;
    } catch (error) {
      console.error("Error checking auth:", error);
      set({ user: null });
      return null;
    }
  },

  signOut: async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      set({ user: null });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  },
}));

// Helper hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthInitialized = () =>
  useAuthStore((state) => state.isInitialized);
