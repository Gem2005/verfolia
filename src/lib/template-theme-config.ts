// Standardized theme configuration for all resume templates
// Ensures consistent color patterns and visibility across all themes

export interface ThemeClasses {
  bg: string;
  text: string;
  accent: string;
  mutedText: string;
  border: string;
  cardBg: string;
  cardBorder: string;
  sectionBorder: string;
  buttonBg: string;
  buttonHover: string;
  badgeHover: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export function getStandardThemeClasses(theme: string = "black"): ThemeClasses {
  switch (theme) {
    case "dark-gray":
      return {
        bg: "bg-gray-900",
        text: "text-white",
        accent: "text-blue-400",
        mutedText: "text-gray-400",
        border: "border-gray-700",
        cardBg: "bg-gray-800",
        cardBorder: "border-gray-700",
        sectionBorder: "border-gray-700",
        buttonBg: "bg-blue-500",
        buttonHover: "hover:bg-blue-600",
        badgeHover: "hover:bg-blue-600",
        badgeBg: "bg-gray-800",
        badgeText: "text-gray-300",
        badgeBorder: "border-gray-700",
      };
    case "navy-blue":
      return {
        bg: "bg-slate-900",
        text: "text-white",
        accent: "text-cyan-400",
        mutedText: "text-slate-400",
        border: "border-blue-700",
        cardBg: "bg-blue-900",
        cardBorder: "border-blue-700",
        sectionBorder: "border-blue-700",
        buttonBg: "bg-cyan-500",
        buttonHover: "hover:bg-cyan-600",
        badgeHover: "hover:bg-cyan-600",
        badgeBg: "bg-blue-800",
        badgeText: "text-cyan-200",
        badgeBorder: "border-blue-700",
      };
    case "professional":
      return {
        bg: "bg-slate-800",
        text: "text-white",
        accent: "text-emerald-400",
        mutedText: "text-slate-400",
        border: "border-slate-700",
        cardBg: "bg-slate-700",
        cardBorder: "border-slate-700",
        sectionBorder: "border-slate-700",
        buttonBg: "bg-emerald-500",
        buttonHover: "hover:bg-emerald-600",
        badgeHover: "hover:bg-emerald-600",
        badgeBg: "bg-slate-700",
        badgeText: "text-emerald-200",
        badgeBorder: "border-slate-600",
      };
    case "black":
      return {
        bg: "bg-black",
        text: "text-white",
        accent: "text-gray-400",
        mutedText: "text-gray-500",
        border: "border-gray-800",
        cardBg: "bg-gray-900",
        cardBorder: "border-gray-800",
        sectionBorder: "border-gray-800",
        buttonBg: "bg-gray-700",
        buttonHover: "hover:bg-gray-600",
        badgeHover: "hover:bg-gray-700",
        badgeBg: "bg-gray-800",
        badgeText: "text-gray-300",
        badgeBorder: "border-gray-700",
      };
    case "white":
      return {
        bg: "bg-white",
        text: "text-gray-900",
        accent: "text-blue-600",
        mutedText: "text-gray-600",
        border: "border-gray-300",
        cardBg: "bg-gray-50",
        cardBorder: "border-gray-300",
        sectionBorder: "border-gray-300",
        buttonBg: "bg-blue-600",
        buttonHover: "hover:bg-blue-700",
        badgeHover: "hover:bg-blue-700",
        badgeBg: "bg-gray-100",
        badgeText: "text-gray-700",
        badgeBorder: "border-gray-200",
      };
    default: // Default to black theme
      return {
        bg: "bg-black",
        text: "text-white",
        accent: "text-gray-400",
        mutedText: "text-gray-500",
        border: "border-gray-800",
        cardBg: "bg-gray-900",
        cardBorder: "border-gray-800",
        sectionBorder: "border-gray-800",
        buttonBg: "bg-gray-700",
        buttonHover: "hover:bg-gray-600",
        badgeHover: "hover:bg-gray-700",
        badgeBg: "bg-gray-800",
        badgeText: "text-gray-300",
        badgeBorder: "border-gray-700",
      };
  }
}
