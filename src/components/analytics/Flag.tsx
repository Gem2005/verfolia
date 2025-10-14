import React from "react";

interface FlagProps {
  countryCode: string;
  className?: string;
}

export function Flag({ countryCode, className = "" }: FlagProps) {
  if (!countryCode) {
    return <span className={`text-lg ${className}`}>🌍</span>;
  }

  // Convert country code to flag emoji
  const getFlagEmoji = (code: string) => {
    const codePoints = code
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <span className={`text-lg ${className}`} title={countryCode}>
      {getFlagEmoji(countryCode)}
    </span>
  );
}
