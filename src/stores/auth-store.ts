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
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),

  initialize: async () => {
    try {
      set({ isLoading: true });

      const supabase = createClient();
      
      // Check if we have a valid supabase client
      if (!supabase || !supabase.auth) {
        console.warn("Supabase client not available, skipping auth initialization");
        set({ user: null, isInitialized: true, isLoading: false });
        return;
      }

      // Get initial session
      const {
        data: { user },
      } = await supabase.auth.getUser();
      set({ user, isInitialized: true });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event: any, session: any) => {
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
    try {
      const supabase = createClient();
      
      if (!supabase || !supabase.auth) {
        console.warn("Supabase client not available for auth check");
        return null;
      }
      
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
    try {
      const supabase = createClient();
      
      if (!supabase || !supabase.auth) {
        console.warn("Supabase client not available for sign out");
        set({ user: null });
        return;
      }
      
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
