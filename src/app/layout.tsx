import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { plusJakartaSans, lora, robotoMono } from "@/lib/fonts";
import { ConsoleWelcome } from "@/components/console-welcome";

export const metadata: Metadata = {
  metadataBase: new URL('https://verfolia.com'),
  title: {
    default: 'Verfolia - Transform Your Resume into a Professional Portfolio with AI',
    template: '%s | Verfolia'
  },
  description: 'Convert your resume to a stunning professional portfolio in seconds with AI-powered parsing. Track resume views, analyze engagement, and showcase your career with beautiful templates. Free resume builder with advanced analytics.',
  keywords: [
    'resume to portfolio',
    'resume builder',
    'AI resume parser',
    'professional portfolio',
    'resume analytics',
    'portfolio builder',
    'online resume',
    'digital resume',
    'CV to portfolio',
    'career portfolio',
    'resume tracking',
    'portfolio website builder',
    'verfolia',
    'free resume builder',
    'resume converter',
    'AI portfolio generator'
  ],
  authors: [{ name: 'Verfolia Team' }],
  creator: 'Verfolia',
  publisher: 'Verfolia',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://verfolia.com',
    title: 'Verfolia - Transform Your Resume into a Professional Portfolio',
    description: 'Convert your resume to a stunning professional portfolio in seconds with AI. Track views, analyze engagement, and showcase your career with beautiful templates.',
    siteName: 'Verfolia',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Verfolia - Resume to Portfolio Converter',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verfolia - Transform Your Resume into a Professional Portfolio',
    description: 'Convert your resume to a stunning portfolio in seconds with AI-powered parsing and advanced analytics.',
    images: ['/twitter-image.png'],
    creator: '@verfolia',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: 'https://verfolia.com',
  },
  category: 'technology',
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
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
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
