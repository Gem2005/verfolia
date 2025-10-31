/**
 * Global duration tracker that persists across React re-renders
 * Uses a singleton pattern to maintain state outside of React lifecycle
 */

import { trackView } from '@/services/analytics/client-tracking';

interface TrackerState {
  resumeId: string;
  sessionId: string;
  startTime: number;
  accumulatedTime: number;
  isVisible: boolean;
  lastUpdate: number;
  intervalId: NodeJS.Timeout | null;
}

const trackers = new Map<string, TrackerState>();

/**
 * Start tracking duration for a resume view
 */
export function startDurationTracking(resumeId: string, sessionId: string): void {
  const key = `${resumeId}-${sessionId}`;
  
  // If already tracking this combination, don't create a new tracker
  if (trackers.has(key)) {
    return;
  }

  const state: TrackerState = {
    resumeId,
    sessionId,
    startTime: performance.now(),
    accumulatedTime: 0,
    isVisible: !document.hidden,
    lastUpdate: 0,
    intervalId: null,
  };

  // Visibility change handler
  const handleVisibilityChange = () => {
    const tracker = trackers.get(key);
    if (!tracker) return;

    if (document.hidden) {
      if (tracker.isVisible) {
        const elapsed = performance.now() - tracker.startTime;
        tracker.accumulatedTime += elapsed;
        tracker.isVisible = false;
      }
    } else {
      if (!tracker.isVisible) {
        tracker.startTime = performance.now();
        tracker.isVisible = true;
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Set up interval
  state.intervalId = setInterval(() => {
    const tracker = trackers.get(key);
    if (!tracker) {
      if (state.intervalId) clearInterval(state.intervalId);
      return;
    }

    if (!tracker.isVisible) {
      return;
    }

    const currentElapsed = performance.now() - tracker.startTime;
    const totalDuration = tracker.accumulatedTime + currentElapsed;
    const durationSeconds = Math.floor(totalDuration / 1000);

    if (durationSeconds >= 10 && durationSeconds - tracker.lastUpdate >= 10) {
      trackView({
        resumeId: tracker.resumeId,
        sessionId: tracker.sessionId,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        viewDuration: durationSeconds
      }).catch(error => {
        console.error('⏱️ [DurationTracker] Update failed:', error);
      });

      tracker.lastUpdate = durationSeconds;
    }
  }, 15000);

  trackers.set(key, state);

  // Set up cleanup for actual page navigation (not React re-renders)
  const cleanupOnNavigation = () => {
    stopDurationTracking(resumeId, sessionId);
  };

  window.addEventListener('beforeunload', cleanupOnNavigation);
  window.addEventListener('popstate', cleanupOnNavigation);
}

/**
 * Stop tracking and send final duration
 */
export function stopDurationTracking(resumeId: string, sessionId: string): void {
  const key = `${resumeId}-${sessionId}`;
  const tracker = trackers.get(key);
  
  if (!tracker) {
    return;
  }

  // Clear interval
  if (tracker.intervalId) {
    clearInterval(tracker.intervalId);
  }

  // Remove visibility listener
  document.removeEventListener('visibilitychange', () => {});

  // Calculate and send final duration
  const finalElapsed = tracker.isVisible 
    ? performance.now() - tracker.startTime 
    : 0;
  const finalDuration = Math.floor((tracker.accumulatedTime + finalElapsed) / 1000);

  if (finalDuration > 0) {
    trackView({
      resumeId: tracker.resumeId,
      sessionId: tracker.sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewDuration: finalDuration
    }).catch(error => {
      console.error('⏱️ [DurationTracker] Final update failed:', error);
    });
  }

  // Remove from map
  trackers.delete(key);
}

/**
 * Check if currently tracking
 */
export function isTracking(resumeId: string, sessionId: string): boolean {
  return trackers.has(`${resumeId}-${sessionId}`);
}
