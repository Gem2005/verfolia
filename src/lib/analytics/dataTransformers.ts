import type { AnalyticsData } from "@/types/analytics";
import { toISODate, toISODateTime, createTimeSlots } from "./timeUtils";
import type { TimeSeriesDataPoint } from "./calculations";

export interface StackedCountryData {
  date: string;
  [country: string]: string | number;
}

export interface SectionDurationData {
  section: string;
  avgDuration: number;
  views: number;
  clicks: number;
  engagementScore: number;
}

interface TimeSeriesInternal extends TimeSeriesDataPoint {
  durSum: number;
  durCount: number;
  sessionIds: Set<string>;
}

export const transformToCombinedSeries = (
  analyticsData: AnalyticsData | null,
  timeframe: string
): TimeSeriesDataPoint[] => {
  if (!analyticsData) return [];

  const { slots, is24Hours } = createTimeSlots(timeframe);

  // Track first view timestamp for each session globally
  const sessionFirstView = new Map<string, Date>(); // session_id -> first view timestamp
  
  // First pass: identify the very first view timestamp for each session
  analyticsData.views.forEach((v) => {
    const sessionId = v.session_id;
    if (sessionId) {
      const viewDate = new Date(v.viewed_at);
      
      if (!sessionFirstView.has(sessionId)) {
        sessionFirstView.set(sessionId, viewDate);
      } else {
        const currentFirst = sessionFirstView.get(sessionId)!;
        if (viewDate < currentFirst) {
          sessionFirstView.set(sessionId, viewDate);
        }
      }
    }
  });

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
      uniqueSessions: 0,
      returningViews: 0,
      returningPercentage: 0,
      sessionIds: new Set<string>(),
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
      
      // Track unique sessions for this time period
      const sessionId = v.session_id;
      if (sessionId) {
        cell.sessionIds.add(sessionId);
        
        // Check if this is a returning view (not the first view from this session)
        const firstViewTime = sessionFirstView.get(sessionId);
        if (firstViewTime && viewDate.getTime() !== firstViewTime.getTime()) {
          // This view is NOT the first view from this session - it's a returning view
          cell.returningViews += 1;
        }
      }
    }
  });

  // Process interactions data (exclude section_view_duration from interaction counts)
  analyticsData.interactions.forEach((i) => {
    // Skip section_view_duration as it's only for the duration chart
    if (i.interaction_type === 'section_view_duration') {
      return;
    }
    
    const interactionDate = new Date(i.clicked_at);
    const key = is24Hours
      ? toISODateTime(interactionDate)
      : toISODate(interactionDate);
    const cell = dateIndex.get(key);
    if (cell) {
      cell.interactions += 1;
    }
  });

  // Calculate average duration, unique sessions, and returning views
  return Array.from(dateIndex.values()).map((r) => {
    const { durSum, durCount, sessionIds, ...rest } = r;
    const uniqueSessions = sessionIds.size;
    const totalViews = rest.views;
    const returningViews = rest.returningViews; // Already calculated during processing
    
    const returningPercentage = totalViews > 0 
      ? Math.round((returningViews / totalViews) * 100) 
      : 0;
    
    return {
      ...rest,
      avgDuration: durCount > 0 ? Math.round(durSum / durCount) : 0,
      uniqueSessions,
      returningViews,
      returningPercentage,
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

export const transformToSectionDuration = (
  analyticsData: AnalyticsData | null
): SectionDurationData[] => {
  if (!analyticsData) return [];

  const sectionMap = new Map<string, {
    durations: number[];
    views: number;
    clicks: number;
  }>();

  // Process section_view_duration interactions
  analyticsData.interactions.forEach((interaction) => {
    const sectionName = interaction.section_name || 'unknown';
    
    if (!sectionMap.has(sectionName)) {
      sectionMap.set(sectionName, { durations: [], views: 0, clicks: 0 });
    }
    
    const section = sectionMap.get(sectionName)!;
    
    if (interaction.interaction_type === 'section_view_duration') {
      // Parse duration from target_value (format: "15s")
      const durationMatch = interaction.target_value?.match(/^(\d+)s$/);
      if (durationMatch) {
        const duration = parseInt(durationMatch[1], 10);
        section.durations.push(duration);
        section.views += 1;
      }
    } else if (interaction.interaction_type === 'section_click') {
      section.clicks += 1;
    }
  });

  // Calculate averages and engagement scores
  const result: SectionDurationData[] = [];
  
  sectionMap.forEach((data, section) => {
    if (data.views === 0) return; // Skip sections with no duration data
    
    const avgDuration = data.durations.reduce((sum, d) => sum + d, 0) / data.durations.length;
    
    // Engagement score: weighted formula considering duration, views, and clicks
    // Higher duration + clicks = better engagement
    const engagementScore = (avgDuration * 0.5) + (data.clicks * 10) + (data.views * 2);
    
    result.push({
      section,
      avgDuration: Math.round(avgDuration * 10) / 10, // Round to 1 decimal
      views: data.views,
      clicks: data.clicks,
      engagementScore: Math.round(engagementScore * 10) / 10,
    });
  });

  return result.sort((a, b) => b.engagementScore - a.engagementScore);
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
