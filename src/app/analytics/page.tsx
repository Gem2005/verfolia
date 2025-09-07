"use client";

import { useState, useEffect, useCallback, useMemo, useId } from "react";
import { useAuth } from "@/hooks/use-auth";
import { resumeService } from "@/services/resume-service";
import type { Resume } from "@/services/resume-service";
import type { AnalyticsData } from "@/types/analytics";
import { useRouter, useSearchParams } from "next/navigation";
import { AnalyticsSkeletonLoading } from "@/components/analytics/SkeletonLoading";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
} from "recharts";

import {
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  MousePointerClick,
  BarChart3,
  LineChart as LineChartIcon,
  Globe,
  Activity,
  MousePointer,
} from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Types for analytics data structures
interface TimeSeriesDataPoint {
  date: string;
  views: number;
  interactions: number;
  avgDuration: number;
}

// Helper functions for calculations
const calculateGrowthRate = (
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

// Helper functions for engagement, conversion, and session value have been removed

const calculateStandardDeviation = (values: number[]) => {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  return Math.sqrt(variance);
};

const calculateTrendScore = (
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

const calculateRetentionRate = (analyticsData: AnalyticsData | null) => {
  if (!analyticsData || analyticsData.views.length === 0) return 0;

  const longViews = analyticsData.views.filter(
    (v) => (v.view_duration || 0) >= 60
  ).length;

  return analyticsData.views.length > 0
    ? Math.round((longViews / analyticsData.views.length) * 100)
    : 0;
};

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("resumeId");
  const [selectedResume, setSelectedResume] = useState<string | null>(
    resumeIdParam
  );
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"1" | "7" | "30" | "90">("1");

  // Pagination states
  const [viewsPage, setViewsPage] = useState(1);
  const [interactionsPage, setInteractionsPage] = useState(1);
  const [viewsPageSize, setViewsPageSize] = useState(10);
  const [interactionsPageSize, setInteractionsPageSize] = useState(10);

  // Table visibility states (initially closed)
  const [showViewsTable, setShowViewsTable] = useState(false);
  const [showInteractionsTable, setShowInteractionsTable] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Use ref to track if initial load is done to prevent unnecessary rerenders
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    const loadResumes = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userResumes = await resumeService.getUserResumes(user.id);
        if (!userResumes || userResumes.length === 0) {
          setLoading(false);
          return;
        }
        setResumes(userResumes);

        // If resumeId query param exists and it's in the user's resumes, select it
        if (resumeIdParam && userResumes.some((r) => r.id === resumeIdParam)) {
          setSelectedResume(resumeIdParam);
        }
        // Otherwise auto-select the first resume if available and no resume is currently selected
        else if (userResumes.length > 0 && !selectedResume) {
          setSelectedResume(userResumes[0].id);
        } else {
          setLoading(false);
        }

        setInitialLoadDone(true);
      } catch (error) {
        console.error("Error loading resumes:", error);
        setLoading(false);
        setInitialLoadDone(true);
      }
    };

    if (!authLoading && user && !initialLoadDone) {
      loadResumes();
    }
  }, [user, authLoading, resumeIdParam, selectedResume, initialLoadDone]);

  const loadAnalytics = useCallback(async (resumeId: string, days: string) => {
    try {
      setLoading(true);

      // Only update URL if the resumeId is different from what's currently in the URL
      const currentUrlResumeId = new URL(window.location.href).searchParams.get(
        "resumeId"
      );
      if (currentUrlResumeId !== resumeId) {
        const url = new URL(window.location.href);
        url.searchParams.set("resumeId", resumeId);
        window.history.replaceState({}, "", url.toString());
      }

      // Convert timeframe to proper days for backend query
      const queryDays = parseInt(days);
      const data = await resumeService.getResumeAnalytics(resumeId, queryDays);

      // Ensure data has all required fields
      if (!data || !data.summary) {
        throw new Error("Invalid analytics data received");
      }

      // Process and validate the data
      const processedData: AnalyticsData = {
        ...data,
        views: data.views || [],
        interactions: data.interactions || [],
        summary: {
          ...data.summary,
          totalViews: data.summary.totalViews || 0,
          totalInteractions: data.summary.totalInteractions || 0,
          avgViewDuration: data.summary.avgViewDuration || 0,
          viewsByDate: data.summary.viewsByDate.map((item) => ({
            date: item.date,
            count: Number(item.count),
          })),
          interactionsByType: data.summary.interactionsByType.map((item) => ({
            name: item.name,
            count: Number(item.count),
          })),
          viewsByCountry: data.summary.viewsByCountry.map((item) => ({
            name: item.name,
            count: Number(item.count),
          })),
          viewsByReferrer: data.summary.viewsByReferrer.map((item) => ({
            name: item.name,
            count: Number(item.count),
          })),
        },
      };

      setAnalyticsData(processedData);
    } catch (error) {
      console.error("Error loading analytics:", error);
      // Still set analytics data to a default empty state
      setAnalyticsData({
        views: [],
        interactions: [],
        summary: {
          totalViews: 0,
          totalInteractions: 0,
          avgViewDuration: 0,
          viewsByDate: [{ date: "", count: 0 }],
          interactionsByType: [{ name: "", count: 0 }],
          viewsByCountry: [{ name: "", count: 0 }],
          viewsByReferrer: [{ name: "", count: 0 }],
        },
      });
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any values that change

  // Separate useEffect for loading analytics when timeframe or selectedResume changes
  useEffect(() => {
    if (selectedResume && initialLoadDone) {
      loadAnalytics(selectedResume, timeframe);
    }
  }, [selectedResume, timeframe, initialLoadDone, loadAnalytics]);

  const handleTimeframeChange = useCallback((days: "1" | "7" | "30" | "90") => {
    setTimeframe(days);
    // Analytics will be loaded automatically by the useEffect that watches timeframe
  }, []);

  // Helpers
  const formatCountry = useCallback((country: string) => {
    if (!country || country === "Unknown") return "Unknown";
    if (country.length > 18) return country.slice(0, 15) + "...";
    return country;
  }, []);

  const formatReferrer = useCallback((referrer: string) => {
    if (!referrer || referrer === "Unknown") return "Direct";
    try {
      const url = new URL(referrer);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return referrer.slice(0, 24) + (referrer.length > 24 ? "..." : "");
    }
  }, []);

  // Pagination helpers
  const getPaginatedData = useCallback(
    <T,>(data: T[], page: number, pageSize: number): T[] => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return data.slice(startIndex, endIndex);
    },
    []
  );

  const getTotalPages = useCallback((dataLength: number, pageSize: number) => {
    return Math.ceil(dataLength / pageSize);
  }, []);

  const getStatusBadge = useCallback((type: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      click: "default",
      hover: "secondary",
      scroll: "outline",
      download: "destructive",
    };
    return variants[type] || "outline";
  }, []);

  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  const toISODateTime = (d: Date) => d.toISOString().slice(0, 13); // Returns YYYY-MM-DDTHH

  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };

  const hoursAgo = (n: number) => {
    const d = new Date();
    d.setHours(d.getHours() - n);
    return d;
  };

  // Derived series for advanced charts (optimized for timeframe)
  const combinedSeries = useMemo(() => {
    if (!analyticsData) return [];
    const range = Number(timeframe);
    const is24Hours = range === 1;

    // For 24 hours, group by hour; for other periods, group by day
    const dateIndex = new Map();

    if (is24Hours) {
      // Create 24 hour slots
      Array.from({ length: 24 }).forEach((_, i) => {
        const hourDate = hoursAgo(23 - i);
        const key = toISODateTime(hourDate);
        dateIndex.set(key, {
          date: hourDate.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            hour12: true,
          }),
          views: 0,
          interactions: 0,
          avgDuration: 0,
          durSum: 0,
          durCount: 0,
        });
      });
    } else {
      // Create day slots
      Array.from({ length: range + 1 }).forEach((_, i) => {
        const d = toISODate(daysAgo(range - i));
        dateIndex.set(d, {
          date: d,
          views: 0,
          interactions: 0,
          avgDuration: 0,
          durSum: 0,
          durCount: 0,
        });
      });
    }

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

    return Array.from(dateIndex.values()).map((r) => ({
      date: r.date,
      views: r.views,
      interactions: r.interactions,
      avgDuration: r.durCount > 0 ? Math.round(r.durSum / r.durCount) : 0,
    }));
  }, [analyticsData, timeframe]);

  const stackedCountries = useMemo(() => {
    if (!analyticsData) return [];
    const top = [...analyticsData.summary.viewsByCountry]
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((c) => c.name);

    const range = Number(timeframe);
    const is24Hours = range === 1;

    const buckets = new Map();

    if (is24Hours) {
      // For 24 hours, group by hours (simplified to days for country view)
      Array.from({ length: 24 }).forEach((_, i) => {
        const hourDate = hoursAgo(23 - i);
        const key = toISODateTime(hourDate);
        buckets.set(key, {
          date: hourDate.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            hour12: true,
          }),
          ...Object.fromEntries(top.map((t) => [t, 0])),
        });
      });
    } else {
      Array.from({ length: range + 1 }).forEach((_, i) => {
        const d = toISODate(daysAgo(range - i));
        buckets.set(d, {
          date: d,
          ...Object.fromEntries(top.map((t) => [t, 0])),
        });
      });
    }

    analyticsData.views.forEach((v) => {
      const viewDate = new Date(v.viewed_at);
      const key = is24Hours ? toISODateTime(viewDate) : toISODate(viewDate);
      const country = v.country || "Unknown";
      if (buckets.has(key) && top.includes(country)) {
        const obj = buckets.get(key)!;
        obj[country] = (Number(obj[country] || 0) + 1) as number;
      }
    });

    return Array.from(buckets.values());
  }, [analyticsData, timeframe]);

  // Minimal country code map for flags (no extra config files)
  const countryNameToCode = useMemo<Record<string, string>>(
    () => ({
      "United States": "US",
      "United Kingdom": "GB",
      India: "IN",
      Canada: "CA",
      Germany: "DE",
      France: "FR",
      Spain: "ES",
      Italy: "IT",
      Australia: "AU",
      Brazil: "BR",
      Japan: "JP",
      China: "CN",
      Netherlands: "NL",
      Sweden: "SE",
      Singapore: "SG",
      Mexico: "MX",
      Indonesia: "ID",
      Nigeria: "NG",
      Poland: "PL",
      Turkey: "TR",
      Unknown: "",
    }),
    []
  );

  if (authLoading || loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
        <AnalyticsSkeletonLoading />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Profile Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Insights for the selected profile over the last{" "}
            {timeframe === "1" ? "24 hours" : `${timeframe} days`}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <label
            htmlFor="timeframe-select"
            className="text-sm font-medium text-muted-foreground mr-2"
          >
            Timeframe:
          </label>
          <Select
            value={timeframe}
            onValueChange={(v) =>
              handleTimeframeChange(v as "1" | "7" | "30" | "90")
            }
          >
            <SelectTrigger id="timeframe-select" className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 Hours</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Analytics Content */}
        <div className="col-span-1">
          {selectedResume ? (
            <>
              {/* No Data Display */}
              {!analyticsData ||
              (analyticsData.summary.totalViews === 0 &&
                analyticsData.summary.totalInteractions === 0) ? (
                <Card className="border-none shadow-sm text-center">
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Eye className="h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-semibold">
                        No Analytics Data Available
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        This profile hasn&apos;t received any views or
                        interactions in the selected time period. Share your
                        profile with others to start collecting analytics.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          const currentResume = resumes.find(
                            (r) => r.id === selectedResume
                          );
                          if (currentResume) {
                            const resumeUrl = `${window.location.origin}/resume/${currentResume.slug}`;
                            navigator.clipboard.writeText(resumeUrl);
                            alert("Profile URL copied to clipboard!");
                          }
                        }}
                      >
                        Copy Profile Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Overview with TinyLineChart (sparklines) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <MetricCard
                      icon={<Eye className="h-5 w-5" />}
                      title="Total Views"
                      value={analyticsData?.summary?.totalViews || 0}
                      change={calculateGrowthRate(combinedSeries, "views")}
                      data={(combinedSeries || []).map((d) => ({
                        x: d.date,
                        y: d.views,
                      }))}
                      color="var(--chart-1)"
                    />
                    <MetricCard
                      icon={<MousePointerClick className="h-5 w-5" />}
                      title="Total Interactions"
                      value={analyticsData?.summary?.totalInteractions || 0}
                      change={calculateGrowthRate(
                        combinedSeries,
                        "interactions"
                      )}
                      data={(combinedSeries || []).map((d) => ({
                        x: d.date,
                        y: d.interactions,
                      }))}
                      color="var(--chart-1)"
                    />
                    <MetricCard
                      icon={<Clock className="h-5 w-5" />}
                      title="Avg.View Duration"
                      value={
                        (analyticsData?.summary?.avgViewDuration || 0) + "s"
                      }
                      change={calculateGrowthRate(
                        combinedSeries,
                        "avgDuration"
                      )}
                      data={(combinedSeries || []).map((d) => ({
                        x: d.date,
                        y: d.avgDuration,
                      }))}
                      color="var(--chart-1)"
                    />
                    <MetricCard
                      icon={<Calendar className="h-5 w-5" />}
                      title={
                        timeframe === "1" ? "Views Per Hour" : "Views Per Day"
                      }
                      value={Math.round(
                        (analyticsData?.summary?.totalViews || 0) /
                          (timeframe === "1" ? 24 : Number(timeframe))
                      )}
                      change={calculateGrowthRate(combinedSeries, "views")}
                      data={(combinedSeries || []).map((d) => ({
                        x: d.date,
                        y: d.views,
                      }))}
                      color="var(--chart-1)"
                    />
                  </div>

                  {/* Statistical Insights Section */}
                  <div className="mb-6">
                    <Card className="border-none shadow-sm bg-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-card-foreground">
                          <div className="p-1 rounded-md bg-primary/10">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          Statistical Insights
                        </CardTitle>
                        <CardDescription>
                          Mathematical analysis of your profile performance
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              Peak Activity
                            </div>
                            <div className="text-2xl font-bold text-foreground font-mono">
                              {combinedSeries
                                .reduce(
                                  (max, day) =>
                                    day.views > max.views ? day : max,
                                  combinedSeries[0] || { views: 0, date: "N/A" }
                                )
                                .date.split("-")
                                .slice(1)
                                .join("/")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {
                                combinedSeries.reduce(
                                  (max, day) =>
                                    day.views > max.views ? day : max,
                                  combinedSeries[0] || { views: 0 }
                                ).views
                              }{" "}
                              views
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              View Consistency
                            </div>
                            <div className="text-2xl font-bold text-foreground font-mono">
                              {combinedSeries.length > 0
                                ? Math.round(
                                    (combinedSeries.filter((d) => d.views > 0)
                                      .length /
                                      combinedSeries.length) *
                                      100
                                  )
                                : 0}
                              %
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {timeframe === "1"
                                ? "Hours with activity"
                                : "Days with activity"}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              Avg. Daily Growth
                            </div>
                            <div className="text-2xl font-bold text-foreground font-mono">
                              {combinedSeries.length > 1
                                ? Math.round(
                                    ((combinedSeries[combinedSeries.length - 1]
                                      ?.views || 0) -
                                      (combinedSeries[0]?.views || 0)) /
                                      combinedSeries.length
                                  )
                                : 0}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Views per day change
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              Quality Score
                            </div>
                            <div className="text-2xl font-bold text-foreground font-mono">
                              {Math.round(
                                // Removed Engagement Rate dependency, adjusted weights
                                ((analyticsData?.summary?.avgViewDuration ||
                                  0) /
                                  60) *
                                  0.5 +
                                  Math.min(
                                    (analyticsData?.summary?.totalViews || 0) /
                                      100,
                                    1
                                  ) *
                                    50
                              )}
                              %
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Overall performance
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Analytics Section */}
                  <div className="mb-6">
                    <Card className="border-none shadow-sm bg-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-card-foreground">
                          <div className="p-1 rounded-md bg-secondary/10">
                            <Activity className="h-5 w-5 " />
                          </div>
                          Performance Analytics
                        </CardTitle>
                        <CardDescription>
                          Advanced mathematical insights and trend analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              View Trend
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {calculateTrendScore(combinedSeries, "views")}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Upward momentum
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              Retention Rate
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {calculateRetentionRate(analyticsData)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Views over 60 seconds
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              View Variance
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {Math.round(
                                calculateStandardDeviation(
                                  combinedSeries.map((d) => d.views)
                                ) * 100
                              ) / 100}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Traffic consistency
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              Peak Ratio
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {combinedSeries.length > 0
                                ? Math.round(
                                    (Math.max(
                                      ...combinedSeries.map((d) => d.views)
                                    ) /
                                      Math.max(
                                        1,
                                        combinedSeries.reduce(
                                          (sum, d) => sum + d.views,
                                          0
                                        ) / combinedSeries.length
                                      )) *
                                      100
                                  ) / 100
                                : 0}
                              x
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Peak vs average views
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LineBarAreaComposedChart */}
                    <Card className="col-span-1 lg:col-span-2 border-none shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          Traffic Overview
                        </CardTitle>
                        <CardDescription>
                          Views, interactions and average duration
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="h-[360px]">
                        <ChartContainer
                          config={{
                            views: {
                              label: "Views",
                              color: "var(--chart-1)",
                            },
                            interactions: {
                              label: "Interactions",
                              color: "var(--chart-2)",
                            },
                            avgDuration: {
                              label: "Avg Duration (s)",
                              color: "var(--chart-3)",
                            },
                          }}
                          className="h-full w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={combinedSeries}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis yAxisId="left" allowDecimals={false} />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                allowDecimals={false}
                              />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Legend />
                              <Bar
                                yAxisId="left"
                                dataKey="views"
                                name="Views"
                                fill="var(--chart-1)"
                                radius={[6, 6, 0, 0]}
                              />
                              <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="interactions"
                                name="Interactions"
                                stroke="var(--chart-1)"
                                strokeWidth={2}
                                dot={false}
                              />
                              <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="avgDuration"
                                name="Avg Duration (s)"
                                stroke="var(--chart-1)"
                                fill="var(--chart-1)"
                                fillOpacity={0.15}
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* SpecifiedDomainRadarChart */}
                    <Card className="border-none shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MousePointerClick className="h-5 w-5 text-primary" />
                          Interactions by Type
                        </CardTitle>
                        <CardDescription>
                          Distribution of interaction types
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="h-[360px]">
                        <ChartContainer
                          config={{
                            count: {
                              label: "Count",
                              color: "var(--chart-1)",
                            },
                          }}
                          className="h-full w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                              data={(
                                analyticsData?.summary?.interactionsByType || []
                              ).map((d) => ({
                                type: d.name,
                                count: d.count,
                              }))}
                              outerRadius="80%"
                            >
                              <PolarGrid />
                              <PolarAngleAxis dataKey="type" />
                              <PolarRadiusAxis angle={30} />
                              <Radar
                                name="Interactions"
                                dataKey="count"
                                stroke="var(--chart-1)"
                                fill="var(--chart-1)"
                                fillOpacity={0.25}
                              />
                              <ChartTooltip content={<ChartTooltipContent />} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LineChartAxisInterval */}
                    <Card className="border-none shadow-sm">
                      <CardHeader>
                        <CardTitle>
                          <div className="flex items-center gap-2">
                            <LineChartIcon className="h-5 w-5 text-primary" />
                            Views Over Time
                          </div>
                        </CardTitle>
                        <CardDescription>With axis interval</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[320px]">
                        <ChartContainer
                          config={{
                            views: {
                              label: "Views",
                              color: "var(--chart-1)",
                            },
                          }}
                          className="h-full w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={combinedSeries}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                interval="preserveStartEnd"
                              />
                              <YAxis allowDecimals={false} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Line
                                type="monotone"
                                dataKey="views"
                                stroke="var(--chart-1)"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* StackedAreaChart (Top countries) */}
                    <Card className="border-none shadow-sm">
                      <CardHeader>
                        <CardTitle>
                          <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            Top Countries Over Time
                          </div>
                        </CardTitle>
                        <CardDescription>Stacked area</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[320px]">
                        <ChartContainer
                          config={{
                            a: {
                              label: "Series A",
                              color: "var(--chart-1)",
                            },
                            b: {
                              label: "Series B",
                              color: "var(--chart-2)",
                            },
                            c: {
                              label: "Series C",
                              color: "var(--chart-3)",
                            },
                            d: {
                              label: "Series D",
                              color: "var(--chart-4)",
                            },
                          }}
                          className="h-full w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stackedCountries}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis allowDecimals={false} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              {stackedCountries.length > 0 &&
                                Object.keys(stackedCountries[0])
                                  .filter((k) => k !== "date")
                                  .slice(0, 4)
                                  .map((key, idx) => {
                                    const varKey = ["a", "b", "c", "d"][idx]!;
                                    return (
                                      <Area
                                        key={key}
                                        type="monotone"
                                        dataKey={key}
                                        name={key}
                                        stackId="1"
                                        stroke={`var(--chart-${idx + 1})`}
                                        fill={`var(--chart-${idx + 1})`}
                                        fillOpacity={0.18 + idx * 0.08}
                                      />
                                    );
                                  })}
                            </AreaChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* SimpleBarChart (Traffic sources) */}
                    <Card className="border-none shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ExternalLink className="h-5 w-5 text-primary" />
                          Traffic Sources
                        </CardTitle>
                        <CardDescription>Top referrers</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[320px]">
                        {analyticsData?.summary?.viewsByReferrer?.length > 0 ? (
                          <ChartContainer
                            config={{
                              count: {
                                label: "Visitors",
                                color: "var(--chart-1)",
                              },
                            }}
                            className="h-full w-full"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[...analyticsData.summary.viewsByReferrer]
                                  .sort((a, b) => b.count - a.count)
                                  .slice(0, 10)}
                                layout="vertical"
                                margin={{ left: 8, right: 8 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis
                                  type="category"
                                  dataKey="name"
                                  width={120}
                                  tickFormatter={formatReferrer}
                                />
                                <ChartTooltip
                                  cursor={false}
                                  content={<ChartTooltipContent />}
                                />
                                <Bar
                                  dataKey="count"
                                  fill="var(--chart-1)"
                                  radius={6}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">
                              No referrer data available
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Views Table */}
                  <Card className="mt-6 border-none shadow-sm bg-gradient-to-br from-background to-muted/20">
                    <CardHeader className="border-b border-border/40 bg-gradient-to-r from-var(--primary)/5 to-var(--chart-1)/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowViewsTable(!showViewsTable)}
                            className="h-8 w-8 p-0"
                          >
                            {showViewsTable ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <div>
                            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                              <Eye className="h-5 w-5 text-primary" />
                              Recent Views
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                              Last{" "}
                              {timeframe === "1"
                                ? "24 hours"
                                : `${timeframe} days`}{" "}
                              •{analyticsData?.views?.length || 0} total views
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium"
                        >
                          Page {viewsPage} of{" "}
                          {getTotalPages(
                            analyticsData?.views?.length || 0,
                            viewsPageSize
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    {showViewsTable && (
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-b border-border/40 bg-muted/30 hover:bg-muted/40">
                                <TableHead className="font-semibold text-foreground px-6 py-4">
                                  Date & Time
                                </TableHead>
                                <TableHead className="font-semibold text-foreground px-6 py-4">
                                  Location
                                </TableHead>
                                <TableHead className="font-semibold text-foreground px-6 py-4">
                                  Duration
                                </TableHead>
                                <TableHead className="font-semibold text-foreground px-6 py-4">
                                  Source
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {analyticsData?.views?.length ? (
                                getPaginatedData(
                                  analyticsData.views,
                                  viewsPage,
                                  viewsPageSize
                                ).map((view, index) => (
                                  <TableRow
                                    key={view.id}
                                    className={`
                                      border-b border-border/20 transition-colors hover:bg-muted/40
                                      ${
                                        index % 2 === 0
                                          ? "bg-background"
                                          : "bg-muted/10"
                                      }
                                    `}
                                  >
                                    <TableCell className="px-6 py-4 font-medium">
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium text-foreground">
                                          {new Date(
                                            view.viewed_at
                                          ).toLocaleDateString()}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(
                                            view.viewed_at
                                          ).toLocaleTimeString()}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                          <div className="w-5 h-4 rounded-sm shadow-sm overflow-hidden">
                                            <Flag
                                              code={
                                                countryNameToCode[
                                                  view.country || "Unknown"
                                                ]
                                              }
                                              label={view.country || "Unknown"}
                                            />
                                          </div>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                          <span className="text-sm font-medium text-foreground truncate">
                                            {formatCountry(
                                              view.country || "Unknown"
                                            )}
                                          </span>
                                          {view.city && (
                                            <span className="text-xs text-muted-foreground truncate">
                                              {view.city}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                      <Badge
                                        variant={
                                          (view.view_duration || 0) > 30
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="font-mono text-xs"
                                      >
                                        {view.view_duration || 0}s
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                      <Badge
                                        variant="outline"
                                        className="text-xs font-medium"
                                      >
                                        {view.referrer
                                          ? formatReferrer(view.referrer)
                                          : "Direct"}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground py-12"
                                  >
                                    <div className="flex flex-col items-center gap-2">
                                      <span className="text-sm">
                                        No views recorded in this time period
                                      </span>
                                      <span className="text-xs">
                                        Change the timeframe to see more data
                                      </span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination Controls for Views */}
                        {analyticsData?.views?.length ? (
                          <PaginationControls
                            currentPage={viewsPage}
                            totalPages={getTotalPages(
                              analyticsData.views.length,
                              viewsPageSize
                            )}
                            pageSize={viewsPageSize}
                            onPageChange={setViewsPage}
                            onPageSizeChange={setViewsPageSize}
                            totalItems={analyticsData.views.length}
                          />
                        ) : null}
                      </CardContent>
                    )}
                  </Card>

                  {/* Recent Interactions Table */}
                  <Card className="mt-6 border-none shadow-sm bg-gradient-to-br from-background to-muted/20">
                    <CardHeader className="border-b border-border/40 bg-gradient-to-r from-var(--chart-2)/5 to-var(--chart-3)/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setShowInteractionsTable(!showInteractionsTable)
                            }
                            className="h-8 w-8 p-0"
                          >
                            {showInteractionsTable ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <div>
                            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                              <MousePointer className="h-5 w-5 text-primary" />
                              Recent Interactions
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                              Last{" "}
                              {timeframe === "1"
                                ? "24 hours"
                                : `${timeframe} days`}{" "}
                              •{analyticsData?.interactions?.length || 0} total
                              interactions
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium"
                        >
                          Page {interactionsPage} of{" "}
                          {getTotalPages(
                            analyticsData?.interactions?.length || 0,
                            interactionsPageSize
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    {showInteractionsTable && (
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-b border-border/40 bg-muted/30 hover:bg-muted/40">
                                <TableHead className="font-semibold text-foreground px-6 py-4">
                                  Date & Time
                                </TableHead>
                                <TableHead className="font-semibold text-foreground px-6 py-4">
                                  Type
                                </TableHead>
                                <TableHead className="font-semibold text-foreground px-6 py-4">
                                  Section
                                </TableHead>
                                <TableHead className="font-semibold text-foreground px-6 py-4">
                                  Value
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {analyticsData?.interactions?.length ? (
                                getPaginatedData(
                                  analyticsData.interactions,
                                  interactionsPage,
                                  interactionsPageSize
                                ).map((interaction, index) => (
                                  <TableRow
                                    key={interaction.id}
                                    className={`
                                      border-b border-border/20 transition-colors hover:bg-muted/40
                                      ${
                                        index % 2 === 0
                                          ? "bg-background"
                                          : "bg-muted/10"
                                      }
                                    `}
                                  >
                                    <TableCell className="px-6 py-4 font-medium">
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium text-foreground">
                                          {new Date(
                                            interaction.clicked_at
                                          ).toLocaleDateString()}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(
                                            interaction.clicked_at
                                          ).toLocaleTimeString()}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                      <Badge
                                        variant={getStatusBadge(
                                          interaction.interaction_type
                                        )}
                                        className="text-xs font-medium capitalize"
                                      >
                                        {interaction.interaction_type}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                      <span className="text-sm text-foreground font-medium">
                                        {interaction.section_name || "-"}
                                      </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                      <div className="max-w-[200px]">
                                        <span className="text-sm text-muted-foreground truncate block">
                                          {interaction.target_value || "-"}
                                        </span>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground py-12"
                                  >
                                    <div className="flex flex-col items-center gap-2">
                                      <span className="text-sm">
                                        No interactions recorded in this time
                                        period
                                      </span>
                                      <span className="text-xs">
                                        Change the timeframe to see more data
                                      </span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination Controls for Interactions */}
                        {analyticsData?.interactions?.length ? (
                          <PaginationControls
                            currentPage={interactionsPage}
                            totalPages={getTotalPages(
                              analyticsData.interactions.length,
                              interactionsPageSize
                            )}
                            pageSize={interactionsPageSize}
                            onPageChange={setInteractionsPage}
                            onPageSizeChange={setInteractionsPageSize}
                            totalItems={analyticsData.interactions.length}
                          />
                        ) : null}
                      </CardContent>
                    )}
                  </Card>
                </>
              )}
            </>
          ) : (
            <Card className="border-none shadow-sm">
              <CardContent className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">
                  {loading ? "Loading analytics..." : "No profile selected"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  title,
  value,
  change,
  data,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  change?: number;
  data: { x: string; y: number }[];
  color: string;
}) {
  const isPositive = (change || 0) > 0;
  const isNegative = (change || 0) < 0;

  return (
    <Card className="border-none shadow-sm bg-card h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2">
          <CardTitle className="flex items-start justify-between text-lg font-medium">
            <div className="flex items-center gap-2 text-card-foreground">
              <div className="p-1 rounded-md flex-shrink-0">
                <div style={{ color }}>{icon}</div>
              </div>
              <span className="truncate">{title}</span>
            </div>
            {typeof change === "number" && change !== 0 && (
              <div
                className={`flex-shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-full ml-2 ${
                  isPositive
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : isNegative
                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isPositive ? "↗" : isNegative ? "↘" : "→"}
                {Math.abs(change)}%
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-3xl font-bold text-foreground">
            {value}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="h-[64px]">
        {/* TinyLineChart */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="x" hide />
            <YAxis hide />
            <Line
              type="monotone"
              dataKey="y"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const id = useId();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/40 px-6 py-4">
      {/* Results per page */}
      <div className="flex items-center gap-3 mb-4 sm:mb-0">
        <label
          htmlFor={id}
          className="text-sm font-medium text-muted-foreground whitespace-nowrap"
        >
          Rows per page:
        </label>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger id={id} className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 25, 50].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation and info combined */}
      <div className="flex items-center gap-4">
        {/* Page info */}
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {startItem}-{endItem}
          </span>{" "}
          of <span className="font-medium text-foreground">{totalItems}</span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Flag({ code, label }: { code?: string; label: string }) {
  // If we have a valid country code
  if (code && code.length === 2) {
    // Convert alpha-2 to Regional Indicator Symbols for emoji flags
    const A = 0x1f1e6;
    const base = "A".charCodeAt(0);
    const chars = code
      .toUpperCase()
      .split("")
      .map((c) => String.fromCodePoint(A + (c.charCodeAt(0) - base)))
      .join("");

    return (
      <div className="flex items-center justify-center w-full h-full overflow-visible">
        <span
          role="img"
          aria-label={label}
          title={label}
          className="text-sm leading-none"
          style={{
            fontSize: "16px",
            lineHeight: 1,
            display: "block",
            textAlign: "center",
          }}
        >
          {chars}
        </span>
      </div>
    );
  }

  // Fallback for unknown country
  return (
    <div className="flex items-center justify-center w-full h-full bg-muted/40">
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full bg-muted-foreground"
        title={label}
      />
    </div>
  );
}

class ResumeService {
  // ... existing code ...

  async getUserResumes(userId: string): Promise<Resume[]> {
    // Implement your logic to fetch user resumes here
    // For example:
    const response = await fetch(`/api/users/${userId}/resumes`);
    const resumes = await response.json();
    return resumes;
  }
}
