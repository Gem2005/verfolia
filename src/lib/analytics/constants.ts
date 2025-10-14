export const TIMEFRAME_OPTIONS = [
  { value: "1", label: "Last 24 Hours" },
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
] as const;

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;

export const CHART_COLORS = {
  primary: "var(--chart-1)",
  secondary: "var(--chart-2)",
  tertiary: "var(--chart-3)",
  quaternary: "var(--chart-4)",
} as const;

export const COUNTRY_CODE_MAP: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "GB",
  India: "IN",
  Canada: "CA",
  Germany: "DE",
  France: "FR",
  Spain: "ES",
  Italy: "IT",
  Australia: "AU",
  Brazil: "BR",
  Japan: "JP",
  China: "CN",
  Netherlands: "NL",
  Sweden: "SE",
  Singapore: "SG",
  Mexico: "MX",
  Indonesia: "ID",
  Nigeria: "NG",
  Poland: "PL",
  Turkey: "TR",
  Unknown: "",
};
