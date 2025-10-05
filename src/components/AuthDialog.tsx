"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { login, signup, signInWithGoogle } from "@/app/login/actions";

// Google Icon SVG
const GoogleIcon = () => (
  <svg
    className="mr-2 h-4 w-4"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 488 512"
  >
    <path
      fill="currentColor"
      d="M488 261.8C488 403.3 381.5 504 248 504 110.8 
      504 0 393.2 0 256S110.8 8 248 8c66.8 
      0 126 21.2 173.4 54.7l-76.3 
      64.9C308.6 92.6 279.1 80 248 
      80c-81.6 0-148.2 65.7-148.2 
      147.3S166.4 374.6 248 374.6c88.9 
      0 125.7-58.6 133.7-89.4H248v-61.5h239.2c4.7 
      22.3 7.8 46.5 7.8 71.2z"
    ></path>
  </svg>
);

const AuthDialog = ({
  buttonText = "Get Started",
  buttonSize = "default",
}: {
  buttonText?: string;
  buttonSize?: "default" | "sm" | "lg" | "icon" | null | undefined;
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccessMessage(null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccessMessage(
        "Success! Please check your email to confirm your account."
      );
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    await signInWithGoogle();
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={buttonSize}
          className={buttonSize === "lg" ? "px-8 py-4 text-lg" : ""}
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="card-enhanced max-w-md p-8">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold verfolia-text-gradient">
            Welcome to Verfolia
          </DialogTitle>
          <DialogDescription className="text-center">
            Access your account or create a new one to get started.
          </DialogDescription>
        </DialogHeader>

        {/* Google Button */}
        <div className="space-y-4 pt-4">
          <Button
            variant="outline"
            className="button-enhanced w-full"
            onClick={handleGoogleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">OR</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Sign In */}
          <TabsContent value="signin">
            <Card className="border-none shadow-none">
              <CardContent className="pt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="m@example.com"
                      className="input-enhanced"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      className="input-enhanced"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="button-enhanced w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sign Up */}
          <TabsContent value="signup">
            <Card className="border-none shadow-none">
              <CardContent className="pt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="m@example.com"
                      className="input-enhanced"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="input-enhanced"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      className="input-enhanced"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="button-enhanced w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}
        {successMessage && (
          <p className="text-center text-sm text-green-600">{successMessage}</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
