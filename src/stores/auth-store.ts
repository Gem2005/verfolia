import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      set({ isLoading: true });

      const supabase = createClient();
      
      if (!supabase?.auth) {
        set({ user: null, isInitialized: true, isLoading: false });
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      set({ user, isInitialized: true });

      supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        set({ user: session?.user ?? null });
      });
    } catch {
      set({ user: null, isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      const supabase = createClient();
      
      if (!supabase?.auth) {
        return null;
      }
      
      const {
        data: { user },
      } = await supabase.auth.getUser();
      set({ user });
      return user;
    } catch {
      set({ user: null });
      return null;
    }
  },

  signOut: async () => {
    try {
      const supabase = createClient();
      
      if (!supabase?.auth) {
        set({ user: null });
        return;
      }
      
      await supabase.auth.signOut();
      set({ user: null });
      window.location.replace('/');
    } catch {
      set({ user: null });
      window.location.replace('/');
    }
  },
}));

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized);
