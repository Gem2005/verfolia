"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("Login error:", error.message);
    
    // Provide helpful error messages based on Supabase Auth errors
    if (error.message.includes("Invalid login credentials")) {
      // Try to determine if it's email not found or wrong password
      // We can't directly check without exposing security info, so provide generic helpful message
      return { 
        error: "Invalid email or password. Please check your credentials or sign up if you don't have an account.",
      };
    }
    
    if (error.message.includes("Email not confirmed")) {
      return { error: "Please confirm your email address before signing in. Check your inbox for the confirmation link." };
    }
    
    return { error: error.message };
  }

  // Revalidate the entire app to update auth state
  revalidatePath("/", "layout");
  revalidatePath("/dashboard", "page");
  
  // Return success so client can handle redirect
  // This ensures cookies are set before navigation
  return { success: true };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const confirmPassword = formData.get("confirmPassword") as string;
  const fullName = formData.get("fullName") as string;

  console.log("Signup attempt for:", data.email);

  // Validation
  if (data.password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (data.password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  if (!fullName || fullName.trim().length < 2) {
    return { error: "Please enter a valid full name" };
  }

  // Sign up with user metadata
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback`,
      data: {
        full_name: fullName.trim(),
      },
    },
  });

  if (error) {
    console.error("Signup error:", error.message);
    
    // Check if user already exists
    if (error.message.includes("User already registered") || 
        error.message.includes("already registered") ||
        error.message.includes("already been registered")) {
      return { 
        error: "This email is already registered. Please sign in or use 'Forgot password'.",
        emailExists: true 
      };
    }
    
    return { error: error.message };
  }

  console.log("Signup successful:", signUpData);

  // Supabase may return a user even if they already exist (with email confirmation disabled)
  // Check if this is an existing user by looking at identities
  if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
    console.log("User already exists:", data.email);
    return { 
      error: "This email is already registered. Please sign in or use 'Forgot password'.",
      emailExists: true 
    };
  }

  // Check if email confirmation is required
  if (signUpData.user && !signUpData.session) {
    console.log("Email confirmation required for:", data.email);
    return { 
      success: true, 
      confirmationRequired: true,
      message: "Please check your email to confirm your account before signing in." 
    };
  }

  return { success: true };
}

export async function signInWithGoogle(next?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
    },
  });

  if (error) {
    console.error("Google OAuth error:", error.message);
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    }/auth/callback?type=recovery`,
  });

  if (error) {
    console.error("Password reset error:", error.message);
    return { error: error.message };
  }

  return { success: true };
}

export async function sendMagicLink(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    console.error("Magic link error:", error.message);
    return { error: error.message };
  }

  return { success: true };
}

export async function resendConfirmation(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    console.error("Resend confirmation error:", error.message);
    return { error: error.message };
  }

  return { success: true };
}
