export const formatCountry = (country: string) => {
  if (!country || country === "Unknown") return "Unknown";
  if (country.length > 18) return country.slice(0, 15) + "...";
  return country;
};

export const formatReferrer = (referrer: string) => {
  if (!referrer || referrer === "Unknown") return "Direct";
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 24) + (referrer.length > 24 ? "..." : "");
  }
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export const formatDate = (dateString: string, is24Hours: boolean = false): string => {
  const date = new Date(dateString);
  
  if (is24Hours) {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
