"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/use-auth";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { useAnalyticsCalculations } from "@/hooks/use-analytics-calculations";
import { AnalyticsSkeletonLoading } from "@/components/analytics/SkeletonLoading";
import { AnimatedBackground } from "@/components/layout/animated-background";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
// Import only lightweight components directly to avoid pulling in charts
import { ResumeSelector } from "@/components/analytics/ResumeSelector";
import { TimeframeSelector } from "@/components/analytics/TimeframeSelector";
import { OverviewMetricsSection } from "@/components/analytics/OverviewMetricsSection";
import { AnalyticsInsightsSection } from "@/components/analytics/AnalyticsInsightsSection";
import { EmptyState } from "@/components/analytics/EmptyState";
import { FileQuestion, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
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
  const router = useRouter();
  
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

  // Refresh function - only refreshes data without page reload
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

  // Show loading state while data is being fetched
  const isLoadingData = loading || isRefreshing;

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ECF0F1] via-white to-[#ECF0F1] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AnimatedBackground />
        <div className="container mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
          <AnalyticsSkeletonLoading />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ECF0F1] via-white to-[#ECF0F1] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 sm:p-8">
        <AnimatedBackground />
        <div className="container mx-auto max-w-2xl relative z-20">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-[#3498DB]/20 shadow-2xl shadow-[#3498DB]/20 p-6 sm:p-12">
            <EmptyState
              icon={AlertCircle}
              title="Authentication Required"
              description="Please sign in to view your resume analytics."
            />
          </div>
        </div>
      </div>
    );
  }

  // No resumes found
  if (!resumes || resumes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ECF0F1] via-white to-[#ECF0F1] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AnimatedBackground />
        
        {/* Header */}
        <div className="sticky top-0 z-30 border-b border-[#3498DB]/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm">
          <div className="container mx-auto py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="group flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#2C3E50] dark:text-white rounded-lg hover:border-[#3498DB] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-sm"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 relative z-20">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C3E50] dark:text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
              Track views, interactions, and engagement metrics for your resumes
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-[#3498DB]/20 shadow-2xl shadow-[#3498DB]/20 p-6 sm:p-12">
            <EmptyState
              icon={FileQuestion}
              title="No Resumes Found"
              description="Create your first resume to start tracking analytics and gain insights into how viewers engage with your content."
            />
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#ECF0F1] via-white to-[#ECF0F1] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AnimatedBackground />
      
      {/* Header Section with Gradient Background */}
      <div className="sticky top-0 z-30 border-b border-[#3498DB]/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
          {/* Mobile Layout */}
          <div className="sm:hidden space-y-3">
            {/* Top Row: Back Button + Refresh */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="group flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#2C3E50] dark:text-white rounded-lg hover:border-[#3498DB] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-sm"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="font-medium">Back</span>
              </button>
              
              {selectedResume && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing || loading}
                  className="border-[#3498DB]/40 text-[#3498DB] hover:bg-[#3498DB]/5 hover:border-[#3498DB] transition-all duration-200"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
            
            {/* Bottom Row: Title */}
            <div>
              <h1 className="text-xl font-bold text-[#2C3E50] dark:text-white">
                Analytics Dashboard
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Track engagement metrics in real-time
              </p>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between gap-6">
            {/* Left Side: Back + Title */}
            <div className="flex items-center gap-4 lg:gap-6 flex-1 min-w-0">
              <button
                onClick={() => router.push('/dashboard')}
                className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#2C3E50] dark:text-white rounded-lg hover:border-[#3498DB] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="font-medium">Back</span>
              </button>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-[#2C3E50] dark:text-white">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                  Track views, interactions, and engagement metrics in real-time
                </p>
              </div>
            </div>

            {/* Right Side: Refresh Button */}
            {selectedResume && (
              <Button
                variant="outline"
                size="default"
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
                className="border-[#3498DB]/40 text-[#3498DB] hover:bg-[#3498DB]/5 hover:border-[#3498DB] transition-all duration-200 flex-shrink-0"
              >
                <RefreshCw className={`h-4 w-4 mr-2 transition-transform group-hover:rotate-180 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="font-medium">Refresh Data</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 lg:space-y-8 relative z-20">
        {/* Resume Selection Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-[#3498DB]/20 shadow-xl shadow-[#3498DB]/10 p-4 sm:p-6">
          <ResumeSelector
            resumes={resumes}
            selectedResumeId={selectedResume}
            onResumeChange={setSelectedResume}
          />
        </div>

        {/* Show loading or content */}
        {loading ? (
          <AnalyticsSkeletonLoading />
        ) : !analyticsData || !selectedResume ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-[#3498DB]/20 shadow-xl shadow-[#3498DB]/10 p-6 sm:p-12">
            <EmptyState
              icon={FileQuestion}
              title="Select a Resume"
              description="Choose a resume from the dropdown above to view its analytics and engagement metrics."
            />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Overview Metrics Grid */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2C3E50] dark:text-white flex items-center gap-2 sm:gap-3">
                  <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-gradient-to-r from-[#2C3E50] to-[#3498DB] rounded-full"></div>
                  <span className="truncate">Performance Overview</span>
                </h2>
                <TimeframeSelector
                  selectedTimeframe={timeframe}
                  onTimeframeChange={(value) => setTimeframe(value)}
                  compact
                />
              </div>
              {isLoadingData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-[#3498DB]/20 p-6 h-32 animate-pulse" />
                  ))}
                </div>
              ) : (
                <OverviewMetricsSection calculations={calculations} />
              )}
            </div>

            {/* Charts Grid */}
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2C3E50] dark:text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-gradient-to-r from-[#2C3E50] to-[#3498DB] rounded-full"></div>
                <span className="truncate">Visual Analytics</span>
              </h2>
              {isLoadingData ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2 h-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-[#3498DB]/20 animate-pulse" />
                  <div className="h-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-[#3498DB]/20 animate-pulse" />
                  <div className="h-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-[#3498DB]/20 animate-pulse" />
                </div>
              ) : (
                <ChartsGridSection calculations={calculations} />
              )}
            </div>

            {/* Detailed Data Tables */}
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2C3E50] dark:text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-gradient-to-r from-[#2C3E50] to-[#3498DB] rounded-full"></div>
                <span className="truncate">Detailed Reports</span>
              </h2>
              {isLoadingData ? (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-[#3498DB]/20 p-8 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="h-8 w-8 animate-spin text-[#3498DB]" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Refreshing data...</p>
                  </div>
                </div>
              ) : (
                <DetailedDataSection analyticsData={analyticsData} />
              )}
            </div>

            {/* Key Insights */}
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2C3E50] dark:text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-gradient-to-r from-[#2C3E50] to-[#3498DB] rounded-full"></div>
                <span className="truncate">Key Insights</span>
              </h2>
              {isLoadingData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-[#3498DB]/20 p-6 h-48 animate-pulse" />
                  ))}
                </div>
              ) : (
                <AnalyticsInsightsSection calculations={calculations} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
