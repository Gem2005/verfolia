"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { resumeService, type Resume } from "@/services/resume-service";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  EyeIcon,
  MousePointerClickIcon,
} from "lucide-react";

interface View {
  id: string;
  viewed_at: string;
  country?: string;
  city?: string;
  view_duration?: number;
  referrer?: string;
}
interface Interaction {
  id: string;
  clicked_at: string;
  interaction_type: string;
  section_name?: string;
  target_value?: string;
}
interface CountryView {
  name: string;
  count: number;
}
interface ReferrerView {
  name: string;
  count: number;
}
interface DateView {
  date: string;
  count: number;
}

interface InteractionType {
  name: string;
  count: number;
}

interface AnalyticsData {
  views: View[];
  interactions: Interaction[];
  summary: {
    totalViews: number;
    totalInteractions: number;
    avgViewDuration: number;
    viewsByDate: DateView[];
    interactionsByType: InteractionType[];
    viewsByCountry: CountryView[];
    viewsByReferrer: ReferrerView[];
  };
}

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
  const [timeframe, setTimeframe] = useState<"7" | "30" | "90">("30");

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

      const data = await resumeService.getResumeAnalytics(
        resumeId,
        parseInt(days)
      );
      // Type cast the data to ensure count properties are numbers
      const typedData: AnalyticsData = {
        ...data,
        summary: {
          ...data.summary,
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
      setAnalyticsData(typedData);
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

  const handleTimeframeChange = useCallback((days: "7" | "30" | "90") => {
    setTimeframe(days);
    // Analytics will be loaded automatically by the useEffect that watches timeframe
  }, []);

  // Colors for charts
  const COLORS = useMemo(
    () => [
      "#6e56cf",
      "#22c55e",
      "#3b82f6",
      "#f97316",
      "#8b5cf6",
      "#ec4899",
      "#14b8a6",
      "#f43f5e",
    ],
    []
  );

  // Format country name for better display
  const formatCountry = useCallback((country: string) => {
    if (!country || country === "Unknown") return "Unknown";
    if (country.length > 15) return country.slice(0, 12) + "...";
    return country;
  }, []);

  // Format referrer for better display
  const formatReferrer = useCallback((referrer: string) => {
    if (!referrer || referrer === "Unknown") return "Direct";
    try {
      const url = new URL(referrer);
      return url.hostname;
    } catch {
      return referrer.slice(0, 15) + (referrer.length > 15 ? "..." : "");
    }
  }, []);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resume Analytics</h1>

      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Remove the Resume Selector card and use full width for analytics */}

        {/* Analytics Content */}
        <div className="col-span-1">
          {selectedResume ? (
            <>
              {/* Timeframe Selector */}
              <div className="mb-6">
                <Tabs
                  defaultValue={timeframe}
                  onValueChange={(v) =>
                    handleTimeframeChange(v as "7" | "30" | "90")
                  }
                >
                  <TabsList>
                    <TabsTrigger value="7">Last 7 Days</TabsTrigger>
                    <TabsTrigger value="30">Last 30 Days</TabsTrigger>
                    <TabsTrigger value="90">Last 90 Days</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* No Data Display */}
              {!analyticsData ||
              (analyticsData.summary.totalViews === 0 &&
                analyticsData.summary.totalInteractions === 0) ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="flex flex-col items-center justify-center gap-4">
                      <EyeIcon className="h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-semibold">
                        No Analytics Data Available
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        This resume hasn&apos;t received any views or
                        interactions in the selected time period. Share your
                        resume with others to start collecting analytics.
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
                            alert("Resume URL copied to clipboard!");
                          }
                        }}
                      >
                        Copy Resume Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg font-medium">
                          <EyeIcon className="h-5 w-5 text-primary" />
                          Total Views
                        </CardTitle>
                        <CardDescription className="text-3xl font-bold">
                          {analyticsData?.summary?.totalViews || 0}
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg font-medium">
                          <MousePointerClickIcon className="h-5 w-5 text-primary" />
                          Total Interactions
                        </CardTitle>
                        <CardDescription className="text-3xl font-bold">
                          {analyticsData?.summary?.totalInteractions || 0}
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg font-medium">
                          <ClockIcon className="h-5 w-5 text-primary" />
                          Avg. View Duration
                        </CardTitle>
                        <CardDescription className="text-3xl font-bold">
                          {analyticsData?.summary?.avgViewDuration || 0}s
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Views Over Time */}
                    <Card className="col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5" />
                          Views Over Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-80">
                        {analyticsData?.summary?.viewsByDate?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData.summary.viewsByDate}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis allowDecimals={false} />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#6e56cf"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">
                              No view data available for this time period
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Interactions by Type */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MousePointerClickIcon className="h-5 w-5" />
                          Interactions by Type
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-80">
                        {analyticsData?.summary?.interactionsByType?.length >
                        0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.summary.interactionsByType}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="name"
                                label={({ name }) => name}
                              >
                                {analyticsData.summary.interactionsByType.map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  )
                                )}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">
                              No interaction data available
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Visitors by Country */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ExternalLinkIcon className="h-5 w-5" />
                          Visitors by Country
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-80">
                        {analyticsData?.summary?.viewsByCountry?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.summary.viewsByCountry}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="name"
                                label={({ name }) => formatCountry(name)}
                              >
                                {analyticsData.summary.viewsByCountry.map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  )
                                )}
                              </Pie>
                              <Tooltip
                                formatter={(value, name) => [
                                  value,
                                  formatCountry(name as string),
                                ]}
                              />
                              <Legend
                                formatter={(value) => formatCountry(value)}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">
                              No location data available
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Traffic Sources */}
                    <Card className="col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ExternalLinkIcon className="h-5 w-5" />
                          Traffic Sources
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-80">
                        {analyticsData?.summary?.viewsByReferrer?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={analyticsData.summary.viewsByReferrer}
                              layout="vertical"
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis
                                type="category"
                                dataKey="name"
                                width={100}
                                tickFormatter={formatReferrer}
                              />
                              <Tooltip
                                formatter={(value, name, props) => [
                                  value,
                                  formatReferrer(props.payload.name),
                                ]}
                              />
                              <Bar dataKey="count" fill="#6e56cf" />
                            </BarChart>
                          </ResponsiveContainer>
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
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Recent Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Date & Time
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Location
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Duration
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Source
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {analyticsData?.views?.length > 0 ? (
                              analyticsData.views.slice(0, 10).map((view) => (
                                <tr key={view.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                    {new Date(view.viewed_at).toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {view.country || "Unknown"}
                                    {view.city ? `, ${view.city}` : ""}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {view.view_duration || 0}s
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {view.referrer
                                      ? formatReferrer(view.referrer)
                                      : "Direct"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300"
                                >
                                  No views recorded in this time period
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Interactions Table */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Recent Interactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Date & Time
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Section
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {analyticsData?.interactions?.length > 0 ? (
                              analyticsData.interactions
                                .slice(0, 10)
                                .map((interaction) => (
                                  <tr key={interaction.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                      {new Date(
                                        interaction.clicked_at
                                      ).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                      {interaction.interaction_type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                      {interaction.section_name || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                      {interaction.target_value || "-"}
                                    </td>
                                  </tr>
                                ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300"
                                >
                                  No interactions recorded in this time period
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">
                  {loading ? "Loading analytics..." : "No resume selected"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
