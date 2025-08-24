import { useEffect, useRef, useState } from 'react';
import { analyticsService } from '@/services/analytics-service';

interface UseScrollTrackingProps {
  resumeId: string;
  sectionName?: string;
  threshold?: number; // percentage of scroll at which to trigger tracking
  debounceMs?: number; // debounce time in milliseconds
}

export function useScrollTracking({
  resumeId,
  sectionName,
  threshold = 90,
  debounceMs = 1000
}: UseScrollTrackingProps) {
  const [hasTracked, setHasTracked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleScroll = (element: HTMLElement) => {
    if (hasTracked) return;

    const scrollPercentage = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;

    if (scrollPercentage >= threshold) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        analyticsService.trackResumeInteraction(
          resumeId,
          'scroll_complete',
          `${Math.round(scrollPercentage)}%`,
          sectionName
        );
        setHasTracked(true);
      }, debounceMs);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onScroll: (e: React.UIEvent<HTMLElement>) => handleScroll(e.currentTarget),
    hasTracked
  };
}
