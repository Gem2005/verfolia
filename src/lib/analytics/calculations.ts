import type { AnalyticsData } from "@/types/analytics";

export interface TimeSeriesDataPoint {
  date: string;
  views: number;
  interactions: number;
  avgDuration: number;
}

export const calculateGrowthRate = (
  series: TimeSeriesDataPoint[],
  metric: "views" | "interactions" | "avgDuration"
) => {
  if (!series || series.length < 2) return 0;

  // For shorter timeframes, compare last half vs first half
  const midpoint = Math.floor(series.length / 2);
  const recentData = series.slice(midpoint);
  const previousData = series.slice(0, midpoint);

  const recentSum = recentData.reduce((sum, d) => sum + (d[metric] || 0), 0);
  const previousSum = previousData.reduce(
    (sum, d) => sum + (d[metric] || 0),
    0
  );

  if (previousSum === 0) return recentSum > 0 ? 100 : 0;

  return Math.round(((recentSum - previousSum) / previousSum) * 100);
};

export const calculateStandardDeviation = (values: number[]) => {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  return Math.sqrt(variance);
};

export const calculateTrendScore = (
  series: TimeSeriesDataPoint[],
  metric: "views" | "interactions" | "avgDuration"
) => {
  if (!series || series.length < 3) return 0;

  const values = series.map((d) => d[metric] || 0);
  const increasing = values.filter(
    (val, i) => i > 0 && val > values[i - 1]
  ).length;
  const total = values.length - 1;

  return total > 0 ? Math.round((increasing / total) * 100) : 0;
};

export const calculateRetentionRate = (analyticsData: AnalyticsData | null) => {
  if (!analyticsData || analyticsData.views.length === 0) return 0;

  const longViews = analyticsData.views.filter(
    (v) => (v.view_duration || 0) >= 60
  ).length;

  return analyticsData.views.length > 0
    ? Math.round((longViews / analyticsData.views.length) * 100)
    : 0;
};

export const calculateQualityScore = (
  avgViewDuration: number,
  totalViews: number
) => {
  return Math.round(
    (avgViewDuration / 60) * 0.5 + Math.min(totalViews / 100, 1) * 50
  );
};

export const calculatePeakActivity = (series: TimeSeriesDataPoint[]) => {
  if (!series || series.length === 0) {
    return { date: "N/A", views: 0 };
  }
  
  return series.reduce(
    (max, day) => (day.views > max.views ? day : max),
    series[0]
  );
};

export const calculateViewConsistency = (
  series: TimeSeriesDataPoint[]
) => {
  if (!series || series.length === 0) return 0;
  return Math.round(
    (series.filter((d) => d.views > 0).length / series.length) * 100
  );
};

export const calculateDailyGrowth = (series: TimeSeriesDataPoint[]) => {
  if (!series || series.length < 2) return 0;
  return Math.round(
    ((series[series.length - 1]?.views || 0) - (series[0]?.views || 0)) /
      series.length
  );
};

export const calculatePeakRatio = (series: TimeSeriesDataPoint[]) => {
  if (!series || series.length === 0) return 0;
  const maxViews = Math.max(...series.map((d) => d.views));
  const avgViews = series.reduce((sum, d) => sum + d.views, 0) / series.length;
  return avgViews > 0 ? Math.round((maxViews / avgViews) * 100) / 100 : 0;
};
