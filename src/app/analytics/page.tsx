"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/use-auth";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { useAnalyticsCalculations } from "@/hooks/use-analytics-calculations";
import { AnalyticsSkeletonLoading } from "@/components/analytics/SkeletonLoading";
import { AnimatedBackground } from "@/components/layout/animated-background";
import { Button } from "@/components/ui/button";
// Import only lightweight components directly to avoid pulling in charts
import { ResumeSelector } from "@/components/analytics/ResumeSelector";
import { TimeframeSelector } from "@/components/analytics/TimeframeSelector";
import { OverviewMetricsSection } from "@/components/analytics/OverviewMetricsSection";
import { AnalyticsInsightsSection } from "@/components/analytics/AnalyticsInsightsSection";
import { EmptyState } from "@/components/analytics/EmptyState";
import { FileQuestion, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Lazy load heavy chart sections - only load when analytics data is available
const ChartsGridSection = dynamic(
  () => import("@/components/analytics/ChartsGridSection").then((mod) => ({ default: mod.ChartsGridSection })),
  {
    loading: () => (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2 h-80 bg-gray-50 animate-pulse rounded-lg"></div>
        <div className="md:col-span-2 h-80 bg-gray-50 animate-pulse rounded-lg"></div>
      </div>
    ),
    ssr: false,
  }
);

const DetailedDataSection = dynamic(
  () => import("@/components/analytics/DetailedDataSection").then((mod) => ({ default: mod.DetailedDataSection })),
  {
    loading: () => (
      <div className="h-96 bg-gray-50 animate-pulse rounded-lg"></div>
    ),
    ssr: false,
  }
);

export default function AnalyticsPage() {
  // Local state for refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Authentication
  const { user, loading: authLoading } = useAuth();

  // Analytics data and state management
  const {
    resumes,
    selectedResume,
    setSelectedResume,
    analyticsData,
    loading,
    timeframe,
    setTimeframe,
    refetch,
  } = useAnalyticsData(user, authLoading);

  // Calculations derived from analytics data
  const calculations = useAnalyticsCalculations(analyticsData, timeframe);

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Analytics data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing analytics:", error);
      toast.error("Failed to refresh analytics data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8">
        <AnalyticsSkeletonLoading />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <EmptyState
          icon={AlertCircle}
          title="Authentication Required"
          description="Please sign in to view your resume analytics."
        />
      </div>
    );
  }

  // No resumes found
  if (!resumes || resumes.length === 0) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track views, interactions, and engagement metrics for your resumes
          </p>
        </div>

        <EmptyState
          icon={FileQuestion}
          title="No Resumes Found"
          description="Create your first resume to start tracking analytics and gain insights into how viewers engage with your content."
        />
      </div>
    );
  }

  // Main content
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto py-8 space-y-6 relative z-20">
      {/* Page Header with Refresh Button */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track views, interactions, and engagement metrics for your resumes
          </p>
        </div>
        {selectedResume && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All Data
          </Button>
        )}
      </div>

      {/* Resume Selection */}
      <ResumeSelector
        resumes={resumes}
        selectedResumeId={selectedResume}
        onResumeChange={setSelectedResume}
      />

      {/* Show loading or content */}
      {loading ? (
        <AnalyticsSkeletonLoading />
      ) : !analyticsData || !selectedResume ? (
        <EmptyState
          icon={FileQuestion}
          title="Select a Resume"
          description="Choose a resume from the dropdown above to view its analytics and engagement metrics."
        />
      ) : (
        <>
          {/* Timeframe Selection */}
          <TimeframeSelector
            selectedTimeframe={timeframe}
            onTimeframeChange={(value) => setTimeframe(value)}
          />

          {/* Overview Metrics Grid */}
          <OverviewMetricsSection calculations={calculations} />

          {/* Key Insights */}
          <AnalyticsInsightsSection calculations={calculations} />

          {/* Charts Grid */}
          <ChartsGridSection calculations={calculations} />

          {/* Detailed Data Tables */}
          <DetailedDataSection 
            analyticsData={analyticsData} 
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </>
      )}
      </div>
    </div>
  );
}
