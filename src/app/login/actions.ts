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
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const confirmPassword = formData.get("confirmPassword") as string;

  // Basic validation for password confirmation
  if (data.password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  // Basic password validation
  if (data.password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/confirm`,
    },
  });

  if (error) {
    console.error("Signup error:", error.message);
    return { error: error.message };
  }

  // Return success instead of redirecting immediately
  // User needs to confirm email before being redirected
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
    }/auth/callback?next=/dashboard`,
  });

  if (error) {
    console.error("Password reset error:", error.message);
    return { error: error.message };
  }

  return { success: true };
}
