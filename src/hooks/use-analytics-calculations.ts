import { useMemo } from "react";
import type { AnalyticsData } from "@/types/analytics";
import {
  calculateGrowthRate,
  calculateStandardDeviation,
  calculateTrendScore,
  calculateRetentionRate,
  calculateQualityScore,
  calculatePeakActivity,
  calculateViewConsistency,
  calculateDailyGrowth,
  calculatePeakRatio,
} from "@/lib/analytics/calculations";
import {
  transformToCombinedSeries,
  transformToStackedCountries,
} from "@/lib/analytics/dataTransformers";

export interface AnalyticsCalculations {
  // Key Metrics
  totalViews: number;
  totalInteractions: number;
  avgViewDuration: number;
  avgEngagementRate: number;

  // Growth Metrics
  viewsGrowthRate: number;
  interactionsGrowthRate: number;
  durationGrowthRate: number;
  viewsTrendScore: number;
  interactionsTrendScore: number;
  durationTrendScore: number;
  dailyGrowth: number;

  // Quality Metrics
  retentionRate: number;
  qualityScore: number;
  viewConsistency: number;

  // Activity Metrics
  peakActivity: { date: string; views: number };
  peakRatio: number;

  // Statistical Metrics
  stdDeviation: number;

  // Chart Data
  combinedSeries: ReturnType<typeof transformToCombinedSeries>;
  stackedCountries: ReturnType<typeof transformToStackedCountries>;

  // Derived Counts
  uniqueCountries: number;
  uniqueReferrers: number;
}

export function useAnalyticsCalculations(
  analyticsData: AnalyticsData | null,
  timeframe: string
): AnalyticsCalculations {
  return useMemo(() => {
    // Default empty calculations
    if (!analyticsData) {
      return {
        totalViews: 0,
        totalInteractions: 0,
        avgViewDuration: 0,
        avgEngagementRate: 0,
        viewsGrowthRate: 0,
        interactionsGrowthRate: 0,
        durationGrowthRate: 0,
        viewsTrendScore: 0,
        interactionsTrendScore: 0,
        durationTrendScore: 0,
        dailyGrowth: 0,
        retentionRate: 0,
        qualityScore: 0,
        viewConsistency: 0,
        peakActivity: { date: "N/A", views: 0 },
        peakRatio: 0,
        stdDeviation: 0,
        combinedSeries: [],
        stackedCountries: [],
        uniqueCountries: 0,
        uniqueReferrers: 0,
      };
    }

    // Basic counts
    const totalViews = analyticsData.views.length;
    const totalInteractions = analyticsData.interactions.length;

    // Average view duration (using view_duration property from View type)
    const avgViewDuration =
      totalViews > 0
        ? analyticsData.views.reduce(
            (sum, v) => sum + (v.view_duration || 0),
            0
          ) / totalViews
        : 0;

    // Average engagement rate (interactions per view)
    const avgEngagementRate =
      totalViews > 0 ? totalInteractions / totalViews : 0;

    // Chart data transformations (need these for growth/trend calculations)
    const combinedSeries = transformToCombinedSeries(analyticsData, timeframe);
    const stackedCountries = transformToStackedCountries(
      analyticsData,
      timeframe
    );

    // Growth metrics (using transformed time series data)
    const viewsGrowthRate = calculateGrowthRate(combinedSeries, "views");
    const interactionsGrowthRate = calculateGrowthRate(
      combinedSeries,
      "interactions"
    );
    const durationGrowthRate = calculateGrowthRate(
      combinedSeries,
      "avgDuration"
    );

    // Trend metrics (using transformed time series data)
    const viewsTrendScore = calculateTrendScore(combinedSeries, "views");
    const interactionsTrendScore = calculateTrendScore(
      combinedSeries,
      "interactions"
    );
    const durationTrendScore = calculateTrendScore(
      combinedSeries,
      "avgDuration"
    );

    // Daily growth (using transformed time series data)
    const dailyGrowth = calculateDailyGrowth(combinedSeries);

    // Quality metrics
    const retentionRate = calculateRetentionRate(analyticsData);
    const qualityScore = calculateQualityScore(avgViewDuration, totalViews);
    const viewConsistency = calculateViewConsistency(combinedSeries);

    // Activity metrics
    const peakActivity = calculatePeakActivity(combinedSeries);
    const peakRatio = calculatePeakRatio(combinedSeries);

    // Statistical metrics (standard deviation of daily views)
    const viewValues = combinedSeries.map((d) => d.views);
    const stdDeviation = calculateStandardDeviation(viewValues);

    // Unique counts
    const uniqueCountries = new Set(
      analyticsData.views.map((v) => v.country).filter(Boolean)
    ).size;
    const uniqueReferrers = new Set(
      analyticsData.views.map((v) => v.referrer).filter(Boolean)
    ).size;

    return {
      totalViews,
      totalInteractions,
      avgViewDuration,
      avgEngagementRate,
      viewsGrowthRate,
      interactionsGrowthRate,
      durationGrowthRate,
      viewsTrendScore,
      interactionsTrendScore,
      durationTrendScore,
      dailyGrowth,
      retentionRate,
      qualityScore,
      viewConsistency,
      peakActivity,
      peakRatio,
      stdDeviation,
      combinedSeries,
      stackedCountries,
      uniqueCountries,
      uniqueReferrers,
    };
  }, [analyticsData, timeframe]);
}
