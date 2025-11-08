import React from "react";

interface FlagProps {
  countryCode: string;
  className?: string;
}

// Map country names to ISO 3166-1-alpha-2 codes for flag-icons
const countryNameToCode: Record<string, string> = {
  "India": "in",
  "United States": "us",
  "United Kingdom": "gb",
  "Canada": "ca",
  "Australia": "au",
  "Germany": "de",
  "France": "fr",
  "Italy": "it",
  "Spain": "es",
  "Netherlands": "nl",
  "Belgium": "be",
  "Switzerland": "ch",
  "Austria": "at",
  "Sweden": "se",
  "Norway": "no",
  "Denmark": "dk",
  "Finland": "fi",
  "Poland": "pl",
  "Czech Republic": "cz",
  "Greece": "gr",
  "Portugal": "pt",
  "Ireland": "ie",
  "Japan": "jp",
  "South Korea": "kr",
  "China": "cn",
  "Singapore": "sg",
  "Hong Kong": "hk",
  "Taiwan": "tw",
  "Malaysia": "my",
  "Thailand": "th",
  "Indonesia": "id",
  "Philippines": "ph",
  "Vietnam": "vn",
  "Brazil": "br",
  "Mexico": "mx",
  "Argentina": "ar",
  "Chile": "cl",
  "Colombia": "co",
  "South Africa": "za",
  "Nigeria": "ng",
  "Egypt": "eg",
  "Kenya": "ke",
  "Israel": "il",
  "United Arab Emirates": "ae",
  "Saudi Arabia": "sa",
  "Turkey": "tr",
  "Russia": "ru",
  "Ukraine": "ua",
  "New Zealand": "nz",
  "Pakistan": "pk",
  "Bangladesh": "bd",
  "Sri Lanka": "lk"
};

export function Flag({ countryCode, className = "" }: FlagProps) {
  // Handle empty/null country
  if (!countryCode) {
    return <span className={`fi fi-xx ${className}`} title="Unknown"></span>;
  }

  // Convert country name to lowercase code for flag-icons
  // If countryCode is already a 2-letter code (e.g., "IN"), use it directly
  // Otherwise, look it up in the mapping
  let flagCode: string;
  if (countryCode.length === 2) {
    flagCode = countryCode.toLowerCase();
  } else {
    flagCode = countryNameToCode[countryCode] || "xx"; // xx is unknown flag
  }

  return (
    <span 
      className={`fi fi-${flagCode} ${className}`} 
      title={countryCode}
      style={{ fontSize: '1.25em' }}
    ></span>
  );
}
