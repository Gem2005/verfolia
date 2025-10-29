"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { signup, signInWithGoogle, resetPassword, sendMagicLink, resendConfirmation } from "./actions";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import { AnimatedBackground } from "@/components/layout/animated-background";
import { storageHelpers } from "@/utils/storage";
import { createClient } from "@/utils/supabase/client";

// SVG for Google Icon
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.4 54.7l-76.3 64.9C308.6 92.6 279.1 80 248 80c-81.6 0-148.2 65.7-148.2 147.3S166.4 374.6 248 374.6c88.9 0 125.7-58.6 133.7-89.4H248v-61.5h239.2c4.7 22.3 7.8 46.5 7.8 71.2z"></path>
  </svg>
);

export default function LoginPage() {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Check for returnTo parameter first
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get('returnTo');
      
      if (returnTo) {
        console.log('Redirecting to returnTo:', returnTo);
        router.push(returnTo);
        return;
      }
      
      // Fallback to saved choice if no returnTo
      const option = storageHelpers.getSelectedOption();
      if (option === 'upload') {
        router.push('/upload-resume');
      } else if (option === 'create') {
        router.push('/create-resume');
      } else {
        router.push('/dashboard'); // Change from /choice to /dashboard
      }
      // Clear after routing so it's one-time only
      storageHelpers.clearSelectedOption();
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as "signin" | "signup");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setMessage(null);
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        
        // Provide helpful error messages
        if (error.message.includes("Invalid login credentials")) {
          setMessage({ 
            type: "error", 
            text: "Invalid email or password. Please check your credentials or sign up if you don't have an account." 
          });
        } else if (error.message.includes("Email not confirmed")) {
          setMessage({ 
            type: "error", 
            text: "Please confirm your email address before signing in. Check your inbox for the confirmation link." 
          });
        } else {
          setMessage({ type: "error", text: error.message });
        }
        setIsLoading(false);
      } else {
        // Login successful - use router for smooth navigation
        const params = new URLSearchParams(window.location.search);
        const returnTo = params.get('returnTo') || '/dashboard';
        
        // Force auth state to update immediately
        await checkAuth();
        
        // Use Next.js router for client-side navigation (no page refresh)
        router.push(returnTo);
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." });
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!fullName.trim()) {
      setMessage({ type: "error", text: "Please enter your full name." });
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);
    formData.append("fullName", fullName);
    
    console.log("Submitting signup form...");
    const result = await signup(formData);
    console.log("Signup result:", result);
    
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
      // If email exists, switch to sign-in tab after showing message
      if (result.emailExists) {
        setTimeout(() => {
          setActiveTab("signin");
          setPassword("");
          setConfirmPassword("");
          setFullName("");
        }, 2500);
      }
    } else if (result?.success) {
      setMessage({ type: "success", text: "Success! Please check your email to confirm your account." });
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
    } else {
      console.error("Unexpected signup response:", result);
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." });
    }
    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    // Get returnTo parameter and pass it to Google OAuth
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get('returnTo');
    
    console.log('Google OAuth with returnTo:', returnTo);
    await signInWithGoogle(returnTo || '/dashboard');
    setIsLoading(false);
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("email", email);
    
    const result = await resetPassword(formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Password reset link sent! Please check your email." });
      setShowForgotPassword(false);
      setEmail("");
    }
    setIsLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("email", email);
    
    const result = await sendMagicLink(formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Magic link sent! Please check your email." });
      setShowMagicLink(false);
      setEmail("");
    }
    setIsLoading(false);
  };

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("email", email);
    
    const result = await resendConfirmation(formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Confirmation email resent! Please check your inbox." });
      setShowResendConfirmation(false);
      setEmail("");
    }
    setIsLoading(false);
  };

  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout showFooter={false}>
        <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-24 relative overflow-hidden">
            <AnimatedBackground />
            <div className="w-full max-w-md space-y-6 relative z-20">
                {/* Header Section */}
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Welcome to Verfolia
                    </h1>
                    <p className="text-muted-foreground">
                        Access your account or create a new one to get started.
                    </p>
                </div>
                
                {/* Alert Messages */}
                {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"} className="animate-fade-in">
                    <AlertDescription>{message.text}</AlertDescription>
                </Alert>
                )}

                {/* Google Sign In Section */}
                <div className="space-y-4">
                    <Button 
                        variant="outline" 
                        className="w-full h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02]" 
                        onClick={handleGoogleAuth} 
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon />}
                        Continue with Google
                    </Button>
                    
                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-4 py-1 text-muted-foreground font-medium rounded-full border border-border">
                                OR
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Auth Tabs */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="card-enhanced grid w-full grid-cols-2 h-12 p-1 bg-muted/50 border border-border">
                    <TabsTrigger 
                      value="signin" 
                      className="text-foreground font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:border data-[state=active]:border-primary data-[state=active]:shadow-sm"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup" 
                      className="text-foreground font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 data-[state=active]:border data-[state=active]:border-primary data-[state=active]:shadow-sm"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                
                    {/* Sign In Form */}
                    <TabsContent value="signin" className="mt-6">
                        <Card className="card-enhanced border border-border shadow-lg">
                            <CardContent className="pt-6 space-y-4">
                                <form onSubmit={handleSignIn} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signin-email" className="text-foreground font-medium">
                                            Email Address
                                        </Label>
                                        <Input 
                                            id="signin-email" 
                                            type="email" 
                                            placeholder="Enter your email" 
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)} 
                                            required 
                                            className="input-enhanced h-12 border-border" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signin-password" className="text-foreground font-medium">
                                            Password
                                        </Label>
                                        <Input 
                                            id="signin-password" 
                                            type="password" 
                                            placeholder="Enter your password"
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            required 
                                            className="input-enhanced h-12 border-border" 
                                        />
                                        <div className="flex justify-between items-center text-sm mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowForgotPassword(true)}
                                                className="text-primary hover:underline"
                                            >
                                                Forgot password?
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowMagicLink(true)}
                                                className="text-primary hover:underline"
                                            >
                                                Use magic link
                                            </button>
                                        </div>
                                    </div>
                                    <Button 
                                        type="submit" 
                                        className="button-enhanced w-full h-12 text-base font-medium mt-6 bg-primary hover:bg-primary/90 text-primary-foreground" 
                                        disabled={isLoading}
                                    >
                                        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                        Sign In
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                
                    {/* Sign Up Form */}
                    <TabsContent value="signup" className="mt-6">
                        <Card className="card-enhanced border border-border shadow-lg">
                            <CardContent className="pt-6 space-y-4">
                                <form onSubmit={handleSignUp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-fullname" className="text-foreground font-medium">
                                            Full Name
                                        </Label>
                                        <Input 
                                            id="signup-fullname" 
                                            type="text" 
                                            placeholder="Enter your full name" 
                                            value={fullName} 
                                            onChange={(e) => setFullName(e.target.value)} 
                                            required 
                                            className="input-enhanced h-12 border-border" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email" className="text-foreground font-medium">
                                            Email Address
                                        </Label>
                                        <Input 
                                            id="signup-email" 
                                            type="email" 
                                            placeholder="Enter your email" 
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)} 
                                            required 
                                            className="input-enhanced h-12 border-border" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password" className="text-foreground font-medium">
                                            Password
                                        </Label>
                                        <Input 
                                            id="signup-password" 
                                            type="password" 
                                            placeholder="Create a password" 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            required 
                                            className="input-enhanced h-12 border-border" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password" className="text-foreground font-medium">
                                            Confirm Password
                                        </Label>
                                        <Input 
                                            id="confirm-password" 
                                            type="password" 
                                            placeholder="Confirm your password" 
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)} 
                                            required 
                                            className="input-enhanced h-12 border-border" 
                                        />
                                    </div>
                                    <Button 
                                        type="submit" 
                                        className="button-enhanced w-full h-12 text-base font-medium mt-6 bg-primary hover:bg-primary/90 text-primary-foreground" 
                                        disabled={isLoading}
                                    >
                                        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                        Create Account
                                    </Button>
                                    <div className="text-center text-sm mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowResendConfirmation(true)}
                                            className="text-primary hover:underline"
                                        >
                                            Resend confirmation email
                                        </button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                
                {/* Footer */}
                <div className="text-center text-sm text-muted-foreground mt-6">
                    <p>
                        By continuing, you agree to our{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>

            {/* Forgot Password Modal */}
            <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="forgot-email">Email Address</Label>
                            <Input
                                id="forgot-email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowForgotPassword(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Magic Link Modal */}
            <Dialog open={showMagicLink} onOpenChange={setShowMagicLink}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Sign in with Magic Link</DialogTitle>
                        <DialogDescription>
                            Enter your email address and we&apos;ll send you a magic link to sign in without a password.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMagicLink} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="magic-email">Email Address</Label>
                            <Input
                                id="magic-email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowMagicLink(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Magic Link
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Resend Confirmation Modal */}
            <Dialog open={showResendConfirmation} onOpenChange={setShowResendConfirmation}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Resend Confirmation Email</DialogTitle>
                        <DialogDescription>
                            Enter your email address and we&apos;ll resend the confirmation email.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResendConfirmation} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="resend-email">Email Address</Label>
                            <Input
                                id="resend-email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowResendConfirmation(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Resend Email
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    </AppLayout>
  );
}
