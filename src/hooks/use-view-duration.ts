import { useEffect } from 'react';
import { startDurationTracking, isTracking } from '@/lib/analytics/duration-tracker';

/**
 * Hook to track how long a user views a resume
 * Uses a global tracker that persists across React re-renders
 */
export function useViewDuration(resumeId: string, sessionId: string) {
  useEffect(() => {
    // Only start if not already tracking
    if (!isTracking(resumeId, sessionId)) {
      startDurationTracking(resumeId, sessionId);
    }

    // NO cleanup function! Let the tracker persist across re-renders
    // It will be cleaned up via beforeunload or popstate events
  }, [resumeId, sessionId]);
}
