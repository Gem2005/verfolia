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
  transformToSectionDuration,
  type SectionDurationData,
} from "@/lib/analytics/dataTransformers";

export interface AnalyticsCalculations {
  // Key Metrics
  totalViews: number;
  totalInteractions: number;
  avgViewDuration: number;
  avgEngagementRate: number;
  totalReturningViews: number;
  returningViewsPercentage: number;

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
  sectionDurations: SectionDurationData[];

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
        totalReturningViews: 0,
        returningViewsPercentage: 0,
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
        sectionDurations: [],
        uniqueCountries: 0,
        uniqueReferrers: 0,
      };
    }

    // Basic counts
    const totalViews = analyticsData.views.length;
    // Exclude section_view_duration from interaction counts (it's only for duration chart)
    const totalInteractions = analyticsData.interactions.filter(
      i => i.interaction_type !== 'section_view_duration'
    ).length;

    // Average view duration (using view_duration property from View type)
    // Only count views that have duration data
    const viewsWithDuration = analyticsData.views.filter(v => v.view_duration && v.view_duration > 0);
    const avgViewDuration =
      viewsWithDuration.length > 0
        ? viewsWithDuration.reduce(
            (sum, v) => sum + (v.view_duration || 0),
            0
          ) / viewsWithDuration.length
        : 0;

    // Improved engagement rate calculation
    // More reliable method: Calculate what percentage of views resulted in interactions
    // This accounts for the fact that some users may interact multiple times
    
    // Method 1: Count unique days with interactions (conservative estimate)
    const uniqueInteractionDays = new Set(
      analyticsData.interactions
        .filter(i => i.interaction_type !== 'section_view_duration')
        .map(i => i.clicked_at.split('T')[0]) // Group by date
    ).size;
    
    const uniqueViewDays = new Set(
      analyticsData.views.map(v => v.viewed_at.split('T')[0])
    ).size;
    
    // Method 2: Simple ratio but more meaningful interpretation
    // If totalInteractions > totalViews, it means high engagement (users interact multiple times)
    const simpleRatio = totalViews > 0 ? totalInteractions / totalViews : 0;
    
    // Use a hybrid approach: 
    // - If engagement is low (< 1), use simple ratio
    // - If engagement is high (>= 1), calculate based on active days
    const avgEngagementRate = simpleRatio >= 1.0 
      ? (uniqueInteractionDays > 0 && uniqueViewDays > 0 
          ? Math.min((uniqueInteractionDays / uniqueViewDays) + (simpleRatio - 1) * 0.1, 2.0)
          : simpleRatio)
      : simpleRatio;

    // Chart data transformations (need these for growth/trend calculations)
    const combinedSeries = transformToCombinedSeries(analyticsData, timeframe);
    const stackedCountries = transformToStackedCountries(
      analyticsData,
      timeframe
    );
    const sectionDurations = transformToSectionDuration(analyticsData);

    // Returning views calculation
    const totalReturningViews = combinedSeries.reduce(
      (sum, item) => sum + (item.returningViews || 0), 
      0
    );
    const returningViewsPercentage = totalViews > 0 
      ? Math.round((totalReturningViews / totalViews) * 100) 
      : 0;

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
      totalReturningViews,
      returningViewsPercentage,
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
      sectionDurations,
      uniqueCountries,
      uniqueReferrers,
    };
  }, [analyticsData, timeframe]);
}
