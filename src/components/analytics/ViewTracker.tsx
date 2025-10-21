import { resumeService } from "@/services/resume-service";
import React, { useEffect, useState, useRef } from "react";

interface ViewTrackerProps {
  resumeId: string;
}

// Global map to track which resumes have been viewed in this session
// This prevents duplicate tracking even if component remounts
const globalViewTracker = new Map<string, boolean>();

export const ViewTracker: React.FC<ViewTrackerProps> = ({ resumeId }) => {
  const [startTime] = useState<number>(Date.now());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Track the view when component mounts (only once per page load)
  useEffect(() => {
    const trackView = async () => {
      // Check global map to prevent any duplicate tracking
      if (globalViewTracker.has(resumeId)) {
        return;
      }
      
      // Mark as tracked immediately to prevent race conditions
      globalViewTracker.set(resumeId, true);

      try {
        await resumeService.trackResumeView(resumeId);
      } catch (error) {
        console.error("❌ Error tracking view:", error);
        // Remove from map on error so it can retry
        globalViewTracker.delete(resumeId);
      }
    };

    trackView();
  }, [resumeId]);

  // Track view duration with periodic updates and final update on unmount
  useEffect(() => {
    const updateDuration = () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      if (duration > lastUpdateRef.current && duration > 0) {
        lastUpdateRef.current = duration;
        resumeService.updateViewDuration(resumeId, duration);
      }
    };

    // Update duration every 10 seconds while user is on the page
    updateIntervalRef.current = setInterval(updateDuration, 10000);

    // Set up event listeners for when user leaves the page
    const handleBeforeUnload = () => {
      updateDuration();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Clear interval
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      
      // Remove event listener
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Final duration update on unmount
      updateDuration();
    };
  }, [resumeId, startTime]);

  // This component doesn't render anything, but we can add a hidden element for testing
  return (
    <div
      data-analytics="view-tracker"
      data-resume-id={resumeId}
      style={{ display: "none" }}
    />
  );
};
