import React from "react";
import dynamic from "next/dynamic";
import type { AnalyticsCalculations } from "@/hooks/use-analytics-calculations";

// Lazy load heavy chart components
const CombinedTimeSeriesChart = dynamic(
  () => import("./CombinedTimeSeriesChart").then((mod) => ({ default: mod.CombinedTimeSeriesChart })),
  { 
    ssr: false,
    loading: () => <div className="h-80 bg-gray-50 animate-pulse rounded-lg flex items-center justify-center">Loading chart...</div>
  }
);

const CountryStackedChart = dynamic(
  () => import("./CountryStackedChart").then((mod) => ({ default: mod.CountryStackedChart })),
  { 
    ssr: false,
    loading: () => <div className="h-80 bg-gray-50 animate-pulse rounded-lg flex items-center justify-center">Loading chart...</div>
  }
);

interface ChartsGridSectionProps {
  calculations: AnalyticsCalculations;
}

export function ChartsGridSection({ calculations }: ChartsGridSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <CombinedTimeSeriesChart
          data={calculations.combinedSeries}
          title="Activity Trends"
        />
      </div>

      {calculations.stackedCountries.length > 0 && (
        <div className="md:col-span-2">
          <CountryStackedChart
            data={calculations.stackedCountries}
            title="Geographic Distribution"
          />
        </div>
      )}
    </div>
  );
}
