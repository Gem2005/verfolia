import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { plusJakartaSans, lora, robotoMono } from "@/lib/fonts";
import { GlassmorphismInjector } from "@/components/glassmorphism-injector";

export const metadata: Metadata = {
  title: "Verfolia",
  description: "Your Digital Professional Identity Platform",
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
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)',
        minHeight: '100vh'
      }}
    >
      <body 
        className="font-sans antialiased"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)',
          minHeight: '100vh',
          color: 'white',
          margin: 0,
          padding: 0
        }}
      >
        <AuthProvider>
          <GlassmorphismInjector />
          <div style={{ background: 'transparent' }}>
            {children}
            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
