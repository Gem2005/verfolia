import React from "react";
import { CombinedTimeSeriesChart } from "./CombinedTimeSeriesChart";
import { CountryStackedChart } from "./CountryStackedChart";
import type { AnalyticsCalculations } from "@/hooks/use-analytics-calculations";

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
