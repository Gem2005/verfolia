import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedBackground } from "@/components/layout/animated-background";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl shadow-2xl border border-border/20 relative z-20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">Authentication Error</CardTitle>
          <CardDescription className="text-gray-600">
            There was a problem with the authentication process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            The authentication code could not be processed. This might happen if:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>The authentication link has expired</li>
            <li>The link was already used</li>
            <li>There was a network error</li>
          </ul>
          <div className="flex flex-col space-y-2 pt-4">
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Try Again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Return Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
