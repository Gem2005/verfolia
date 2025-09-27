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
import { Loader2 } from "lucide-react";
import { login, signup, signInWithGoogle } from "./actions";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout"; // Import AppLayout

// SVG for Google Icon
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.4 54.7l-76.3 64.9C308.6 92.6 279.1 80 248 80c-81.6 0-148.2 65.7-148.2 147.3S166.4 374.6 248 374.6c88.9 0 125.7-58.6 133.7-89.4H248v-61.5h239.2c4.7 22.3 7.8 46.5 7.8 71.2z"></path>
  </svg>
);

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Route to saved choice if present; else to /choice
      let option: string | null = null;
      try { option = localStorage.getItem('selectedOption'); } catch {}
      if (option === 'upload') {
        router.push('/upload');
      } else if (option === 'create') {
        router.push('/create');
      } else {
        router.push('/choice');
      }
      // Clear after routing so it's one-time only
      try { localStorage.removeItem('selectedOption'); } catch {}
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
    setMessage(null);
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    const result = await login(formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);
    const result = await signup(formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Success! Please check your email to confirm your account." });
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    // After OAuth, we’ll read the stored selection and route accordingly
    await signInWithGoogle('/choice');
    setIsLoading(false);
  }

  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen glass-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-glass-blue" />
      </div>
    );
  }

  return (
    <AppLayout showFooter={false}>
        <div className="min-h-screen glass-bg flex items-center justify-center p-4 pt-24">
            <div className="w-full max-w-md space-y-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold gradient-text">Welcome to Verfolia</h1>
                    <p className="text-glass-gray text-sm">
                        Access your account or create a new one to get started.
                    </p>
                </div>
                
                {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                    <AlertDescription>{message.text}</AlertDescription>
                </Alert>
                )}

                <div className="space-y-4">
                    <Button variant="outline" className="glass-button w-full" onClick={handleGoogleAuth} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                        Continue with Google
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-glass-border" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="glass-bg px-2 text-glass-gray">OR</span></div>
                    </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="glass-card grid w-full grid-cols-2">
                    <TabsTrigger value="signin" className="text-glass-white">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="text-glass-white">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                    <Card className="glass-card border-none shadow-none">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signin-email" className="text-glass-white">Email</Label>
                                <Input id="signin-email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="glass-input" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signin-password" className="text-glass-white">Password</Label>
                                <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="glass-input" />
                            </div>
                            <Button type="submit" className="glass-button w-full" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Sign In</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="signup">
                    <Card className="glass-card border-none shadow-none">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="signup-email" className="text-glass-white">Email</Label>
                            <Input id="signup-email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="glass-input" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="signup-password" className="text-glass-white">Password</Label>
                            <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="glass-input" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-glass-white">Confirm Password</Label>
                            <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="glass-input" />
                        </div>
                        <Button type="submit" className="glass-button w-full" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Account</Button>
                        </form>
                    </CardContent>
                    </Card>
                </TabsContent>
                </Tabs>
            </div>
        </div>
    </AppLayout>
  );
}
