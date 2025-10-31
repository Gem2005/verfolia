import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { plusJakartaSans, lora, robotoMono } from "@/lib/fonts";
import { ConsoleWelcome } from "@/components/console-welcome";

export const metadata: Metadata = {
  title: "Verfolia",
  description: "Your Digital Professional Identity Platform",
  metadataBase: new URL('https://verfolia.com'),
  // Add performance hints
  other: {
    'format-detection': 'telephone=no',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${lora.variable} ${robotoMono.variable}`}
    >
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* DNS prefetch for Supabase */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} />
      </head>
      <body className="font-sans antialiased">
        <ConsoleWelcome />
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
