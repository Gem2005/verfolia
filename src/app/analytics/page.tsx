"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { useAnalyticsCalculations } from "@/hooks/use-analytics-calculations";
import { AnalyticsSkeletonLoading } from "@/components/analytics/SkeletonLoading";
import { Button } from "@/components/ui/button";
import {
  ResumeSelector,
  TimeframeSelector,
  OverviewMetricsSection,
  AnalyticsInsightsSection,
  ChartsGridSection,
  DetailedDataSection,
  EmptyState,
} from "@/components/analytics";
import { FileQuestion, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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
    <div className="container mx-auto py-8 space-y-6">
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
  );
}
