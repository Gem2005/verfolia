import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <h1 className="text-4xl font-bold">404 - Analytics Not Found</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        The analytics page you&apos;re looking for doesn&apos;t exist or has
        been moved.
      </p>
      <Button asChild variant="default">
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
