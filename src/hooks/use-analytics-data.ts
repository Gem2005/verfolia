import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { resumeService } from "@/services/resume-service";
import type { Resume } from "@/services/resume-service";
import type { AnalyticsData, TimeframeOption } from "@/types/analytics";
import { processAnalyticsData } from "@/lib/analytics/dataTransformers";

export function useAnalyticsData(user: unknown, authLoading: boolean) {
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("resumeId");
  
  const [selectedResume, setSelectedResume] = useState<string | null>(resumeIdParam);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<TimeframeOption>("1");
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Load resumes for authenticated user
  useEffect(() => {
    const loadResumes = async () => {
      if (!user || authLoading) return;

      try {
        setLoading(true);
        const userId = (user as { id: string }).id;
        const userResumes = await resumeService.getUserResumes(userId);
        
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

  // Load analytics data when resume or timeframe changes
  const loadAnalytics = useCallback(async (resumeId: string, days: string) => {
    try {
      setLoading(true);

      // Update URL without causing page reload - use replaceState directly
      if (typeof window !== 'undefined') {
        const currentUrlResumeId = new URLSearchParams(window.location.search).get("resumeId");
        if (currentUrlResumeId !== resumeId) {
          const url = new URL(window.location.href);
          url.searchParams.set("resumeId", resumeId);
          window.history.replaceState({}, "", url.toString());
        }
      }

      // Convert timeframe to proper days for backend query
      const queryDays = parseInt(days);
      const data = await resumeService.getResumeAnalytics(resumeId, queryDays);

      // Process and validate the data
      const processedData = processAnalyticsData(data);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error("Error loading analytics:", error);
      // Set analytics data to a default empty state
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
  }, []);

  useEffect(() => {
    if (selectedResume && initialLoadDone) {
      loadAnalytics(selectedResume, timeframe);
    }
  }, [selectedResume, timeframe, initialLoadDone, loadAnalytics]);

  const handleTimeframeChange = useCallback((days: TimeframeOption) => {
    setTimeframe(days);
  }, []);

  const refetch = useCallback(async () => {
    if (selectedResume) {
      await loadAnalytics(selectedResume, timeframe);
    }
  }, [selectedResume, timeframe, loadAnalytics]);

  return {
    resumes,
    selectedResume,
    setSelectedResume,
    analyticsData,
    loading,
    timeframe,
    setTimeframe: handleTimeframeChange,
    initialLoadDone,
    refetch,
  };
}
