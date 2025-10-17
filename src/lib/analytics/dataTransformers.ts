import type { AnalyticsData } from "@/types/analytics";
import { toISODate, toISODateTime, createTimeSlots } from "./timeUtils";
import type { TimeSeriesDataPoint } from "./calculations";

export interface StackedCountryData {
  date: string;
  [country: string]: string | number;
}

interface TimeSeriesInternal extends TimeSeriesDataPoint {
  durSum: number;
  durCount: number;
}

export const transformToCombinedSeries = (
  analyticsData: AnalyticsData | null,
  timeframe: string
): TimeSeriesDataPoint[] => {
  if (!analyticsData) return [];

  const { slots, is24Hours } = createTimeSlots(timeframe);

  // Initialize data structure
  const dateIndex = new Map<string, TimeSeriesInternal>();
  
  slots.forEach((value, key) => {
    dateIndex.set(key, {
      date: value.date,
      views: 0,
      interactions: 0,
      avgDuration: 0,
      durSum: 0,
      durCount: 0,
    });
  });

  // Process views data
  analyticsData.views.forEach((v) => {
    const viewDate = new Date(v.viewed_at);
    const key = is24Hours ? toISODateTime(viewDate) : toISODate(viewDate);
    const cell = dateIndex.get(key);
    if (cell) {
      cell.views += 1;
      cell.durSum += Number(v.view_duration || 0);
      cell.durCount += 1;
    }
  });

  // Process interactions data
  analyticsData.interactions.forEach((i) => {
    const interactionDate = new Date(i.clicked_at);
    const key = is24Hours
      ? toISODateTime(interactionDate)
      : toISODate(interactionDate);
    const cell = dateIndex.get(key);
    if (cell) {
      cell.interactions += 1;
    }
  });

  // Calculate average duration and clean up
  return Array.from(dateIndex.values()).map((r) => {
    const { durSum, durCount, ...rest } = r;
    return {
      ...rest,
      avgDuration: durCount > 0 ? Math.round(durSum / durCount) : 0,
    };
  });
};

export const transformToStackedCountries = (
  analyticsData: AnalyticsData | null,
  timeframe: string
): StackedCountryData[] => {
  if (!analyticsData) return [];

  const top = [...analyticsData.summary.viewsByCountry]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((c) => c.name);

  const { slots, is24Hours } = createTimeSlots(timeframe);

  const buckets = new Map<string, StackedCountryData>();

  slots.forEach((value, key) => {
    const obj: StackedCountryData = { date: value.date };
    top.forEach((country) => {
      obj[country] = 0;
    });
    buckets.set(key, obj);
  });

  analyticsData.views.forEach((v) => {
    const viewDate = new Date(v.viewed_at);
    const key = is24Hours ? toISODateTime(viewDate) : toISODate(viewDate);
    const country = v.country || "Unknown";
    if (buckets.has(key) && top.includes(country)) {
      const obj = buckets.get(key)!;
      obj[country] = (Number(obj[country] || 0) + 1);
    }
  });

  return Array.from(buckets.values());
};

export const processAnalyticsData = (data: unknown): AnalyticsData => {
  if (!data || typeof data !== 'object' || !('summary' in data)) {
    throw new Error("Invalid analytics data received");
  }

  const typedData = data as Record<string, unknown>;
  const summary = typedData.summary as Record<string, unknown>;

  return {
    ...typedData,
    views: (typedData.views as unknown[]) || [],
    interactions: (typedData.interactions as unknown[]) || [],
    summary: {
      ...summary,
      totalViews: (summary.totalViews as number) || 0,
      totalInteractions: (summary.totalInteractions as number) || 0,
      avgViewDuration: (summary.avgViewDuration as number) || 0,
      viewsByDate: ((summary.viewsByDate as unknown[]) || []).map((item: unknown) => {
        const typedItem = item as Record<string, unknown>;
        return {
          date: typedItem.date as string,
          count: Number(typedItem.count),
        };
      }),
      interactionsByType: ((summary.interactionsByType as unknown[]) || []).map((item: unknown) => {
        const typedItem = item as Record<string, unknown>;
        return {
          name: typedItem.name as string,
          count: Number(typedItem.count),
        };
      }),
      viewsByCountry: ((summary.viewsByCountry as unknown[]) || []).map((item: unknown) => {
        const typedItem = item as Record<string, unknown>;
        return {
          name: typedItem.name as string,
          count: Number(typedItem.count),
        };
      }),
      viewsByReferrer: ((summary.viewsByReferrer as unknown[]) || []).map((item: unknown) => {
        const typedItem = item as Record<string, unknown>;
        return {
          name: typedItem.name as string,
          count: Number(typedItem.count),
        };
      }),
    },
  } as AnalyticsData;
};
