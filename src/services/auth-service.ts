import { createClient } from "@/utils/supabase/client";
import { User, Session } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

class AuthService {
  private supabase = createClient();

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return { user: null, error: message };
    }
  }

  async signUp({ email, password, fullName }: SignUpData): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return { user: null, error: message };
    }
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return { data: null, error: message };
    }
  }

  async signInWithGitHub() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return { data: null, error: message };
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      return { error: null };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return { error: message };
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();
      if (error) throw error;

      return { user, error: null };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return { user: null, error: message };
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;

      return { error: null };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return { error: message };
    }
  }

  async updatePassword(password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return { user: null, error: message };
    }
  }

  async updateUser(updates: { email?: string; data?: Record<string, unknown> }): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.updateUser(updates);
      
      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return { user: null, error: message };
    }
  }

  async getUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  async refreshSession() {
    const { data, error } = await this.supabase.auth.refreshSession();
    return { data, error };
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // Helper method to check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return !!user;
  }

  // Helper method to get user ID
  async getUserId(): Promise<string | null> {
    const user = await this.getUser();
    return user?.id || null;
  }

  // Helper method to verify email
  async verifyOtp(email: string, token: string, type: 'signup' | 'recovery' = 'signup') {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
    
    return { data, error };
  }

  // Helper method to resend confirmation email
  async resendConfirmation(email: string) {
    const { error } = await this.supabase.auth.resend({
      type: 'signup',
      email,
    });
    
    return { error };
  }
}

export const authService = new AuthService();
