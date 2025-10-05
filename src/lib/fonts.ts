import { Plus_Jakarta_Sans, Lora, Roboto_Mono } from "next/font/google";

/**
 * Google Fonts configuration using Next.js optimization
 * Reduced weight variants for faster loading
 */
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Reduced from 7 to 4 weights
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

export const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // Reduced from 4 to 3 weights
  variable: "--font-serif",
  display: "swap",
  preload: false, // Lazy load serif font
});

export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"], // Reduced from 5 to 3 weights
  variable: "--font-mono",
  display: "swap",
  preload: false, // Lazy load mono font
});

/**
 * Font utility classes for consistent typography across the application
 *
 * Hierarchy:
 * - font-serif: Used for main headings, logo, and key display text (Lora)
 * - font-sans: Used for body text, UI elements, navigation, and general content (Plus Jakarta Sans)
 * - font-mono: Used for code, numbers, data display, and technical content (Roboto Mono)
 */

export const fontClasses = {
  // Primary fonts
  serif: "font-serif", // Main headings, logo, elegant display text
  sans: "font-sans", // Body text, UI elements, navigation (DEFAULT)
  mono: "font-mono", // Code, numbers, data, technical content

  // Semantic classes for specific use cases
  heading: "font-serif", // All headings (h1, h2, h3, etc.)
  body: "font-sans", // Body text and paragraphs
  ui: "font-sans", // UI elements (buttons, labels, etc.)
  data: "font-mono", // Numbers, statistics, metrics
  code: "font-mono", // Code blocks, technical text
  logo: "font-serif", // Branding and logo text
  navigation: "font-sans", // Navigation links and menus
} as const;

/**
 * Helper function to get font class by semantic usage
 */
export const getFont = (usage: keyof typeof fontClasses) => fontClasses[usage];

/**
 * Commonly used font combinations
 */
export const fontCombinations = {
  cardTitle: "font-serif font-semibold",
  cardDescription: "font-sans text-muted-foreground",
  stat: "font-mono font-bold",
  button: "font-sans font-medium",
  heading1: "font-serif font-bold",
  heading2: "font-serif font-semibold",
  heading3: "font-serif font-medium",
  body: "font-sans",
  caption: "font-sans text-sm text-muted-foreground",
} as const;

export default fontClasses;
