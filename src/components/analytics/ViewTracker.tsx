import { resumeService } from "@/services/resume-service";
import React, { useEffect, useState } from "react";

interface ViewTrackerProps {
  resumeId: string;
}

export const ViewTracker: React.FC<ViewTrackerProps> = ({ resumeId }) => {
  const [startTime] = useState<number>(Date.now());

  // Track the view when component mounts
  useEffect(() => {
    const trackView = async () => {
      try {
        await resumeService.trackResumeView(resumeId);
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };

    trackView();
  }, [resumeId]);

  // Track the view duration when the component unmounts or when the user leaves the page
  useEffect(() => {
    const trackDuration = () => {
      const duration = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
      if (duration > 0) {
        resumeService.updateViewDuration(resumeId, duration);
      }
    };

    // Set up event listeners for when user leaves the page
    window.addEventListener("beforeunload", trackDuration);

    return () => {
      window.removeEventListener("beforeunload", trackDuration);
      trackDuration(); // Also track when component unmounts
    };
  }, [resumeId, startTime]);

  // This component doesn't render anything
  return null;
};
